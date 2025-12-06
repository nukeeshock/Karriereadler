import { NextRequest, NextResponse } from 'next/server';
import { getUser, getOrderById } from '@/lib/db/queries';
import { isAdmin } from '@/lib/auth/roles';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(user)) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Ungültige Auftrags-ID' }, { status: 400 });
    }

    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('[Admin Order Detail] Error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden des Auftrags' }, { status: 500 });
  }
}
