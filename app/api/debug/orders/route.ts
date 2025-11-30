import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { orderRequests, users } from '@/lib/db/schema';

export async function GET() {
  try {
    const orders = await db.select().from(orderRequests);
    const allUsers = await db.select({ id: users.id, email: users.email }).from(users);

    return NextResponse.json({
      ordersCount: orders.length,
      orders: orders.map(o => ({ id: o.id, userId: o.userId, email: o.customerEmail })),
      usersCount: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
