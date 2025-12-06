import { and, eq, isNull, desc, sql, inArray } from 'drizzle-orm';
import { db } from './drizzle';
import { teams, users, orderRequests, OrderStatus, type OrderRequest } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  // Verify session version matches (for session invalidation on password change)
  // Allow sessions without version for backward compatibility during migration
  const sessionVersion = sessionData.user.sessionVersion;
  if (sessionVersion !== undefined && user[0].sessionVersion !== sessionVersion) {
    // Session was invalidated (e.g., password was changed)
    return null;
  }

  return user[0];
}

// ============================================================================
// LEGACY: Team functions kept only for Stripe webhook backward compatibility
// These handle subscription cancellation events for old customers
// ============================================================================

/** @deprecated Teams are no longer used - kept for legacy Stripe webhook handling */
export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/** @deprecated Teams are no longer used - kept for legacy Stripe webhook handling */
export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date()
    })
    .where(eq(teams.id, teamId));
}

// ============================================================================
// Order Queries
// ============================================================================

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: number): Promise<OrderRequest | null> {
  const [order] = await db
    .select()
    .from(orderRequests)
    .where(eq(orderRequests.id, orderId))
    .limit(1);

  return order || null;
}

/**
 * Get orders for a specific user with pagination
 */
export async function getOrdersByUserId(
  userId: number,
  options: { page?: number; limit?: number } = {}
): Promise<{ orders: OrderRequest[]; total: number }> {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orderRequests)
    .where(eq(orderRequests.userId, userId));

  const orders = await db
    .select()
    .from(orderRequests)
    .where(eq(orderRequests.userId, userId))
    .orderBy(desc(orderRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return { orders, total: count };
}

/**
 * Get all orders (admin) with pagination
 */
export async function getAllOrders(
  options: { page?: number; limit?: number; status?: OrderStatus[] } = {}
): Promise<{ orders: OrderRequest[]; total: number }> {
  const { page = 1, limit = 50, status } = options;
  const offset = (page - 1) * limit;

  const whereClause = status?.length
    ? inArray(orderRequests.status, status)
    : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orderRequests)
    .where(whereClause);

  const orders = await db
    .select()
    .from(orderRequests)
    .where(whereClause)
    .orderBy(desc(orderRequests.createdAt))
    .limit(limit)
    .offset(offset);

  return { orders, total: count };
}

/**
 * Update order status with optimistic locking
 * Returns the updated order or null if the status didn't match
 */
export async function updateOrderStatus(
  orderId: number,
  fromStatus: OrderStatus,
  toStatus: OrderStatus,
  additionalData?: Partial<OrderRequest>
): Promise<OrderRequest | null> {
  const [updated] = await db
    .update(orderRequests)
    .set({
      status: toStatus,
      updatedAt: new Date(),
      ...additionalData
    })
    .where(
      and(
        eq(orderRequests.id, orderId),
        eq(orderRequests.status, fromStatus)
      )
    )
    .returning();

  return updated || null;
}

/**
 * Get orders pending questionnaire (PAID status, no formData)
 * Used for sending reminder emails
 */
export async function getOrdersPendingQuestionnaire(): Promise<OrderRequest[]> {
  return db
    .select()
    .from(orderRequests)
    .where(
      and(
        eq(orderRequests.status, OrderStatus.PAID),
        isNull(orderRequests.formData)
      )
    )
    .orderBy(orderRequests.createdAt);
}

/**
 * Get order count by status for a user (for dashboard stats)
 */
export async function getOrderCountsByStatus(userId: number): Promise<Record<string, number>> {
  const counts = await db
    .select({
      status: orderRequests.status,
      count: sql<number>`count(*)::int`
    })
    .from(orderRequests)
    .where(eq(orderRequests.userId, userId))
    .groupBy(orderRequests.status);

  const result: Record<string, number> = {};
  for (const row of counts) {
    result[row.status] = row.count;
  }
  return result;
}
