import { randomBytes } from 'crypto';

const FROM_ADDRESS =
  process.env.EMAIL_FROM || 'Karriereadler <info@karriereadler.com>';
const RESEND_API_URL = 'https://api.resend.com/emails';

// Validate that RESEND_API_KEY is set in production
if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
  throw new Error(
    'RESEND_API_KEY is required in production for email verification. ' +
    'Sign up at https://resend.com and add the API key to environment variables.'
  );
}

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
    subject: 'Verifiziere deine Email-Adresse – Karriereadler',
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
            .email-header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 30px; text-align: center; }
            .email-header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
            .email-header .logo { font-size: 40px; margin-bottom: 10px; }
            .email-content { padding: 40px 30px; }
            .email-content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; }
            .email-content p { color: #4b5563; margin: 0 0 16px 0; font-size: 16px; }
            .button { display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; font-size: 16px; box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3); }
            .button:hover { opacity: 0.9; }
            .link-box { background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0; word-break: break-all; }
            .link-box code { color: #6b7280; font-size: 14px; font-family: 'Courier New', monospace; }
            .info-box { background: #dbeafe; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px; }
            .info-box p { color: #1e40af; margin: 0; font-size: 14px; }
            .email-footer { background: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
            .email-footer p { margin: 5px 0; }
            .email-footer a { color: #f97316; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <div class="email-header">
                <div class="logo">🦅</div>
                <h1>Karriereadler</h1>
              </div>
              <div class="email-content">
                <h2>Willkommen bei Karriereadler!</h2>
                <p>Vielen Dank für deine Registrierung. Bitte verifiziere deine Email-Adresse, um deinen Account zu aktivieren und loszulegen.</p>
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Email-Adresse jetzt verifizieren</a>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                  Oder kopiere diesen Link in deinen Browser:
                </p>
                <div class="link-box">
                  <code>${verificationUrl}</code>
                </div>
                <div class="info-box">
                  <p><strong>ℹ️ Hinweis:</strong> Dieser Link ist 24 Stunden gültig.</p>
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                  Falls du dich nicht registriert hast, kannst du diese Email ignorieren.
                </p>
              </div>
              <div class="email-footer">
                <p><strong>Karriereadler</strong> – Dein Partner für professionelle Bewerbungsunterlagen</p>
                <p>© ${new Date().getFullYear()} Karriereadler. Alle Rechte vorbehalten.</p>
                <p style="margin-top: 12px;">
                  <a href="${process.env.BASE_URL}/datenschutz">Datenschutz</a> •
                  <a href="${process.env.BASE_URL}/impressum">Impressum</a>
                </p>
              </div>
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
