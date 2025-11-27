import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { contactMessages } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = schema.parse(json);

    await db.insert(contactMessages).values({
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message
    });

    // Forward contact mail if configured; otherwise log
    if (process.env.CONTACT_FORWARD_EMAIL) {
      await sendEmail({
        to: process.env.CONTACT_FORWARD_EMAIL,
        subject: `[Karriereadler] ${data.subject}`,
        html: `
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Nachricht:</strong></p>
          <p>${data.message.replace(/\n/g, '<br/>')}</p>
        `
      });
    } else {
      console.log('New contact message (no CONTACT_FORWARD_EMAIL set)', data);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact error', error);
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
