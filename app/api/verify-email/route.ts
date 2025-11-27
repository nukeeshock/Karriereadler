import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich.' },
        { status: 400 }
      );
    }

    // Find user with matching token that hasn't expired
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verificationToken, token),
          gt(users.verificationTokenExpiry, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültiger oder abgelaufener Verifizierungs-Token.' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Diese Email-Adresse wurde bereits verifiziert.' },
        { status: 400 }
      );
    }

    // Update user to mark email as verified
    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      message: 'Deine Email wurde erfolgreich verifiziert! Du kannst dich jetzt anmelden.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    return NextResponse.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.' },
      { status: 500 }
    );
  }
}
