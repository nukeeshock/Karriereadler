import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  sendVerificationEmail
} from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email ist erforderlich' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Kein Account mit dieser Email-Adresse gefunden.' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Diese Email-Adresse wurde bereits verifiziert. Du kannst dich jetzt einloggen.' }, { status: 400 });
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
      await sendVerificationEmail(normalizedEmail, verificationToken);
      return NextResponse.json({
        success: true,
        message: 'Verifizierungs-Email wurde erneut gesendet. Bitte überprüfe dein Postfach.'
      });
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
      return NextResponse.json({
        error: 'Fehler beim Senden der Email. Bitte versuche es später erneut.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ error: 'Ein Fehler ist aufgetreten' }, { status: 500 });
  }
}
