import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Ungültige Auftrags-ID' }, { status: 400 });
    }

    // Get order and verify ownership
    const [order] = await db
      .select()
      .from(orderRequests)
      .where(eq(orderRequests.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
    }

    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    if (!order.finishedFileUrl) {
      return NextResponse.json({ error: 'Keine fertige Datei verfügbar' }, { status: 404 });
    }

    // Fetch from Vercel Blob Storage
    const blobResponse = await fetch(order.finishedFileUrl);

    if (!blobResponse.ok) {
      console.error('Blob fetch error:', blobResponse.status);
      return NextResponse.json({ error: 'Datei konnte nicht geladen werden' }, { status: 500 });
    }

    const fileBuffer = await blobResponse.arrayBuffer();

    // Determine filename for download
    const fileName = `Karriereadler_${order.productType}_${orderId}.pdf`;

    // Return file as download
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': fileBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Fehler beim Herunterladen' }, { status: 500 });
  }
}
