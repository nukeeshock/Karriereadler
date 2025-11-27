import { randomBytes } from 'crypto';

const FROM_ADDRESS =
  process.env.EMAIL_FROM || 'Karriereadler <noreply@karriereadler.com>';
const RESEND_API_URL = 'https://api.resend.com/emails';

export function generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}

export function getVerificationTokenExpiry(): Date {
  // Token expires in 24 hours
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verifiziere deine Email-Adresse - Karriereadler',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦅 Karriereadler</h1>
            </div>
            <div class="content">
              <h2>Willkommen bei Karriereadler!</h2>
              <p>Vielen Dank für deine Registrierung. Bitte verifiziere deine Email-Adresse, um deinen Account zu aktivieren.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Email-Adresse verifizieren</a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Oder kopiere diesen Link in deinen Browser:<br>
                <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 10px;">${verificationUrl}</code>
              </p>
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Dieser Link ist 24 Stunden gültig. Falls du dich nicht registriert hast, kannst du diese Email ignorieren.
              </p>
            </div>
            <div class="footer">
              <p>© 2025 Karriereadler. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </body>
      </html>
    `
  });
}

type SendEmailParams = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  text
}: SendEmailParams): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Development mode: log instead of failing hard
    console.log('\n=== EMAIL (DEV LOG) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML:', html);
    if (text) console.log('Text:', text);
    console.log('======================\n');
    return;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to,
        subject,
        html,
        text
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      throw new Error('Failed to send email via Resend');
    }
  } catch (error) {
    console.error('Error sending email via Resend:', error);
    throw error;
  }
}

export const FROM_EMAIL = FROM_ADDRESS;
