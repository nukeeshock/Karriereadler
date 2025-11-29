import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, letterRequests, UserRole } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { sendEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobTitle,
      companyName,
      location,
      jobCountry,
      jobPostingUrl,
      jobDescriptionText,
      experiencesToHighlight,
      strengths,
      additionalNotes,
      cvRequestId
    } = body;

    // Validate required fields
    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Jobtitel und Firmenname sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if user has credits and decrement atomically
    const updated = await db
      .update(users)
      .set({ letterCredits: sql`${users.letterCredits} - 1` })
      .where(and(eq(users.id, user.id), gte(users.letterCredits, 1)))
      .returning({ letterCredits: users.letterCredits });

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Keine Anschreiben-Credits mehr verfügbar.' },
        { status: 402 }
      );
    }

    // Create letter request
    const [letterRequest] = await db
      .insert(letterRequests)
      .values({
        userId: user.id,
        jobTitle,
        companyName,
        location,
        jobCountry,
        jobPostingUrl,
        jobDescriptionText,
        experiencesToHighlight,
        strengths,
        additionalNotes,
        cvRequestId: cvRequestId || null,
        status: 'offen'
      })
      .returning();

    // Notify admin via email if configured
    const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || process.env.EMAIL_FROM;
    if (adminEmail) {
      try {
        const adminUrl = `${process.env.BASE_URL}/admin/letter-requests/${letterRequest.id}`;
        await sendEmail({
          to: adminEmail,
          subject: `🆕 Neue Anschreiben-Anfrage #${letterRequest.id} – ${jobTitle}`,
          text: `Neue Anschreiben-Anfrage eingegangen.\n\nJobtitel: ${jobTitle}\nFirma: ${companyName}\nUser: ${user.email}\nReferenzierte CV-ID: ${cvRequestId || 'keine'}\nRequest-ID: ${letterRequest.id}\n\nDetails ansehen: ${adminUrl}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
                  .email-wrapper { width: 100%; padding: 40px 20px; }
                  .email-container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
                  .email-header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; }
                  .email-header h1 { color: white; margin: 0; font-size: 24px; font-weight: bold; }
                  .email-header .icon { font-size: 50px; margin-bottom: 10px; }
                  .email-content { padding: 40px 30px; }
                  .email-content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 22px; }
                  .info-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
                  .info-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
                  .info-table td:first-child { font-weight: 600; color: #6b7280; width: 40%; }
                  .info-table td:last-child { color: #1f2937; }
                  .status-badge { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
                  .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; font-size: 15px; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3); }
                  .button:hover { opacity: 0.9; }
                  .email-footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
                </style>
              </head>
              <body>
                <div class="email-wrapper">
                  <div class="email-container">
                    <div class="email-header">
                      <div class="icon">✉️</div>
                      <h1>Neue Anschreiben-Anfrage eingegangen</h1>
                    </div>
                    <div class="email-content">
                      <h2>Anfrage #${letterRequest.id}</h2>
                      <p>Ein neues Bewerbungsanschreiben wurde angefordert:</p>
                      <table class="info-table">
                        <tr>
                          <td>💼 Jobtitel</td>
                          <td><strong>${jobTitle}</strong></td>
                        </tr>
                        <tr>
                          <td>🏢 Firma</td>
                          <td><strong>${companyName}</strong></td>
                        </tr>
                        <tr>
                          <td>📍 Standort</td>
                          <td>${location || '—'}</td>
                        </tr>
                        <tr>
                          <td>🌍 Land</td>
                          <td>${jobCountry || '—'}</td>
                        </tr>
                        <tr>
                          <td>✉️ User-Email</td>
                          <td>${user.email}</td>
                        </tr>
                        <tr>
                          <td>🔗 Stellenausschreibung</td>
                          <td>${jobPostingUrl ? `<a href="${jobPostingUrl}" style="color: #f97316;">Link öffnen</a>` : '❌ Kein Link'}</td>
                        </tr>
                        <tr>
                          <td>📝 Stellenbeschreibung</td>
                          <td>${jobDescriptionText ? '✅ Vorhanden' : '❌ Nicht angegeben'}</td>
                        </tr>
                        <tr>
                          <td>📄 Referenziertes CV</td>
                          <td>${cvRequestId ? `<a href="${process.env.BASE_URL}/admin/cv-requests/${cvRequestId}" style="color: #f97316;">#${cvRequestId} ansehen</a>` : '❌ Kein CV verlinkt'}</td>
                        </tr>
                        <tr>
                          <td>📊 Status</td>
                          <td><span class="status-badge">OFFEN</span></td>
                        </tr>
                      </table>
                      <div style="text-align: center;">
                        <a href="${adminUrl}" class="button">Anfrage jetzt bearbeiten →</a>
                      </div>
                    </div>
                    <div class="email-footer">
                      <p>Karriereadler Admin-Benachrichtigung</p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `
        });
      } catch (notifyError) {
        console.error('Failed to send letter admin notification:', notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Deine Angaben für das Anschreiben wurden gespeichert. Wir erstellen dein Anschreiben manuell und melden uns per E-Mail.',
      requestId: letterRequest.id
    });
  } catch (error) {
    console.error('Letter request submission error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Anfrage.' },
      { status: 500 }
    );
  }
}
