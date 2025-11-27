import { db } from '../lib/db/drizzle';
import { users } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function activateUser() {
  const email = 'info@karriereadler.com';

  try {
    const [updated] = await db
      .update(users)
      .set({
        role: 'owner',
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null
      })
      .where(eq(users.email, email))
      .returning();

    if (!updated) {
      console.error(`❌ User mit Email ${email} nicht gefunden.`);
      process.exit(1);
    }

    console.log('✅ User erfolgreich aktiviert!');
    console.log(`   Email: ${updated.email}`);
    console.log(`   Name: ${updated.name || 'N/A'}`);
    console.log(`   Role: ${updated.role}`);
    console.log(`   Email Verified: ${updated.emailVerified}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Aktivieren des Users:', error);
    process.exit(1);
  }
}

activateUser();
