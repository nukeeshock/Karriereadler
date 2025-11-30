import { NextResponse } from 'next/server';
import { sendVerificationEmail, generateVerificationToken } from '@/lib/email';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
  }

  try {
    const token = generateVerificationToken();
    await sendVerificationEmail(email, token);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent (or logged to console in dev mode)',
      email,
      token: token.substring(0, 10) + '...' // Show first 10 chars only
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error)
    }, { status: 500 });
  }
}
