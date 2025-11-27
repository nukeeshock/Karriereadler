import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { cvRequests, users } from '@/lib/db/schema';
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
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const requestId = extractId(req);
    if (Number.isNaN(requestId)) {
      return NextResponse.json({ error: 'Ungültige Anfrage-ID' }, { status: 400 });
    }

    const [request] = await db
      .select()
      .from(cvRequests)
      .where(eq(cvRequests.id, requestId))
      .leftJoin(users, eq(cvRequests.userId, users.id));

    if (!request) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error fetching CV request:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Anfrage' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest
) {
  try {
    const user = await getUser();
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) {
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
      .update(cvRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(cvRequests.id, requestId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, status: updated.status });
  } catch (error) {
    console.error('Error updating CV request:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
  }
}
