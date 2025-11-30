'use server';

import { z } from 'zod';
import { and, eq, inArray, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  teams,
  teamMembers,
  activityLogs,
  type NewUser,
  type NewTeam,
  type NewTeamMember,
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
import { getUser, getUserWithTeam } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  sendVerificationEmail
} from '@/lib/email';

async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }
  const newActivity: NewActivityLog = {
    teamId,
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

  const userWithTeam = await db
    .select({
      user: users,
      team: teams
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(users.email, email))
    .limit(1);

  if (userWithTeam.length === 0) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  const { user: foundUser, team: foundTeam } = userWithTeam[0];

  const isPasswordValid = await comparePasswords(
    password,
    foundUser.passwordHash
  );

  if (!isPasswordValid) {
    return {
      error: 'Invalid email or password. Please try again.',
      email,
      password
    };
  }

  // Check if email is verified
  if (!foundUser.emailVerified) {
    return {
      error: 'Bitte verifiziere zuerst deine Email-Adresse. Überprüfe dein Postfach.',
      notVerified: true,
      email,
      password
    };
  }

  await Promise.all([
    setSession(foundUser),
    logActivity(foundTeam?.id, foundUser.id, ActivityType.SIGN_IN)
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

  let invitation = null as (typeof invitations.$inferSelect) | null;
  if (inviteId) {
    const [foundInvitation] = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.id, parseInt(inviteId, 10)),
          eq(invitations.email, email),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (!foundInvitation) {
      return {
        error: 'Ungültige oder abgelaufene Einladung.',
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

    invitation = foundInvitation;
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

  const [existingPrivilegedUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(inArray(users.role, ['admin', 'owner']))
    .limit(1);

  const userRole = invitation
    ? invitation.role
    : existingPrivilegedUser
    ? 'member'
    : 'owner';

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

  let teamId: number;
  let createdTeam: typeof teams.$inferSelect | null = null;

  if (invitation) {
    teamId = invitation.teamId;

    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));

    await logActivity(teamId, createdUser.id, ActivityType.ACCEPT_INVITATION);

    [createdTeam] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);
  } else {
    // Create a new team if there's no invitation
    const newTeam: NewTeam = {
      name: `${email}'s Team`
    };

    [createdTeam] = await db.insert(teams).values(newTeam).returning();

    if (!createdTeam) {
      return {
        error: 'Fehler beim Erstellen des Teams. Bitte versuche es erneut.',
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

    teamId = createdTeam.id;

    await logActivity(teamId, createdUser.id, ActivityType.CREATE_TEAM);
  }

  const newTeamMember: NewTeamMember = {
    userId: createdUser.id,
    teamId: teamId,
    role: userRole
  };

  await db.insert(teamMembers).values(newTeamMember);
  await logActivity(teamId, createdUser.id, ActivityType.SIGN_UP);

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
        const userWithTeam = await getUserWithTeam(user.id);
        await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
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
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'Current password is incorrect.'
      };
    }

    if (currentPassword === newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password must be different from the current password.'
      };
    }

    if (confirmPassword !== newPassword) {
      return {
        currentPassword,
        newPassword,
        confirmPassword,
        error: 'New password and confirmation password do not match.'
      };
    }

    const newPasswordHash = await hashPassword(newPassword);
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_PASSWORD)
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
        password,
        error: 'Incorrect password. Account deletion failed.'
      };
    }

    const userWithTeam = await getUserWithTeam(user.id);

    await logActivity(
      userWithTeam?.teamId,
      user.id,
      ActivityType.DELETE_ACCOUNT
    );

    // Soft delete
    await db
      .update(users)
      .set({
        deletedAt: sql`CURRENT_TIMESTAMP`,
        email: sql`CONCAT(email, '-', id, '-deleted')` // Ensure email uniqueness
      })
      .where(eq(users.id, user.id));

    if (userWithTeam?.teamId) {
      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, userWithTeam.teamId)
          )
        );
    }

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
      email,
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
    const userWithTeam = await getUserWithTeam(user.id);

    await Promise.all([
      db
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
          country: country || null
        })
        .where(eq(users.id, user.id)),
      logActivity(userWithTeam?.teamId, user.id, ActivityType.UPDATE_ACCOUNT)
    ]);

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
  }
);

const removeTeamMemberSchema = z.object({
  memberId: z.number()
});

export const removeTeamMember = validatedActionWithUser(
  removeTeamMemberSchema,
  async (data, _, user) => {
    const { memberId } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    await db
      .delete(teamMembers)
      .where(
        and(
          eq(teamMembers.id, memberId),
          eq(teamMembers.teamId, userWithTeam.teamId)
        )
      );

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.REMOVE_TEAM_MEMBER
    );

    return { success: 'Team member removed successfully' };
  }
);

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['member', 'owner'])
});

export const inviteTeamMember = validatedActionWithUser(
  inviteTeamMemberSchema,
  async (data, _, user) => {
    const { email, role } = data;
    const userWithTeam = await getUserWithTeam(user.id);

    if (!userWithTeam?.teamId) {
      return { error: 'User is not part of a team' };
    }

    const existingMember = await db
      .select()
      .from(users)
      .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
      .where(
        and(eq(users.email, email), eq(teamMembers.teamId, userWithTeam.teamId))
      )
      .limit(1);

    if (existingMember.length > 0) {
      return { error: 'User is already a member of this team' };
    }

    // Check if there's an existing invitation
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.teamId, userWithTeam.teamId),
          eq(invitations.status, 'pending')
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return { error: 'An invitation has already been sent to this email' };
    }

    // Create a new invitation
    await db.insert(invitations).values({
      teamId: userWithTeam.teamId,
      email,
      role,
      invitedBy: user.id,
      status: 'pending'
    });

    await logActivity(
      userWithTeam.teamId,
      user.id,
      ActivityType.INVITE_TEAM_MEMBER
    );

    // TODO: Send invitation email and include ?inviteId={id} to sign-up URL
    // await sendInvitationEmail(email, userWithTeam.team.name, role)

    return { success: 'Invitation sent successfully' };
  }
);
