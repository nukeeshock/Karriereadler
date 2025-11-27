import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, cvRequests } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      firstName,
      lastName,
      birthDate,
      phone,
      email,
      street,
      houseNumber,
      zipCode,
      city,
      country,
      workExperience,
      education,
      skills,
      other,
      photoPath,
      jobDescription,
      language
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'Vorname, Nachname und E-Mail sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if user has credits and decrement atomically
    const updated = await db
      .update(users)
      .set({ cvCredits: sql`${users.cvCredits} - 1` })
      .where(and(eq(users.id, user.id), gte(users.cvCredits, 1)))
      .returning({ cvCredits: users.cvCredits });

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Keine Lebenslauf-Credits mehr verfügbar.' },
        { status: 402 }
      );
    }

    // Create CV request
    const [cvRequest] = await db
      .insert(cvRequests)
      .values({
        userId: user.id,
        firstName,
        lastName,
        birthDate,
        phone,
        email,
        street,
        houseNumber,
        zipCode,
        city,
        country,
        workExperience: JSON.stringify(workExperience || []),
        education: JSON.stringify(education || []),
        skills: JSON.stringify(skills || {}),
        other: JSON.stringify(other || {}),
        photoPath,
        jobDescription,
        language: language || 'Deutsch',
        status: 'offen'
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Deine Angaben wurden gespeichert. Wir erstellen deinen Lebenslauf und melden uns per E-Mail.',
      requestId: cvRequest.id
    });
  } catch (error) {
    console.error('CV request submission error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Anfrage.' },
      { status: 500 }
    );
  }
}
