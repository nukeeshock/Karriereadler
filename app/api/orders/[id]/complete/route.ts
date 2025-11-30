import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const orderId = Number(id);

    if (Number.isNaN(orderId)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json({ error: 'Missing form data' }, { status: 400 });
    }

    // Load order
    const [order] = await db
      .select()
      .from(orderRequests)
      .where(eq(orderRequests.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check ownership
    if (order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check status (must be PAID)
    if (order.status !== OrderStatus.PAID) {
      return NextResponse.json(
        { error: 'Order must be in PAID status to complete questionnaire' },
        { status: 400 }
      );
    }

    // Update order with formData and set status to READY_FOR_PROCESSING
    await db
      .update(orderRequests)
      .set({
        formData,
        status: OrderStatus.READY_FOR_PROCESSING,
        updatedAt: new Date()
      })
      .where(eq(orderRequests.id, orderId));

    // Send email to Maurice (admin notification)
    try {
      const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM || 'info@karriereadler.com';
      const adminUrl = `${process.env.BASE_URL}/admin/orders/${order.id}`;

      const productLabels: Record<string, string> = {
        CV: 'Lebenslauf',
        COVER_LETTER: 'Anschreiben',
        BUNDLE: 'Komplett-Bundle (Lebenslauf + Anschreiben)'
      };

      await sendEmail({
        to: adminEmail,
        subject: `Neuer Auftrag bereit - ${productLabels[order.productType]} - ${order.customerName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(to bottom, #FFAFC1, #FF9A8B); padding: 30px; text-align: center; color: white; }
                .header img { display: block; margin: 0 auto 20px; width: 180px; height: auto; }
                .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
                .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                .info-table td:first-child { font-weight: 600; color: #6b7280; width: 40%; }
                .button { display: inline-block; background: #F76B6B; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 24px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="${process.env.BASE_URL}/logo_adler_notagline.png" alt="Karriereadler" />
                  <h1>Neuer Auftrag eingegangen</h1>
                </div>
                <div class="content">
                  <p>Hallo,</p>
                  <p>ein Kunde hat den Fragebogen vollständig ausgefüllt. Der Auftrag ist jetzt bereit zur Bearbeitung.</p>

                  <table class="info-table">
                    <tr>
                      <td>Produkt</td>
                      <td><strong>${productLabels[order.productType]}</strong></td>
                    </tr>
                    <tr>
                      <td>Kunde</td>
                      <td>${order.customerName || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td>E-Mail</td>
                      <td>${order.customerEmail}</td>
                    </tr>
                    <tr>
                      <td>Telefon</td>
                      <td>${order.customerPhone || '—'}</td>
                    </tr>
                    <tr>
                      <td>Auftrags-ID</td>
                      <td>#${order.id}</td>
                    </tr>
                    <tr>
                      <td>Bestellt am</td>
                      <td>${new Date(order.createdAt).toLocaleDateString('de-DE')}</td>
                    </tr>
                  </table>

                  <div style="text-align: center;">
                    <a href="${adminUrl}" class="button">Auftrag jetzt bearbeiten</a>
                  </div>

                  <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                    Der Kunde erwartet die fertigen Unterlagen innerhalb von 2-3 Werktagen.
                  </p>
                </div>
                <div class="footer">
                  <p>Karriereadler Admin-Benachrichtigung</p>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Optional: Send confirmation email to customer
    try {
      await sendEmail({
        to: order.customerEmail,
        subject: 'Fragebogen erhalten - Wir arbeiten an deinen Unterlagen | Karriereadler',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                .header { background: linear-gradient(to bottom, #FFAFC1, #FF9A8B); padding: 30px; text-align: center; color: white; }
                .header img { display: block; margin: 0 auto 20px; width: 180px; height: auto; }
                .header h1 { margin: 0; font-size: 26px; font-weight: 600; }
                .content { padding: 40px 30px; }
                .info-box { background: #FFE4E8; border-left: 4px solid #FFB6C1; padding: 16px; margin: 24px 0; border-radius: 4px; }
                .info-box p { color: #D84949; margin: 8px 0; }
                .footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <img src="${process.env.BASE_URL}/logo_adler_notagline.png" alt="Karriereadler" />
                  <h1>Fragebogen erhalten</h1>
                </div>
                <div class="content">
                  <p>Hallo ${order.customerName || 'liebe/r Kunde/in'},</p>
                  <p>vielen Dank für das Ausfüllen des Fragebogens! Wir haben alle Informationen erhalten und beginnen nun mit der professionellen Erstellung deiner Bewerbungsunterlagen.</p>

                  <div class="info-box">
                    <p><strong>Lieferzeit: 2-3 Werktage</strong></p>
                    <p>Du erhältst die fertigen Unterlagen per E-Mail, sobald sie bereit sind.</p>
                  </div>

                  <p><strong>Was passiert jetzt?</strong></p>
                  <ul>
                    <li>Unsere Experten prüfen deine Angaben</li>
                    <li>Wir erstellen professionelle, individuell auf dich zugeschnittene Unterlagen</li>
                    <li>Du erhältst die fertigen Dokumente als Word (.docx) und PDF</li>
                  </ul>

                  <p style="margin-top: 30px;">Bei Fragen oder Änderungswünschen kannst du dich jederzeit bei uns melden.</p>

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
    } catch (emailError) {
      console.error('Failed to send customer confirmation email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Fragebogen erfolgreich eingereicht.'
    });
  } catch (error) {
    console.error('Error completing order:', error);
    return NextResponse.json({ error: 'Failed to complete order' }, { status: 500 });
  }
}
