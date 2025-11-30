import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { put } from '@vercel/blob';
import { sendEmail } from '@/lib/email';

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

    // Send email notification to customer
    try {
      const dashboardUrl = `${process.env.BASE_URL}/dashboard/orders`;
      await sendEmail({
        to: order.customerEmail,
        subject: 'Deine Bewerbungsunterlagen sind fertig! | Karriereadler',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 40px 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 28px; }
                .content { padding: 40px 30px; }
                .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; }
                .highlight-box { background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; margin: 24px 0; border-radius: 4px; }
                .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Deine Unterlagen sind fertig!</h1>
                </div>
                <div class="content">
                  <p>Hallo ${order.customerName || 'liebe/r Kunde/in'},</p>
                  <p>großartige Neuigkeiten! Deine professionell erstellten Bewerbungsunterlagen sind jetzt fertig und stehen zum Download bereit.</p>

                  <div class="highlight-box">
                    <p><strong>🎉 Download jetzt verfügbar!</strong></p>
                    <p>Du kannst deine fertigen Dokumente ab sofort in deinem Dashboard herunterladen.</p>
                  </div>

                  <div style="text-align: center;">
                    <a href="${dashboardUrl}" class="button">Zu deinen Unterlagen</a>
                  </div>

                  <p style="margin-top: 30px;">Mit deinen neuen, professionellen Bewerbungsunterlagen hast du jetzt die besten Voraussetzungen, um bei deinen Wunscharbeitgebern zu punkten!</p>

                  <p>Wir wünschen dir viel Erfolg bei deiner Bewerbung! 🚀</p>

                  <p>Viele Grüße,<br>Dein Karriereadler-Team</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} Karriereadler. Alle Rechte vorbehalten.</p>
                </div>
              </div>
            </body>
          </html>
        `
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
