'use server';

import { z } from 'zod';
import { validatedAction } from '@/lib/auth/middleware';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, sql, and, gt } from 'drizzle-orm';
import { generateVerificationToken, getVerificationTokenExpiry, sendEmail, getEmailTemplate, emailComponents } from '@/lib/email';
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
  const { p, small, linkBox, infoBox } = emailComponents;
  
  // Note: No h2 needed here - the title is already rendered in the header by getEmailTemplate
  const bodyContent = `
    ${p('Hallo,')}
    ${p('du hast eine Anfrage zum Zurücksetzen deines Passworts gestellt. Klicke auf den Button unten, um ein neues Passwort zu vergeben.')}
    ${small('Oder kopiere diesen Link in deinen Browser:')}
    ${linkBox(resetUrl)}
    ${infoBox('<strong>⏰ Wichtig:</strong> Dieser Link ist 24 Stunden gültig.', 'warning')}
    ${small('Falls du diese Anfrage nicht gestellt hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.')}
  `;
  
  try {
    await sendEmail({
      to: email,
      subject: 'Passwort zurücksetzen – Karriereadler',
      text: `Du hast eine Passwort-Zurücksetzung angefordert.\n\nSetze dein Passwort hier zurück: ${resetUrl}\nDieser Link ist 24 Stunden gültig. Falls du das nicht warst, ignoriere diese E-Mail.`,
      html: getEmailTemplate({
        title: 'Passwort zurücksetzen',
        body: bodyContent,
        buttonText: 'Neues Passwort festlegen',
        buttonUrl: resetUrl
      })
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
