import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { stripeEvents, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

const creditUpdates: Record<
  string,
  { cvCredits?: number; letterCredits?: number }
> = {
  cv: { cvCredits: 1 },
  letter: { letterCredits: 2 },
  bundle: { cvCredits: 1, letterCredits: 2 }
};

export async function GET(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  const existing = await db
    .select({
      id: stripeEvents.id,
      productType: stripeEvents.productType
    })
    .from(stripeEvents)
    .where(eq(stripeEvents.checkoutSessionId, sessionId))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({
      ok: true,
      alreadyProcessed: true,
      productType: existing[0].productType
    });
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Failed to retrieve checkout session', error);
    return NextResponse.json(
      { error: 'Checkout-Session konnte nicht geladen werden.' },
      { status: 400 }
    );
  }

  if (
    session.payment_status !== 'paid' ||
    (session.mode && session.mode !== 'payment')
  ) {
    return NextResponse.json(
      {
        error:
          'Zahlung ist noch nicht abgeschlossen. Bitte aktualisiere die Seite in ein paar Sekunden.'
      },
      { status: 400 }
    );
  }

  const productType = session.metadata?.productType as
    | 'cv'
    | 'letter'
    | 'bundle'
    | undefined;
  const sessionUserId = session.metadata?.userId
    ? Number(session.metadata.userId)
    : undefined;

  if (!productType || !sessionUserId) {
    return NextResponse.json(
      { error: 'Fehlende Bestelldaten. Bitte kontaktiere den Support.' },
      { status: 400 }
    );
  }

  if (sessionUserId !== user.id) {
    return NextResponse.json(
      { error: 'Checkout gehört zu einem anderen Benutzer.' },
      { status: 403 }
    );
  }

  const increments = creditUpdates[productType];
  if (!increments) {
    return NextResponse.json(
      { error: 'Unbekannter Produkttyp im Checkout.' },
      { status: 400 }
    );
  }

  await db.transaction(async (tx) => {
    await tx.insert(stripeEvents).values({
      eventId: `manual-${session.id}`,
      checkoutSessionId: session.id,
      type: 'checkout.session.completed',
      productType,
      userId: user.id
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
      .where(eq(users.id, user.id));
  });

  return NextResponse.json({
    ok: true,
    alreadyProcessed: false,
    productType
  });
}
