import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { stripeEvents, users, orderRequests, OrderStatus } from '@/lib/db/schema';
import { and, eq, or, sql } from 'drizzle-orm';
import { sendEmail, getEmailTemplate, emailComponents } from '@/lib/email';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const webhookSecretTest = process.env.STRIPE_WEBHOOK_SECRET_TEST;

export async function POST(request: NextRequest) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  if (!webhookSecret && !webhookSecretTest) {
    console.error('Missing Stripe webhook secret(s)');
    return NextResponse.json(
      { error: 'Webhook secret not configured.' },
      { status: 500 }
    );
  }

  try {
    // Accept both live and test webhook secrets so test-mode payments on production domains work.
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret || webhookSecretTest!
    );
  } catch (err) {
    if (!webhookSecretTest) {
      console.error('Webhook signature verification failed.', err);
      return NextResponse.json(
        { error: 'Webhook signature verification failed.' },
        { status: 400 }
      );
    }

    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecretTest
      );
    } catch (testErr) {
      console.error('Webhook signature verification failed (test secret).', testErr);
      return NextResponse.json(
        { error: 'Webhook signature verification failed.' },
        { status: 400 }
      );
    }
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
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;

      // Idempotency check
      const alreadyHandled = await db
        .select({ id: stripeEvents.id })
        .from(stripeEvents)
        .where(
          or(
            eq(stripeEvents.eventId, event.id),
            eq(stripeEvents.checkoutSessionId, sessionId)
          )
        )
        .limit(1);

      if (alreadyHandled.length > 0) {
        console.log('Event already processed (idempotent):', event.id);
        return NextResponse.json({ received: true, idempotent: true });
      }

      // Validate payment
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

      // Get orderRequestId from metadata
      const orderRequestId = session.metadata?.orderRequestId;
      const productType = session.metadata?.productType;

      if (!orderRequestId) {
        console.warn('Missing orderRequestId in session metadata');
        break;
      }

      const orderIdNum = Number(orderRequestId);
      if (Number.isNaN(orderIdNum)) {
        console.warn('Invalid orderRequestId in metadata', orderRequestId);
        break;
      }

      // Find OrderRequest
      const [order] = await db
        .select()
        .from(orderRequests)
        .where(eq(orderRequests.id, orderIdNum))
        .limit(1);

      if (!order) {
        console.error('OrderRequest not found:', orderIdNum);
        break;
      }

      if (!order.stripeSessionId) {
        console.error('OrderRequest missing Stripe session reference:', orderIdNum);
        break;
      }

      if (order.stripeSessionId !== sessionId) {
        console.error('Stripe session mismatch for order', {
          orderId: orderIdNum,
          expected: order.stripeSessionId,
          received: sessionId
        });
        break;
      }

      const sessionEmail = (session.customer_details?.email || session.customer_email || '').toLowerCase();
      if (order.customerEmail && sessionEmail && order.customerEmail.toLowerCase() !== sessionEmail) {
        console.error('Customer email mismatch for order', {
          orderId: orderIdNum,
          orderEmail: order.customerEmail,
          sessionEmail
        });
        break;
      }

      if (
        order.userId &&
        session.metadata?.userId &&
        order.userId.toString() !== session.metadata.userId
      ) {
        console.error('User mismatch for order metadata', {
          orderId: orderIdNum,
          orderUserId: order.userId,
          metadataUserId: session.metadata.userId
        });
        break;
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        console.warn('Order already processed, skipping status update', {
          orderId: orderIdNum,
          status: order.status
        });
        break;
      }

      // Update OrderRequest to PAID status + record Stripe event
      await db.transaction(async (tx) => {
        // Record event for idempotency
        await tx.insert(stripeEvents).values({
          eventId: event.id,
          checkoutSessionId: sessionId,
          type: event.type,
          productType: productType || null,
          userId: order.userId || null
        });

        // Update order status
        const [updatedOrder] = await tx
          .update(orderRequests)
          .set({
            status: OrderStatus.PAID,
            stripePaymentIntentId: session.payment_intent as string || null,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(orderRequests.id, orderIdNum),
              eq(orderRequests.status, OrderStatus.PENDING_PAYMENT)
            )
          )
          .returning({ id: orderRequests.id });

        if (!updatedOrder) {
          throw new Error(`Order ${orderIdNum} not updated - status changed during processing`);
        }
      });

      console.log('OrderRequest updated to PAID:', orderIdNum);

      // Send confirmation email asynchronously (don't block webhook response)
      const dashboardUrl = `${process.env.BASE_URL}/dashboard/orders`;
      const { p, h2, ol, infoBox } = emailComponents;
      
      const bodyContent = `
        ${p(`Hallo ${order.customerName || 'liebe/r Kunde/in'},`)}
        ${p('vielen Dank für deinen Kauf bei Karriereadler. Deine Zahlung wurde erfolgreich verarbeitet.')}
        ${infoBox('<strong>Wichtig: Bitte fülle jetzt den Fragebogen aus.</strong><br/>Damit wir mit der Erstellung deiner Bewerbungsunterlagen beginnen können, benötigen wir noch einige Informationen von dir.', 'info')}
        ${p('<strong>Nächste Schritte:</strong>')}
        ${ol(['Gehe zu deinem Dashboard', 'Öffne den Bereich "Aufträge abschließen"', 'Fülle den Fragebogen vollständig aus'])}
        ${p('Sobald wir deinen ausgefüllten Fragebogen erhalten haben, beginnen wir sofort mit der professionellen Erstellung deiner Unterlagen.', 'margin-top: 24px;')}
        ${p('Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.')}
        ${p('Viele Grüße,<br/>Dein Karriereadler-Team')}
      `;
      
      sendEmail({
        to: order.customerEmail,
        subject: 'Zahlung bestätigt - Fragebogen ausfüllen | Karriereadler',
        html: getEmailTemplate({
          title: 'Zahlung bestätigt',
          body: bodyContent,
          buttonText: 'Zum Dashboard - Fragebogen ausfüllen',
          buttonUrl: dashboardUrl
        })
      }).catch(emailError => {
        console.error('Failed to send customer confirmation email:', emailError);
        // Don't break the webhook - email is not critical
      });
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
  } catch (error) {
    // CRITICAL: Log webhook processing failures for manual recovery
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('CRITICAL: Stripe webhook processing failed', {
      eventId: event?.id,
      eventType: event?.type,
      error: errorMessage,
      stack: errorStack
    });

    // Send alert email for critical webhook failures
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
    if (adminEmail) {
      const { p, infoBox } = emailComponents;
      const bodyContent = `
        ${p('A critical Stripe webhook processing error occurred.')}
        ${infoBox(`<strong>Event ID:</strong> ${event?.id || 'unknown'}<br/><strong>Event Type:</strong> ${event?.type || 'unknown'}`, 'warning')}
        ${p(`<strong>Error:</strong> ${errorMessage}`)}
        ${errorStack ? `<pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; font-size: 12px; overflow-x: auto;">${errorStack}</pre>` : ''}
        ${p('Please investigate this issue immediately. Stripe will retry the webhook automatically.')}
      `;

      sendEmail({
        to: adminEmail,
        subject: `[CRITICAL] Stripe Webhook Failed - ${event?.type || 'Unknown Event'}`,
        html: getEmailTemplate({
          title: 'Stripe Webhook Error',
          body: bodyContent
        })
      }).catch(emailErr => {
        console.error('Failed to send webhook error alert email:', emailErr);
      });
    }

    // Return 500 so Stripe will retry the webhook
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
