import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[Orders API] Fetching orders for user:', { userId: user.id, email: user.email });

    const orders = await db
      .select({
        id: orderRequests.id,
        productType: orderRequests.productType,
        status: orderRequests.status,
        customerName: orderRequests.customerName,
        customerEmail: orderRequests.customerEmail,
        finishedFileUrl: orderRequests.finishedFileUrl,
        createdAt: orderRequests.createdAt,
        updatedAt: orderRequests.updatedAt
      })
      .from(orderRequests)
      .where(eq(orderRequests.userId, user.id))
      .orderBy(desc(orderRequests.createdAt));

    console.log('[Orders API] Found orders:', { count: orders.length, userEmail: user.email });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
