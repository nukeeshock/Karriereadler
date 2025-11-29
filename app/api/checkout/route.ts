import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';

const priceMap = {
  cv: process.env.STRIPE_PRICE_CV_SINGLE,
  letter: process.env.STRIPE_PRICE_LETTER_SINGLE,
  bundle: process.env.STRIPE_PRICE_BUNDLE
} as const;

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productType } = await request.json();
  if (!productType || !(productType in priceMap)) {
    return NextResponse.json({ error: 'Invalid productType' }, { status: 400 });
  }

  const priceId = priceMap[productType as keyof typeof priceMap];
  if (!priceId) {
    return NextResponse.json(
      { error: 'Zahlung ist derzeit nicht verfügbar. Bitte später erneut versuchen.' },
      { status: 500 }
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${process.env.BASE_URL}/dashboard/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BASE_URL}/dashboard/buy?checkout=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user.id.toString(),
        productType
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
