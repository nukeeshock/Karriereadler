'use server';

import { z } from 'zod';
import { validatedAction } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, sql, and, gt } from 'drizzle-orm';
import { generateVerificationToken, getVerificationTokenExpiry, sendEmail } from '@/lib/email';
import { hashPassword } from '@/lib/auth/session';

const requestSchema = z.object({
  email: z.string().email()
});

export const requestPasswordReset = validatedAction(requestSchema, async (data) => {
  const email = data.email.toLowerCase().trim();

  const [found] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to avoid user enumeration
  if (!found) {
    return {
      success: 'Wenn ein Account existiert, wurde eine E-Mail zum Zurücksetzen gesendet.'
    };
  }

  const token = generateVerificationToken();
  const expiry = getVerificationTokenExpiry();

  await db
    .update(users)
    .set({
      passwordResetToken: token,
      passwordResetTokenExpiry: expiry
    })
    .where(eq(users.id, found.id));

  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
  try {
    await sendEmail({
      to: email,
      subject: 'Passwort zurücksetzen – Karriereadler',
      text: `Du hast eine Passwort-Zurücksetzung angefordert.\n\nSetze dein Passwort hier zurück: ${resetUrl}\nDieser Link ist 24 Stunden gültig. Falls du das nicht warst, ignoriere diese E-Mail.`,
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
              .warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px; }
              .warning-box p { color: #92400e; margin: 0; font-size: 14px; }
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
                  <h2>Passwort zurücksetzen</h2>
                  <p>Hallo,</p>
                  <p>du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um ein neues Passwort zu vergeben.</p>
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Neues Passwort festlegen</a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                    Oder kopiere diesen Link in deinen Browser:
                  </p>
                  <div class="link-box">
                    <code>${resetUrl}</code>
                  </div>
                  <div class="warning-box">
                    <p><strong>⏰ Wichtig:</strong> Dieser Link ist 24 Stunden gültig.</p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                    Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
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
  } catch (err) {
    console.error('Failed to send reset email:', err);
  }

  return {
    success: 'Wenn ein Account existiert, wurde eine E-Mail zum Zurücksetzen gesendet.'
  };
});

const resetSchema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8, 'Passwort muss mindestens 8 Zeichen lang sein.')
    .regex(/[a-z]/, 'Mindestens ein Kleinbuchstabe')
    .regex(/[A-Z]/, 'Mindestens ein Großbuchstabe')
    .max(100)
});

export const resetPassword = validatedAction(resetSchema, async (data) => {
  const { token, password } = data;

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.passwordResetToken, token),
        gt(users.passwordResetTokenExpiry, sql`NOW()`)
      )
    )
    .limit(1);

  if (!user) {
    return {
      error: 'Token ungültig oder abgelaufen.'
    };
  }

  const passwordHash = await hashPassword(password);

  await db
    .update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetTokenExpiry: null
    })
    .where(eq(users.id, user.id));

  return {
    success: 'Passwort wurde aktualisiert. Bitte melde dich an.'
  };
});
