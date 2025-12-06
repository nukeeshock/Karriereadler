import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { isAdmin } from '@/lib/auth/roles';
import { verifyDownloadToken } from '@/lib/utils/signed-url';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      return NextResponse.json({ error: 'Ungültige Auftrags-ID' }, { status: 400 });
    }

    // Check for signed token (for email links)
    const token = request.nextUrl.searchParams.get('token');
    let fileUrl: string | null = null;
    let productType: string | null = null;

    if (token) {
      // Verify signed token for unauthenticated access (email links)
      const payload = await verifyDownloadToken(token);

      if (!payload) {
        return NextResponse.json(
          { error: 'Download-Link ist abgelaufen oder ungültig. Bitte logge dich ein, um die Datei herunterzuladen.' },
          { status: 401 }
        );
      }

      if (payload.orderId !== orderId) {
        return NextResponse.json({ error: 'Ungültiger Download-Link' }, { status: 403 });
      }

      fileUrl = payload.fileUrl;

      // Get product type for filename
      const [order] = await db
        .select({ productType: orderRequests.productType })
        .from(orderRequests)
        .where(eq(orderRequests.id, orderId))
        .limit(1);

      productType = order?.productType || 'Document';
    } else {
      // Standard authenticated access
      const user = await getUser();
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get order and verify ownership or admin access
      const [order] = await db
        .select()
        .from(orderRequests)
        .where(eq(orderRequests.id, orderId))
        .limit(1);

      if (!order) {
        return NextResponse.json({ error: 'Auftrag nicht gefunden' }, { status: 404 });
      }

      // Allow access if user owns the order OR is an admin
      if (order.userId !== user.id && !isAdmin(user)) {
        return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
      }

      if (!order.finishedFileUrl) {
        return NextResponse.json({ error: 'Keine fertige Datei verfügbar' }, { status: 404 });
      }

      fileUrl = order.finishedFileUrl;
      productType = order.productType;
    }

    if (!fileUrl) {
      return NextResponse.json({ error: 'Keine Datei verfügbar' }, { status: 404 });
    }

    // Fetch from Vercel Blob Storage
    const blobResponse = await fetch(fileUrl);

    if (!blobResponse.ok) {
      console.error('Blob fetch error:', blobResponse.status);
      return NextResponse.json({ error: 'Datei konnte nicht geladen werden' }, { status: 500 });
    }

    const fileBuffer = await blobResponse.arrayBuffer();

    // Determine filename for download
    const fileName = `Karriereadler_${productType}_${orderId}.pdf`;

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
