import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { sendEmail, getEmailTemplate, emailComponents } from '@/lib/email';

const ALLOWED_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

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

    // Get file from form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Nur PDF-Dateien sind erlaubt' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Datei zu groß (max. 20MB)' }, { status: 400 });
    }

    // Generate filename for Vercel Blob Storage
    const fileName = `order_${orderId}_${Date.now()}.pdf`;

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public', // Public URLs but random filenames = secure enough
      addRandomSuffix: true, // Adds random suffix for extra security
    });

    console.log('[Admin Upload] Blob created:', { url: blob.url, pathname: blob.pathname });

    // Update order: set finishedFileUrl (Blob URL) and status to COMPLETED
    await db
      .update(orderRequests)
      .set({
        finishedFileUrl: blob.url,
        status: OrderStatus.COMPLETED,
        updatedAt: new Date()
      })
      .where(eq(orderRequests.id, orderId));

    // Send email notification to customer with direct download link
    try {
      const dashboardUrl = `${process.env.BASE_URL}/dashboard/orders`;
      const { p, infoBox, linkBox } = emailComponents;
      
      const bodyContent = `
        ${p(`Hallo ${order.customerName || 'liebe/r Kunde/in'},`)}
        ${p('großartige Neuigkeiten! Deine professionell erstellten Bewerbungsunterlagen sind jetzt fertig und stehen zum Download bereit.')}
        ${infoBox('<strong>🎉 Deine Unterlagen sind fertig!</strong><br/>Klicke auf den Button unten, um deine Dokumente direkt herunterzuladen.', 'success')}
        ${p('<strong>Direkter Download-Link:</strong>', 'margin-top: 24px;')}
        ${linkBox(blob.url)}
        ${p('Du kannst deine Unterlagen auch jederzeit in deinem Dashboard herunterladen.', 'margin-top: 16px;')}
        ${p('Mit deinen neuen, professionellen Bewerbungsunterlagen hast du jetzt die besten Voraussetzungen, um bei deinen Wunscharbeitgebern zu punkten.', 'margin-top: 24px;')}
        ${p('Wir wünschen dir viel Erfolg bei deiner Bewerbung!')}
        ${p('Viele Grüße,<br/>Dein Karriereadler-Team')}
      `;
      
      await sendEmail({
        to: order.customerEmail,
        subject: 'Deine Bewerbungsunterlagen sind fertig | Karriereadler',
        html: getEmailTemplate({
          title: 'Deine Unterlagen sind fertig',
          body: bodyContent,
          buttonText: 'Jetzt herunterladen',
          buttonUrl: blob.url
        })
      });
      console.log('[Admin Upload] Completion email sent to:', order.customerEmail);
    } catch (emailError) {
      console.error('[Admin Upload] Failed to send completion email:', emailError);
      // Don't fail the upload if email fails
    }

    console.log('[Admin Upload] Order completed:', { orderId, blobUrl: blob.url });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName,
      message: 'Datei erfolgreich hochgeladen und Auftrag abgeschlossen'
    });
  } catch (error) {
    console.error('[Admin Upload] Error:', error);
    return NextResponse.json({ error: 'Fehler beim Hochladen' }, { status: 500 });
  }
}
