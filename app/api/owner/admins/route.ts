import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { users, UserRole } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

const actionSchema = z.object({
  email: z.string().email(),
  action: z.enum(['add', 'remove'])
});

function isOwner(userRole: string | null | undefined) {
  return userRole === UserRole.OWNER;
}

export async function GET() {
  const user = await getUser();
  if (!user || !isOwner(user.role)) {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  }

  const admins = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    })
    .from(users)
    .where(inArray(users.role, [UserRole.ADMIN, UserRole.OWNER]));

  return NextResponse.json({ admins });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user || !isOwner(user.role)) {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 });
  }

  try {
    const json = await request.json();
    const data = actionSchema.parse(json);

    const [target] = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (data.action === 'add') {
      await db.update(users).set({ role: UserRole.ADMIN }).where(eq(users.id, target.id));
      return NextResponse.json({ ok: true, message: 'Admin role granted' });
    }

    if (target.role === UserRole.OWNER) {
      return NextResponse.json({ error: 'Cannot demote another owner' }, { status: 400 });
    }

    await db.update(users).set({ role: UserRole.MEMBER }).where(eq(users.id, target.id));
    return NextResponse.json({ ok: true, message: 'Admin role removed' });
  } catch (error) {
    console.error('Owner admin update failed', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
