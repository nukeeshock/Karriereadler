import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, ProductType } from '@/lib/db/schema';
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
  customerPhone: z.string().nullable().optional(),
  basicInfo: z.object({
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().optional(),
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

    // Create OrderRequest with PENDING_PAYMENT status
    const [order] = await db
      .insert(orderRequests)
      .values({
        userId: user.id,
        productType,
        status: 'PENDING_PAYMENT',
        customerName,
        customerEmail,
        customerPhone: customerPhone || null,
        basicInfo
      })
      .returning();

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
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

    // Update order with Stripe session ID
    await db
      .update(orderRequests)
      .set({
        stripeSessionId: session.id,
        updatedAt: new Date()
      })
      .where(eq(orderRequests.id, order.id));

    return NextResponse.json({
      orderId: order.id,
      checkoutUrl: session.url
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung.' },
      { status: 500 }
    );
  }
}
