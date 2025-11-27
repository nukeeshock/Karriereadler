import { stripe } from '../payments/stripe';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { eq } from 'drizzle-orm';

async function createStripeProducts() {
  console.log('Creating Stripe products and prices...');

  const baseProduct = await stripe.products.create({
    name: 'Base',
    description: 'Base subscription plan',
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: 'Plus',
    description: 'Plus subscription plan',
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: 'usd',
    recurring: {
      interval: 'month',
      trial_period_days: 7,
    },
  });

  console.log('Stripe products and prices created successfully.');
}

async function seed() {
  // Create test user (default owner for local admin access)
  const email = 'test@test.com';
  const password = 'admin123';
  const passwordHash = await hashPassword(password);

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const [user] =
    existingUser && existingUser.id
      ? [existingUser]
      : await db
          .insert(users)
          .values([
            {
              email: email,
              passwordHash: passwordHash,
              role: 'owner',
              emailVerified: true, // Allow login
              name: 'Test User'
            }
          ])
          .onConflictDoNothing({ target: users.email })
          .returning();

  console.log('Test user created:', email);

  // Create admin user for admin panel access
  const adminEmail = 'admin@test.com';
  const adminPasswordHash = await hashPassword('admin123');

  const [existingAdmin] = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  const [adminUser] =
    existingAdmin && existingAdmin.id
      ? [existingAdmin]
      : await db
          .insert(users)
          .values([
            {
              email: adminEmail,
              passwordHash: adminPasswordHash,
              role: 'admin',
              emailVerified: true,
              name: 'Admin User'
            }
          ])
          .onConflictDoNothing({ target: users.email })
          .returning();

  console.log('Admin user created:', adminEmail);

  const [teamMember] = user?.id
    ? await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.userId, user.id))
        .limit(1)
    : [];

  let team =
    teamMember && teamMember.teamId
      ? (
          await db
            .select()
            .from(teams)
            .where(eq(teams.id, teamMember.teamId))
            .limit(1)
        )[0]
      : undefined;

  if (!team) {
    [team] = await db
      .insert(teams)
      .values({
        name: 'Test Team'
      })
      .returning();
  }

  if (user?.id && !teamMember) {
    await db.insert(teamMembers).values({
      teamId: team.id,
      userId: user.id,
      role: 'owner'
    });
  }

  // Create team for admin user
  if (adminUser?.id) {
    const [existingAdminTeamMember] = await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.userId, adminUser.id))
      .limit(1);

    if (!existingAdminTeamMember) {
      const [adminTeam] = await db
        .insert(teams)
        .values({
          name: 'Admin Team'
        })
        .returning();

      await db.insert(teamMembers).values({
        teamId: adminTeam.id,
        userId: adminUser.id,
        role: 'owner'
      });

      console.log('Admin team created.');
    }
  }

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
