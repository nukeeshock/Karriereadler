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

// Email component helpers for table-based layouts
export const emailComponents = {
  // Info box with left border (pink/warning style)
  infoBox: (text: string, type: 'info' | 'warning' | 'success' = 'info') => {
    const styles = {
      info: { bg: '#FFE4E8', border: '#FFB6C1', text: '#D84949' },
      warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
      success: { bg: '#d1fae5', border: '#10b981', text: '#065f46' }
    };
    const s = styles[type];
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr><td style="background-color: ${s.bg}; padding: 12px 16px; border-radius: 4px; border-left: 4px solid ${s.border};">
        <p style="margin: 0; color: ${s.text}; font-size: 14px; line-height: 1.5;">${text}</p>
      </td></tr>
    </table>`;
  },
  
  // Link box for URLs
  linkBox: (url: string) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
    <tr><td style="background-color: #f9fafb; padding: 12px 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
      <code style="color: #6b7280; font-size: 13px; font-family: 'Courier New', Courier, monospace; word-break: break-all; display: block;">${url}</code>
    </td></tr>
  </table>`,
  
  // Paragraph
  p: (text: string, style?: string) => `<p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6; ${style || ''}">${text}</p>`,
  
  // Heading
  h2: (text: string) => `<h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.4;">${text}</h2>`,
  
  // Small text
  small: (text: string) => `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">${text}</p>`,
  
  // Ordered list
  ol: (items: string[]) => `<ol style="margin: 16px 0; padding-left: 24px; color: #4b5563; font-size: 16px; line-height: 1.8;">${items.map(item => `<li style="margin-bottom: 8px;">${item}</li>`).join('')}</ol>`
};

// Reusable email template wrapper with table-based layout for maximum compatibility
export function getEmailTemplate(content: {
  title: string;
  body: string;
  buttonText?: string;
  buttonUrl?: string;
}): string {
  const baseUrl = process.env.BASE_URL || 'https://karriereadler.com';
  const year = new Date().getFullYear();
  
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${content.title}</title>
  <!--[if mso]>
  <style type="text/css">
    table { border-collapse: collapse; }
    .button-td { padding: 0 !important; }
    .button-a { padding: 14px 28px !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <!-- Outer wrapper table -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <!-- Main container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td align="center" style="background: linear-gradient(to bottom, #FFAFC1, #FF9A8B); padding: 30px 20px;">
              <img src="${baseUrl}/logo_adler_notagline.png" alt="Karriereadler" width="160" style="display: block; max-width: 160px; height: auto; margin-bottom: 16px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 600; line-height: 1.3;">${content.title}</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              ${content.body}
              ${content.buttonText && content.buttonUrl ? `
              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td align="center" class="button-td">
                    <a href="${content.buttonUrl}" target="_blank" class="button-a" style="display: inline-block; background-color: #F76B6B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; line-height: 1.4;">${content.buttonText}</a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                    <p style="margin: 0 0 4px 0;"><strong style="color: #374151;">Karriereadler</strong> – Dein Partner für professionelle Bewerbungsunterlagen</p>
                    <p style="margin: 0 0 12px 0;">© ${year} Karriereadler. Alle Rechte vorbehalten.</p>
                    <p style="margin: 0;">
                      <a href="${baseUrl}/datenschutz" style="color: #F76B6B; text-decoration: none;">Datenschutz</a>
                      <span style="color: #9ca3af;"> • </span>
                      <a href="${baseUrl}/impressum" style="color: #F76B6B; text-decoration: none;">Impressum</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${token}`;

  const bodyContent = `
    <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 20px; font-weight: 600; line-height: 1.4;">Bitte verifiziere deine Email-Adresse</h2>
    <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Vielen Dank für deine Registrierung. Um deinen Account zu aktivieren, klicke bitte auf den folgenden Button:</p>
    
    <p style="margin: 24px 0 8px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Alternativ kannst du diesen Link in deinen Browser kopieren:</p>
    <!-- Link Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 0 0 20px 0;">
      <tr>
        <td style="background-color: #f9fafb; padding: 12px 16px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <code style="color: #6b7280; font-size: 13px; font-family: 'Courier New', Courier, monospace; word-break: break-all; display: block;">${verificationUrl}</code>
        </td>
      </tr>
    </table>
    
    <!-- Info Box -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="background-color: #FFE4E8; padding: 12px 16px; border-radius: 4px; border-left: 4px solid #FFB6C1;">
          <p style="margin: 0; color: #D84949; font-size: 14px; line-height: 1.5;"><strong>Hinweis:</strong> Dieser Link ist 24 Stunden gültig.</p>
        </td>
      </tr>
    </table>
    
    <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">Falls du dich nicht registriert hast, kannst du diese Email ignorieren.</p>
  `;

  await sendEmail({
    to: email,
    subject: 'Verifiziere deine Email-Adresse - Karriereadler',
    html: getEmailTemplate({
      title: 'Willkommen bei Karriereadler',
      body: bodyContent,
      buttonText: 'Email-Adresse verifizieren',
      buttonUrl: verificationUrl
    })
  });
}

// Send reminder email for unfilled questionnaire
export async function sendReminderEmail(
  email: string,
  orderId: number,
  customerName: string | null
): Promise<void> {
  const dashboardUrl = `${process.env.BASE_URL}/dashboard/orders/${orderId}/complete`;
  const { p, h2, infoBox } = emailComponents;

  const bodyContent = `
    ${p(`Hallo ${customerName || 'liebe/r Kunde/in'},`)}
    ${p('wir haben festgestellt, dass dein Fragebogen für deine Bewerbungsunterlagen noch nicht ausgefüllt wurde.')}
    ${infoBox('<strong>Wichtiger Hinweis:</strong> Damit wir mit der Erstellung deines Lebenslaufs beginnen können, benötigen wir zunächst deine Angaben im Fragebogen.', 'warning')}
    ${p('<strong>So geht es weiter:</strong>')}
    <ol style="margin: 16px 0; padding-left: 24px; color: #4b5563; font-size: 16px; line-height: 1.8;">
      <li style="margin-bottom: 8px;">Klicke auf den Button unten</li>
      <li style="margin-bottom: 8px;">Fülle den kurzen Fragebogen vollständig aus</li>
      <li style="margin-bottom: 8px;">Wir starten sofort mit der Erstellung deiner Unterlagen</li>
    </ol>
    ${p('Der Fragebogen dauert nur wenige Minuten und hilft uns, perfekt auf deine Stärken zugeschnittene Bewerbungsunterlagen zu erstellen.', 'margin-top: 24px;')}
    ${p('Bei Fragen stehen wir dir gerne zur Verfügung.')}
    ${p('Viele Grüße,<br/>Dein Karriereadler-Team')}
  `;

  await sendEmail({
    to: email,
    subject: 'Erinnerung: Bitte fülle deinen Fragebogen aus | Karriereadler',
    html: getEmailTemplate({
      title: 'Fragebogen noch offen',
      body: bodyContent,
      buttonText: 'Jetzt Fragebogen ausfüllen',
      buttonUrl: dashboardUrl
    })
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
