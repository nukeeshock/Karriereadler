import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/roles';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or owner
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const orders = await db
      .select()
      .from(orderRequests)
      .orderBy(desc(orderRequests.createdAt));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
