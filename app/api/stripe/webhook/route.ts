import Stripe from 'stripe';
import { handleSubscriptionChange, stripe } from '@/lib/payments/stripe';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { stripeEvents, users, orderRequests, OrderStatus } from '@/lib/db/schema';
import { and, eq, or, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

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

      // Send confirmation email to customer
      try {
        const dashboardUrl = `${process.env.BASE_URL}/dashboard/orders`;
        await sendEmail({
          to: order.customerEmail,
          subject: 'Zahlung bestätigt - Fragebogen ausfüllen | Karriereadler',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
                  .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                  .header { background: linear-gradient(to bottom, #FFAFC1, #FF9A8B); padding: 30px; text-align: center; color: white; }
                  .header img { display: block; margin: 0 auto 20px; width: 180px; height: auto; }
                  .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
                  .content { padding: 40px 30px; }
                  .button { display: inline-block; background: #F76B6B; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0; }
                  .info-box { background: #FFE4E8; border-left: 4px solid #FFB6C1; padding: 16px; margin: 24px 0; border-radius: 4px; }
                  .info-box p { color: #D84949; margin: 8px 0; }
                  .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <img src="${process.env.BASE_URL}/logo_adler_notagline.png" alt="Karriereadler" />
                    <h1>Zahlung bestätigt</h1>
                  </div>
                  <div class="content">
                    <p>Hallo ${order.customerName || 'liebe/r Kunde/in'},</p>
                    <p>vielen Dank für deinen Kauf bei Karriereadler. Deine Zahlung wurde erfolgreich verarbeitet.</p>

                    <div class="info-box">
                      <p><strong>Wichtig: Bitte fülle jetzt den Fragebogen aus.</strong></p>
                      <p>Damit wir mit der Erstellung deiner Bewerbungsunterlagen beginnen können, benötigen wir noch einige Informationen von dir.</p>
                    </div>

                    <p><strong>Nächste Schritte:</strong></p>
                    <ol>
                      <li>Gehe zu deinem Dashboard</li>
                      <li>Öffne den Bereich "Aufträge abschließen"</li>
                      <li>Fülle den Fragebogen vollständig aus</li>
                    </ol>

                    <div style="text-align: center;">
                      <a href="${dashboardUrl}" class="button">Zum Dashboard - Fragebogen ausfüllen</a>
                    </div>

                    <p style="margin-top: 30px;">Sobald wir deinen ausgefüllten Fragebogen erhalten haben, beginnen wir sofort mit der professionellen Erstellung deiner Unterlagen.</p>

                    <p>Bei Fragen stehen wir dir jederzeit gerne zur Verfügung.</p>

                    <p>Viele Grüße,<br>Dein Karriereadler-Team</p>
                  </div>
                  <div class="footer">
                    <p>© ${new Date().getFullYear()} Karriereadler. Alle Rechte vorbehalten.</p>
                  </div>
                </div>
              </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Failed to send customer confirmation email:', emailError);
        // Don't break the webhook - email is not critical
      }

      console.log('OrderRequest updated to PAID:', orderIdNum);
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
