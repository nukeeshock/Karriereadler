import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { stripeEvents } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const normalizeProductType = (value: string | null) => {
    if (!value) return null;
    const upper = value.toUpperCase();
    if (upper === 'CV' || upper === 'COVER_LETTER' || upper === 'BUNDLE') {
      return upper;
    }
    if (value === 'letter') return 'COVER_LETTER';
    if (value === 'cv') return 'CV';
    if (value === 'bundle') return 'BUNDLE';
    return upper;
  };

  const purchases = await db
    .select({
      id: stripeEvents.id,
      productType: stripeEvents.productType,
      createdAt: stripeEvents.createdAt
    })
    .from(stripeEvents)
    .where(eq(stripeEvents.userId, user.id))
    .orderBy(desc(stripeEvents.createdAt))
    .limit(10);

  const normalizedPurchases = purchases.map((purchase) => ({
    ...purchase,
    productType: normalizeProductType(purchase.productType)
  }));

  return NextResponse.json(normalizedPurchases);
}
