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

  return NextResponse.json(purchases);
}
