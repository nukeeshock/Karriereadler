import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { analyticsEvents } from '@/lib/db/schema';

const eventSchema = z.object({
  visitorId: z.string().min(6),
  sessionId: z.string().min(6),
  page: z.string().min(1),
  // Accept floats from performance.now(), round to integer in handler
  durationMs: z.number().nonnegative().optional(),
  isNewVisitor: z.boolean().optional(),
  isNewSession: z.boolean().optional(),
  metadata: z.record(z.any()).optional()
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = eventSchema.parse(json);
    const roundedDuration = typeof data.durationMs === 'number'
      ? Math.round(data.durationMs)
      : null;

    await db.insert(analyticsEvents).values({
      visitorId: data.visitorId,
      sessionId: data.sessionId,
      page: data.page,
      durationMs: roundedDuration,
      isNewVisitor: data.isNewVisitor ?? false,
      isNewSession: data.isNewSession ?? false,
      metadata: data.metadata,
      event: 'pageview'
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Analytics event error', error);
    return NextResponse.json({ error: 'Invalid analytics payload' }, { status: 400 });
  }
}
