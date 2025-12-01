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

// Escape HTML special characters to prevent injection
function escapeHtml(text: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, (char) => htmlEscapes[char]);
}

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

    // Forward contact mail if configured; otherwise log (without PII)
    if (process.env.CONTACT_FORWARD_EMAIL) {
      // Escape user input before embedding in HTML
      const safeName = escapeHtml(data.name);
      const safeEmail = escapeHtml(data.email);
      const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br/>');
      
      await sendEmail({
        to: process.env.CONTACT_FORWARD_EMAIL,
        subject: `[Karriereadler] ${data.subject}`,
        html: `
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Nachricht:</strong></p>
          <p>${safeMessage}</p>
        `
      });
    } else {
      console.log('New contact message received (no CONTACT_FORWARD_EMAIL set)');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact form error');
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
