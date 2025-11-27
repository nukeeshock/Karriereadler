import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, letterRequests } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      jobTitle,
      companyName,
      location,
      jobCountry,
      jobPostingUrl,
      jobDescriptionText,
      experiencesToHighlight,
      strengths,
      additionalNotes,
      cvRequestId
    } = body;

    // Validate required fields
    if (!jobTitle || !companyName) {
      return NextResponse.json(
        { error: 'Jobtitel und Firmenname sind erforderlich.' },
        { status: 400 }
      );
    }

    // Check if user has credits and decrement atomically
    const updated = await db
      .update(users)
      .set({ letterCredits: sql`${users.letterCredits} - 1` })
      .where(and(eq(users.id, user.id), gte(users.letterCredits, 1)))
      .returning({ letterCredits: users.letterCredits });

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Keine Anschreiben-Credits mehr verfügbar.' },
        { status: 402 }
      );
    }

    // Create letter request
    const [letterRequest] = await db
      .insert(letterRequests)
      .values({
        userId: user.id,
        jobTitle,
        companyName,
        location,
        jobCountry,
        jobPostingUrl,
        jobDescriptionText,
        experiencesToHighlight,
        strengths,
        additionalNotes,
        cvRequestId: cvRequestId || null,
        status: 'offen'
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Deine Angaben für das Anschreiben wurden gespeichert. Wir erstellen dein Anschreiben manuell und melden uns per E-Mail.',
      requestId: letterRequest.id
    });
  } catch (error) {
    console.error('Letter request submission error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern der Anfrage.' },
      { status: 500 }
    );
  }
}
