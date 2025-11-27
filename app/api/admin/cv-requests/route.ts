import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { cvRequests, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const requests = await db
      .select({
        id: cvRequests.id,
        userId: cvRequests.userId,
        status: cvRequests.status,
        firstName: cvRequests.firstName,
        lastName: cvRequests.lastName,
        email: cvRequests.email,
        createdAt: cvRequests.createdAt,
        userName: users.name,
        userEmail: users.email
      })
      .from(cvRequests)
      .leftJoin(users, eq(cvRequests.userId, users.id))
      .orderBy(desc(cvRequests.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching CV requests:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Anfragen' }, { status: 500 });
  }
}
