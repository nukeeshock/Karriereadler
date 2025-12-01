import { getUser } from '@/lib/db/queries';

export async function GET() {
  const user = await getUser();
  
  if (!user) {
    return Response.json(null);
  }

  // Remove sensitive fields before returning
  const { passwordHash, verificationToken, verificationTokenExpiry, passwordResetToken, passwordResetTokenExpiry, ...safeUser } = user;
  
  return Response.json(safeUser);
}
