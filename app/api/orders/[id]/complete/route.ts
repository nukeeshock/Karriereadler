import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail, getEmailTemplate, emailComponents } from '@/lib/email';

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

    // Send email to admin
    const { p, small, infoBox } = emailComponents;
    
    try {
      const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM || 'info@karriereadler.com';
      const adminUrl = `${process.env.BASE_URL}/admin/orders/${order.id}`;

      const productLabels: Record<string, string> = {
        CV: 'Lebenslauf',
        COVER_LETTER: 'Anschreiben',
        BUNDLE: 'Komplett-Bundle (Lebenslauf + Anschreiben)'
      };

      const adminBodyContent = `
        ${p('Hallo,')}
        ${p('ein Kunde hat den Fragebogen vollständig ausgefüllt. Der Auftrag ist jetzt bereit zur Bearbeitung.')}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #6b7280;">Produkt</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong>${productLabels[order.productType]}</strong></td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #6b7280;">Kunde</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${order.customerName || 'N/A'}</td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #6b7280;">E-Mail</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${order.customerEmail}</td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #6b7280;">Telefon</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${order.customerPhone || '—'}</td></tr>
          <tr><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;"><strong style="color: #6b7280;">Auftrags-ID</strong></td><td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">#${order.id}</td></tr>
          <tr><td style="padding: 12px;"><strong style="color: #6b7280;">Bestellt am</strong></td><td style="padding: 12px;">${new Date(order.createdAt).toLocaleDateString('de-DE')}</td></tr>
        </table>
        ${small('Der Kunde erwartet die fertigen Unterlagen innerhalb von 2-3 Werktagen.')}
      `;

      await sendEmail({
        to: adminEmail,
        subject: `Neuer Auftrag bereit - ${productLabels[order.productType]} - ${order.customerName}`,
        html: getEmailTemplate({
          title: 'Neuer Auftrag eingegangen',
          body: adminBodyContent,
          buttonText: 'Auftrag jetzt bearbeiten',
          buttonUrl: adminUrl
        })
      });
    } catch (emailError) {
      console.error('Failed to send admin notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Send confirmation email to customer
    try {
      const customerBodyContent = `
        ${p(`Hallo ${order.customerName || 'liebe/r Kunde/in'},`)}
        ${p('vielen Dank für das Ausfüllen des Fragebogens! Wir haben alle Informationen erhalten und beginnen nun mit der professionellen Erstellung deiner Bewerbungsunterlagen.')}
        ${infoBox('<strong>Lieferzeit: 2-3 Werktage</strong><br/>Du erhältst die fertigen Unterlagen per E-Mail, sobald sie bereit sind.', 'info')}
        ${p('<strong>Was passiert jetzt?</strong>')}
        <ul style="margin: 16px 0; padding-left: 24px; color: #4b5563; font-size: 16px; line-height: 1.8;">
          <li style="margin-bottom: 8px;">Unsere Experten prüfen deine Angaben</li>
          <li style="margin-bottom: 8px;">Wir erstellen professionelle, individuell auf dich zugeschnittene Unterlagen</li>
          <li style="margin-bottom: 8px;">Du erhältst die fertigen Dokumente als Word (.docx) und PDF</li>
        </ul>
        ${p('Bei Fragen oder Änderungswünschen kannst du dich jederzeit bei uns melden.', 'margin-top: 24px;')}
        ${p('Viele Grüße,<br/>Dein Karriereadler-Team')}
      `;

      await sendEmail({
        to: order.customerEmail,
        subject: 'Fragebogen erhalten - Wir arbeiten an deinen Unterlagen | Karriereadler',
        html: getEmailTemplate({
          title: 'Fragebogen erhalten',
          body: customerBodyContent
        })
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
