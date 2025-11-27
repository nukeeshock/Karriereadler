'use server';

import { z } from 'zod';
import { and, eq, inArray, sql } from 'drizzle-orm';
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
  invitations
} from '@/lib/db/schema';
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
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
  password: z.string().min(8),
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
  const user = (await getUser()) as User;
  const userWithTeam = await getUserWithTeam(user.id);
  await logActivity(userWithTeam?.teamId, user.id, ActivityType.SIGN_OUT);
  (await cookies()).delete('session');
}

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(100),
  newPassword: z.string().min(8).max(100),
  confirmPassword: z.string().min(8).max(100)
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

const deleteAccountSchema = z.object({
  password: z.string().min(8).max(100)
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
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

    (await cookies()).delete('session');
    redirect('/sign-in');
  }
);

const updateAccountSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'Vorname ist erforderlich').max(100),
  lastName: z.string().min(1, 'Nachname ist erforderlich').max(100),
  birthDate: z.string().min(1, 'Geburtsdatum ist erforderlich'),
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
