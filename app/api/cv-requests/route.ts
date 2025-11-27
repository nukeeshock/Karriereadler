import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { cvRequests } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await db
      .select({
        id: cvRequests.id,
        firstName: cvRequests.firstName,
        lastName: cvRequests.lastName,
        language: cvRequests.language,
        createdAt: cvRequests.createdAt
      })
      .from(cvRequests)
      .where(eq(cvRequests.userId, user.id))
      .orderBy(desc(cvRequests.createdAt))
      .limit(10);

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching CV requests:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der CV-Anfragen' }, { status: 500 });
  }
}
