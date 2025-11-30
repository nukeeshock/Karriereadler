import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus } from '@/lib/db/schema';
import { eq, or } from 'drizzle-orm';

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
    if (user.role !== 'admin' && user.role !== 'owner') {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Ungültige Auftrags-ID' }, { status: 400 });
    }

    // Get order
    const [order] = await db
      .select()
      .from(orderRequests)
      .where(eq(orderRequests.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
    }

    // Only start if status is PAID or READY_FOR_PROCESSING
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.READY_FOR_PROCESSING) {
      console.log('[Auto Start] Order not eligible for auto-start:', { orderId, status: order.status });
      return NextResponse.json({
        message: 'Auftrag bereits in Bearbeitung oder abgeschlossen',
        status: order.status
      });
    }

    // Update status to IN_PROGRESS
    await db
      .update(orderRequests)
      .set({
        status: OrderStatus.IN_PROGRESS,
        updatedAt: new Date()
      })
      .where(eq(orderRequests.id, orderId));

    console.log('[Auto Start] Order started:', { orderId, previousStatus: order.status });

    return NextResponse.json({
      success: true,
      message: 'Auftrag auf "In Bearbeitung" gesetzt',
      previousStatus: order.status,
      newStatus: OrderStatus.IN_PROGRESS
    });
  } catch (error) {
    console.error('[Auto Start] Error:', error);
    return NextResponse.json({ error: 'Fehler beim Starten des Auftrags' }, { status: 500 });
  }
}
