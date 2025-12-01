import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/roles';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or owner
    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Ungültige Auftrags-ID' }, { status: 400 });
    }

    // Atomic update: only update if status is READY_FOR_PROCESSING
    // This prevents race conditions where two admins try to start the same order
    const [updatedOrder] = await db
      .update(orderRequests)
      .set({
        status: OrderStatus.IN_PROGRESS,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(orderRequests.id, orderId),
          eq(orderRequests.status, OrderStatus.READY_FOR_PROCESSING)
        )
      )
      .returning({ id: orderRequests.id, status: orderRequests.status });

    if (!updatedOrder) {
      // Order not found or status mismatch - check which one
      const [order] = await db
        .select({ status: orderRequests.status })
        .from(orderRequests)
        .where(eq(orderRequests.id, orderId))
        .limit(1);

      if (!order) {
        return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
      }

      return NextResponse.json(
        {
          error: 'Auftrag kann nur gestartet werden wenn Fragebogen ausgefüllt wurde',
          currentStatus: order.status
        },
        { status: 409 } // Conflict - status changed between check and update
      );
    }

    console.log('[Auto Start] Order started:', { orderId, newStatus: OrderStatus.IN_PROGRESS });

    return NextResponse.json({
      success: true,
      message: 'Auftrag auf "In Bearbeitung" gesetzt',
      newStatus: OrderStatus.IN_PROGRESS
    });
  } catch (error) {
    console.error('[Auto Start] Error:', error);
    return NextResponse.json({ error: 'Fehler beim Starten des Auftrags' }, { status: 500 });
  }
}
