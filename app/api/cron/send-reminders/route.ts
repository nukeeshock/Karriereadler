import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { orderRequests, OrderStatus } from '@/lib/db/schema';
import { eq, and, isNull, lt } from 'drizzle-orm';
import { sendReminderEmail } from '@/lib/email';

// Vercel Cron jobs send this header for authentication
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  // SECURITY: Always require authentication - reject if no secret configured
  const authHeader = request.headers.get('authorization');
  
  if (!CRON_SECRET) {
    console.error('[Cron Reminder] CRON_SECRET not configured - rejecting request');
    return NextResponse.json({ error: 'Cron not configured' }, { status: 500 });
  }
  
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.log('[Cron Reminder] Unauthorized request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find orders that need a reminder:
    // 1. Status is PAID (payment confirmed but questionnaire not filled)
    // 2. formData is null (questionnaire not completed)
    // 3. reminderSentAt is null (no reminder sent yet)
    // 4. createdAt is more than 3 hours ago
    // 
    // Note: This cron runs daily at 9:00 AM (Vercel Hobby plan limit).
    // All qualifying orders will receive their reminder in the morning batch.
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const ordersNeedingReminder = await db
      .select({
        id: orderRequests.id,
        customerEmail: orderRequests.customerEmail,
        customerName: orderRequests.customerName,
        createdAt: orderRequests.createdAt
      })
      .from(orderRequests)
      .where(
        and(
          eq(orderRequests.status, OrderStatus.PAID),
          isNull(orderRequests.formData),
          isNull(orderRequests.reminderSentAt),
          lt(orderRequests.createdAt, threeHoursAgo)
        )
      );

    console.log(`[Cron Reminder] Found ${ordersNeedingReminder.length} orders needing reminder`);

    let sentCount = 0;
    let errorCount = 0;

    for (const order of ordersNeedingReminder) {
      try {
        // Send reminder email
        await sendReminderEmail(
          order.customerEmail,
          order.id,
          order.customerName
        );

        // Update reminderSentAt to prevent duplicate sends
        await db
          .update(orderRequests)
          .set({ reminderSentAt: new Date() })
          .where(eq(orderRequests.id, order.id));

        sentCount++;
        console.log(`[Cron Reminder] Sent reminder for order #${order.id}`);
      } catch (emailError) {
        errorCount++;
        console.error(`[Cron Reminder] Failed to send reminder for order #${order.id}:`, emailError);
        // Continue with other orders even if one fails
      }
    }

    return NextResponse.json({
      success: true,
      processed: ordersNeedingReminder.length,
      sent: sentCount,
      errors: errorCount
    });
  } catch (error) {
    console.error('[Cron Reminder] Critical error:', error);
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}

