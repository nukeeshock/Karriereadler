'use server';

import { z } from 'zod';
import { and, eq, inArray, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teamMembers, // Kept for legacy cleanup during hard delete
  activityLogs,
  type NewUser,
  type NewActivityLog,
  ActivityType,
  invitations,
  cvRequests,
  letterRequests,
  orderRequests,
  stripeEvents
} from '@/lib/db/schema';
import { del } from '@vercel/blob';
import {
  comparePasswords,
  deleteSession,
  hashPassword,
  setSession
} from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  sendVerificationEmail
} from '@/lib/email';

// Log user activity (no team dependency - teams are deprecated)
async function logActivity(
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  const newActivity: NewActivityLog = {
    teamId: null, // Teams are deprecated, teamId is now nullable
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };
  await db.insert(activityLogs).values(newActivity);
}

const passwordRulesSchema = z
  .string()
  .min(8, 'Passwort muss mindestens 8 Zeichen lang sein.')
  .max(100)
  .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten.')
  .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten.');

const signInSchema = z.object({
  email: z.string().email().min(3).max(255),
  password: z.string().min(8).max(100)
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const email = data.email.trim().toLowerCase();
  const { password } = data;

  // Simplified: direct user lookup, no team joins
  const [foundUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!foundUser) {
    return {
      error: 'Ungültige E-Mail oder Passwort. Bitte versuche es erneut.',
      email
    };
  }

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Ungültige E-Mail oder Passwort. Bitte versuche es erneut.',
      email
    };
  }

  // Check if email is verified
  if (!foundUser.emailVerified) {
    return {
      error: 'Bitte verifiziere zuerst deine Email-Adresse. Überprüfe dein Postfach.',
      notVerified: true,
      email
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundUser.id, ActivityType.SIGN_IN)
  ]);

  redirect('/dashboard');
});

const resendVerificationSchema = z.object({
  email: z.string().email()
});

export const resendVerificationEmail = validatedAction(
  resendVerificationSchema,
  async (data) => {
    const { email: rawEmail } = data;
    const email = rawEmail.trim().toLowerCase();

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return {
        error: 'Kein Account mit dieser Email-Adresse gefunden.'
      };
    }

    if (user.emailVerified) {
      return {
        error: 'Diese Email-Adresse wurde bereits verifiziert. Du kannst dich jetzt einloggen.'
      };
    }

    // Generate new verification token
    const verificationToken = generateVerificationToken();
    const verificationTokenExpiry = getVerificationTokenExpiry();

    // Update user with new token
    await db
      .update(users)
      .set({
        verificationToken,
        verificationTokenExpiry
      })
      .where(eq(users.id, user.id));

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationToken);
      return {
        success: true,
        message: 'Verifizierungs-Email wurde erneut gesendet. Bitte überprüfe dein Postfach.'
      };
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      return {
        error: 'Fehler beim Senden der Email. Bitte versuche es später erneut.'
      };
    }
  }
);

const signUpSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(100),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(100),
  birthDate: z.string().min(1, 'Geburtsdatum ist erforderlich'),
  street: z.string().max(255).optional(),
  houseNumber: z.string().max(20).optional(),
  zipCode: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  email: z.string().email(),
  password: passwordRulesSchema,
  inviteId: z.string().optional()
});

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const {
    email: rawEmail,
    password,
    inviteId,
    firstName,
    lastName,
    birthDate,
    street,
    houseNumber,
    zipCode,
    city,
    country
  } = data;

  const email = rawEmail.trim().toLowerCase();

  const birthDateValue = typeof birthDate === 'string' ? birthDate : '';

  // Invitations are deprecated - reject if inviteId is provided
  if (inviteId) {
    return {
      error: 'Einladungen werden nicht mehr unterstützt. Bitte registriere dich normal.',
      email,
      password,
      firstName,
      lastName,
      birthDate,
      street,
      houseNumber,
      zipCode,
      city,
      country
    };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      error: 'Ein Account mit dieser Email existiert bereits.',
      email,
      password,
      firstName,
      lastName,
      birthDate,
      street,
      houseNumber,
      zipCode,
      city,
      country
    };
  }

  const passwordHash = await hashPassword(password);
  const verificationToken = generateVerificationToken();
  const verificationTokenExpiry = getVerificationTokenExpiry();

  // First user becomes owner, all others become members
  const [existingPrivilegedUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, ['admin', 'owner']))
    .limit(1);

  const userRole = existingPrivilegedUser ? 'member' : 'owner';

  const newUser: NewUser = {
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    birthDate: birthDateValue || null,
    street: street || null,
    houseNumber: houseNumber || null,
    zipCode: zipCode || null,
    city: city || null,
    country: country || null,
    email,
    passwordHash,
    role: userRole,
    verificationToken,
    verificationTokenExpiry,
    emailVerified: false
  };

  const [createdUser] = await db.insert(users).values(newUser).returning();

  if (!createdUser) {
    return {
      error: 'Fehler beim Erstellen des Accounts. Bitte versuche es erneut.',
      email,
      password,
      firstName,
      lastName,
      birthDate,
      street,
      houseNumber,
      zipCode,
      city,
      country
    };
  }

  // Log signup activity
  await logActivity(createdUser.id, ActivityType.SIGN_UP);

  // Send verification email
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Continue anyway - user can request new verification email
  }

  return {
    success: 'Account erstellt! Bitte überprüfe deine Email und klicke auf den Verifizierungslink.',
    email,
    firstName,
    lastName,
    birthDate,
    street,
    houseNumber,
    zipCode,
    city,
    country
  };
});

export async function signOut() {
  'use server';

  const user = await getUser();

  await Promise.all([
    deleteSession(),
    (async () => {
      if (user) {
        await logActivity(user.id, ActivityType.SIGN_OUT);
      }
    })()
  ]);

  redirect('/');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: passwordRulesSchema,
  confirmPassword: passwordRulesSchema
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword, confirmPassword } = data;

    const isPasswordValid = await comparePasswords(
      currentPassword,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return {
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(user.id, ActivityType.UPDATE_PASSWORD)
    ]);

    return {
      success: 'Password updated successfully.'
    };
  }
);

const softDeleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const softDeleteAccount = validatedActionWithUser(
  softDeleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    await deleteSession();
    redirect('/sign-in');
  }
);

const hardDeleteAccountSchema = z.object({
  password: z.string().min(8).max(100),
  confirmDeletion: z.preprocess(
    (val) => val === 'true' || val === 'on' || val === true,
    z.literal(true)
  )
});

export const hardDeleteAccount = validatedActionWithUser(
  hardDeleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        password,
        error: 'Passwort ist falsch.'
      };
    }

    try {
      await db.transaction(async (tx) => {
        // Delete Vercel Blob files from orderRequests
        const orders = await tx
          .select({ finishedFileUrl: orderRequests.finishedFileUrl })
          .from(orderRequests)
          .where(eq(orderRequests.userId, user.id));

        await Promise.all(
          orders.map(async ({ finishedFileUrl }) => {
            if (!finishedFileUrl) return;
            try {
              await del(finishedFileUrl);
            } catch (error) {
              console.error('Failed to delete blob:', finishedFileUrl, error);
            }
          })
        );

        // Delete old photos from cvRequests (legacy)
        const photos = await tx
          .select({ photoPath: cvRequests.photoPath })
          .from(cvRequests)
          .where(eq(cvRequests.userId, user.id));

        await Promise.all(
          photos.map(async ({ photoPath }) => {
            if (!photoPath) return;

            const normalizedPath = photoPath.startsWith('/')
              ? photoPath.slice(1)
              : photoPath;
            const absolutePath = path.join(
              process.cwd(),
              'public',
              normalizedPath
            );

            await fs.unlink(absolutePath).catch(() => {});
          })
        );

        // Delete database records (in order to respect foreign key constraints)
        await tx.delete(stripeEvents).where(eq(stripeEvents.userId, user.id));
        await tx.delete(orderRequests).where(eq(orderRequests.userId, user.id));
        await tx.delete(cvRequests).where(eq(cvRequests.userId, user.id));
        await tx
          .delete(letterRequests)
          .where(eq(letterRequests.userId, user.id));
        await tx
          .delete(activityLogs)
          .where(eq(activityLogs.userId, user.id));
        await tx
          .delete(teamMembers)
          .where(eq(teamMembers.userId, user.id));
        await tx
          .delete(invitations)
          .where(eq(invitations.invitedBy, user.id));
        await tx.delete(users).where(eq(users.id, user.id));
      });
    } catch (error) {
      console.error('Hard delete failed:', error);
      return {
        error: 'Konnte Account nicht löschen. Bitte versuche es erneut.'
      };
    }

    await deleteSession();
    redirect('/account-deleted-confirmation');
  }
);

const updateAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(100),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(100),
  birthDate: z.string().min(1, 'Geburtsdatum ist erforderlich'),
  phoneNumber: z.string().max(50).optional(),
  street: z.string().max(255).optional(),
  houseNumber: z.string().max(20).optional(),
  zipCode: z.string().max(20).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional()
});

export const updateAccount = validatedActionWithUser(
  updateAccountSchema,
  async (data, _, user) => {
    const {
      email: rawEmail,
      firstName,
      lastName,
      birthDate,
      phoneNumber,
      street,
      houseNumber,
      zipCode,
      city,
      country
    } = data;
    const birthDateValue = typeof birthDate === 'string' ? birthDate : '';
    
    // Normalize email (consistent with signIn pattern)
    const email = rawEmail.trim().toLowerCase();

    // Check email uniqueness if email is being changed
    if (email !== user.email) {
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email), sql`${users.id} != ${user.id}`))
        .limit(1);

      if (existingUser.length > 0) {
        return {
          email,
          firstName,
          lastName,
          birthDate,
          phoneNumber,
          street,
          houseNumber,
          zipCode,
          city,
          country,
          error: 'Diese E-Mail-Adresse wird bereits von einem anderen Account verwendet.'
        };
      }
    }

    try {
      await db
        .update(users)
        .set({
          name: `${firstName} ${lastName}`.trim(),
          email,
          firstName,
          lastName,
          birthDate: birthDateValue || null,
          phoneNumber: phoneNumber || null,
          street: street || null,
          houseNumber: houseNumber || null,
          zipCode: zipCode || null,
          city: city || null,
          country: country || null,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // Log activity
      await logActivity(user.id, ActivityType.UPDATE_ACCOUNT);

      return {
        firstName,
        lastName,
        birthDate,
        phoneNumber,
        street,
        houseNumber,
        zipCode,
        city,
        country,
        success: 'Account updated successfully.'
      };
    } catch (error) {
      // Handle DB constraint violations (e.g., unique email)
      if (error instanceof Error && (error.message.includes('unique') || error.message.includes('duplicate'))) {
        return {
          email,
          firstName,
          lastName,
          birthDate,
          phoneNumber,
          street,
          houseNumber,
          zipCode,
          city,
          country,
          error: 'Diese E-Mail-Adresse wird bereits verwendet.'
        };
      }
      throw error;
    }
  }
);

// ============================================================================
// DEPRECATED: Team-related functions
// Teams are no longer used in this application. These functions are kept for
// backward compatibility but will return errors if called.
// ============================================================================

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

/** @deprecated Teams are no longer used */
export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async () => {
    return { error: 'Teams werden nicht mehr unterstützt.' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

/** @deprecated Teams are no longer used */
export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async () => {
    return { error: 'Teams werden nicht mehr unterstützt.' };
  }
);
