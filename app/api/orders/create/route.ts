import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, ProductType, OrderStatus } from '@/lib/db/schema';
import { stripe } from '@/lib/payments/stripe';
import { z } from 'zod';
import { eq } from 'drizzle-orm';

const priceMap: Record<string, string | undefined> = {
  CV: process.env.STRIPE_PRICE_CV_SINGLE,
  COVER_LETTER: process.env.STRIPE_PRICE_LETTER_SINGLE,
  BUNDLE: process.env.STRIPE_PRICE_BUNDLE
};

const createOrderSchema = z.object({
  productType: z.enum([ProductType.CV, ProductType.COVER_LETTER, ProductType.BUNDLE]),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  basicInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().min(1),
    street: z.string().min(1),
    postalCode: z.string().regex(/^\d{5}$/, 'Postleitzahl muss 5-stellig sein'),
    city: z.string().min(1),
    birthDate: z.string().min(1),
    additionalInfo: z.string().optional()
  })
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabedaten.', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { productType, customerName, customerEmail, customerPhone, basicInfo } =
      validation.data;

    const priceId = priceMap[productType];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Produkt ist derzeit nicht verfügbar.' },
        { status: 500 }
      );
    }

    // Step 1: Create order in database first
    // External API calls (Stripe) should NOT be inside transactions to prevent:
    // - Orphaned Stripe sessions if transaction rolls back after Stripe succeeds
    // - Unnecessarily long transaction durations
    const [order] = await db
      .insert(orderRequests)
      .values({
        userId: user.id,
        productType,
        status: OrderStatus.PENDING_PAYMENT,
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        basicInfo
      })
      .returning();

    // Step 2: Create Stripe checkout session (external API - outside transaction)
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price: priceId,
            quantity: 1
          }
        ],
        success_url: `${process.env.BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/kaufen?checkout=cancelled`,
        customer_email: customerEmail,
        metadata: {
          orderRequestId: order.id.toString(),
          userId: user.id.toString(),
          productType
        }
      });
    } catch (stripeError) {
      // Stripe failed - cleanup the orphaned order
      console.error('[Order Create] Stripe session creation failed, cleaning up order:', order.id);
      await db.delete(orderRequests).where(eq(orderRequests.id, order.id));
      throw stripeError;
    }

    // Step 3: Update order with Stripe session ID
    await db
      .update(orderRequests)
      .set({
        stripeSessionId: session.id,
        updatedAt: new Date()
      })
      .where(eq(orderRequests.id, order.id));

    const orderId = order.id;
    const checkoutUrl = session.url;

    console.log('[Order Create] Order created successfully:', { orderId, userId: user.id, productType });

    return NextResponse.json({
      orderId,
      checkoutUrl
    });
  } catch (error) {
    console.error('Error creating order:', error);
    
    // Stripe errors are handled above with cleanup, but catch any remaining
    if (error instanceof Error && (error.message.includes('stripe') || error.message.includes('Stripe'))) {
      return NextResponse.json(
        { error: 'Fehler bei der Zahlungsabwicklung. Bitte versuche es erneut.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung.' },
      { status: 500 }
    );
  }
}
