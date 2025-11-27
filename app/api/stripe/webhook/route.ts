import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { stripeEvents, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed.' },
      { status: 400 }
    );
  }

  // Wrap entire webhook processing in try-catch for critical error alerting
  try {

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
      break;
    }
    case 'checkout.session.completed': {
      const alreadyHandled = await db
        .select({ id: stripeEvents.id })
        .from(stripeEvents)
        .where(eq(stripeEvents.eventId, event.id))
        .limit(1);

      if (alreadyHandled.length > 0) {
        return NextResponse.json({ received: true, idempotent: true });
      }

      const session = event.data.object as Stripe.Checkout.Session;
      if (
        session.payment_status !== 'paid' ||
        (session.mode && session.mode !== 'payment')
      ) {
        console.warn('Skipping session without paid status/mode payment', {
          payment_status: session.payment_status,
          mode: session.mode
        });
        break;
      }

      const productType = session.metadata?.productType as
        | 'cv'
        | 'letter'
        | 'bundle'
        | undefined;
      const userId = session.metadata?.userId;

      if (!productType || !userId) {
        console.warn('Missing metadata on checkout.session.completed');
        break;
      }

      const userIdNum = Number(userId);
      if (Number.isNaN(userIdNum)) {
        console.warn('Invalid userId in session metadata', userId);
        break;
      }

      // Credit allocation matches marketing copy:
      // - CV: 1 Lebenslauf
      // - Letter: 2 Anschreiben (zwei individuelle Anschreiben)
      // - Bundle: 1 Lebenslauf + 2 Anschreiben
      const creditUpdates: Record<
        string,
        { cvCredits?: number; letterCredits?: number }
      > = {
        cv: { cvCredits: 1 },
        letter: { letterCredits: 2 },
        bundle: { cvCredits: 1, letterCredits: 2 }
      };

      const increments = creditUpdates[productType];
      if (!increments) {
        console.warn('Unknown productType in metadata', productType);
        break;
      }

      await db.transaction(async (tx) => {
        await tx.insert(stripeEvents).values({
          eventId: event.id,
          type: event.type,
          productType,
          userId: userIdNum
        });

        await tx
          .update(users)
          .set({
            ...(increments.cvCredits
              ? { cvCredits: sql`${users.cvCredits} + ${increments.cvCredits}` }
              : {}),
            ...(increments.letterCredits
              ? {
                  letterCredits: sql`${users.letterCredits} + ${increments.letterCredits}`
                }
              : {})
          })
          .where(eq(users.id, userIdNum));
      });

      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
  } catch (error) {
    // CRITICAL: Log webhook processing failures for manual recovery
    console.error('CRITICAL: Stripe webhook processing failed', {
      eventId: event?.id,
      eventType: event?.type,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // TODO: Add Sentry.captureException(error) or email notification for production alerting

    // Return 500 so Stripe will retry the webhook
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
