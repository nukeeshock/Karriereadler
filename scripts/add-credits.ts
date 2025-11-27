import { db } from '../lib/db/drizzle';
import { users } from '../lib/db/schema';
import { eq, sql } from 'drizzle-orm';

async function addCredits() {
  const email = 'mauricebeaujean@web.de';
  const cvCredits = 5;
  const letterCredits = 5;

  try {
    const [updated] = await db
      .update(users)
      .set({
        cvCredits: sql`${users.cvCredits} + ${cvCredits}`,
        letterCredits: sql`${users.letterCredits} + ${letterCredits}`
      })
      .where(eq(users.email, email))
      .returning();

    if (!updated) {
      console.error(`❌ User mit Email ${email} nicht gefunden.`);
      process.exit(1);
    }

    console.log('✅ Credits erfolgreich hinzugefügt!');
    console.log(`   Email: ${updated.email}`);
    console.log(`   CV Credits: ${updated.cvCredits}`);
    console.log(`   Letter Credits: ${updated.letterCredits}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler beim Hinzufügen der Credits:', error);
    process.exit(1);
  }
}

addCredits();
