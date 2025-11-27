import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { letterRequests, users, UserRole } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const user = await getUser();
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const requests = await db
      .select({
        id: letterRequests.id,
        userId: letterRequests.userId,
        status: letterRequests.status,
        jobTitle: letterRequests.jobTitle,
        companyName: letterRequests.companyName,
        createdAt: letterRequests.createdAt,
        userName: users.name,
        userEmail: users.email
      })
      .from(letterRequests)
      .leftJoin(users, eq(letterRequests.userId, users.id))
      .orderBy(desc(letterRequests.createdAt));

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error fetching letter requests:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Anfragen' }, { status: 500 });
  }
}
