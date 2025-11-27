import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { analyticsEvents, UserRole } from '@/lib/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: Request) {
  const user = await getUser();
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.OWNER)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.max(1, Math.min(90, Number(searchParams.get('days')) || 30));

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const dateFilter = gte(analyticsEvents.createdAt, cutoffDate);
  const eventFilter = eq(analyticsEvents.event, 'pageview');
  const whereClause = and(eventFilter, dateFilter);

  const [overview] = await db
    .select({
      totalPageViews: sql<number>`count(*)`,
      uniqueVisitors: sql<number>`count(distinct ${analyticsEvents.visitorId})`,
      sessions: sql<number>`count(distinct ${analyticsEvents.sessionId})`,
      newVisitors: sql<number>`count(distinct case when ${analyticsEvents.isNewVisitor} then ${analyticsEvents.visitorId} end)`
    })
    .from(analyticsEvents)
    .where(whereClause);

  const sessionDurations = await db
    .select({
      sessionId: analyticsEvents.sessionId,
      totalDuration: sql<number>`coalesce(sum(${analyticsEvents.durationMs}), 0)`
    })
    .from(analyticsEvents)
    .where(whereClause)
    .groupBy(analyticsEvents.sessionId);

  const pageStats = await db
    .select({
      page: analyticsEvents.page,
      views: sql<number>`count(*)`,
      avgTime: sql<number>`coalesce(avg(${analyticsEvents.durationMs}), 0)`
    })
    .from(analyticsEvents)
    .where(whereClause)
    .groupBy(analyticsEvents.page);

  const sessionsCount = Number(overview?.sessions || 0);
  const totalDuration = sessionDurations.reduce((acc, curr) => acc + Number(curr.totalDuration || 0), 0);
  const avgSessionDuration = sessionsCount > 0 ? Math.round(totalDuration / sessionsCount) : 0;

  return NextResponse.json({
    days,
    totalVisitors: Number(overview?.totalPageViews || 0),
    uniqueVisitors: Number(overview?.uniqueVisitors || 0),
    newVisitors: Number(overview?.newVisitors || 0),
    returningVisitors: Math.max(
      0,
      Number(overview?.uniqueVisitors || 0) - Number(overview?.newVisitors || 0)
    ),
    totalPageViews: Number(overview?.totalPageViews || 0),
    averageSessionDurationMs: avgSessionDuration,
    averagePagesPerSession:
      sessionsCount > 0 ? Number(overview?.totalPageViews || 0) / sessionsCount : 0,
    pages: pageStats.map((p) => ({
      page: p.page,
      views: Number(p.views || 0),
      averageTimeMs: Math.round(Number(p.avgTime || 0))
    }))
  });
}
