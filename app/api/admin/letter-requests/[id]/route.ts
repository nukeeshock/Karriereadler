import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { letterRequests, users, cvRequests, UserRole } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

function extractId(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split('/').filter(Boolean);
  const id = segments[segments.length - 1];
  return Number(id);
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const requestId = extractId(req);
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: 'Ungültige Anfrage-ID' }, { status: 400 });
    }

    const [request] = await db
      .select()
      .from(letterRequests)
      .where(eq(letterRequests.id, requestId))
      .leftJoin(users, eq(letterRequests.userId, users.id))
      .leftJoin(cvRequests, eq(letterRequests.cvRequestId, cvRequests.id));

    if (!request) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching letter request:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Anfrage' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest
) {
  try {
    const user = await getUser();
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER)) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const requestId = extractId(req);
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: 'Ungültige Anfrage-ID' }, { status: 400 });
    }
    const body = await req.json();
    const { status } = body;

    if (!status || !['offen', 'in_bearbeitung', 'fertig'].includes(status)) {
      return NextResponse.json({ error: 'Ungültiger Status' }, { status: 400 });
    }

    const [updated] = await db
      .update(letterRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(letterRequests.id, requestId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('Error updating letter request:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
