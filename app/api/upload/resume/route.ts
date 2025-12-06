import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { put } from '@vercel/blob';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('resume') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen.' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Bitte lade ein PDF, DOC oder DOCX hoch.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximum 10MB erlaubt.' },
        { status: 400 }
      );
    }

    const ext = file.name.split('.').pop();
    if (!ext || ext.length > 10) {
      return NextResponse.json(
        { error: 'Ungültiger Dateiname oder Dateierweiterung.' },
        { status: 400 }
      );
    }

    // Generate unique filename for Blob Storage
    const fileName = `resumes/${user.id}_${Date.now()}.${ext}`;

    // Upload to Vercel Blob Storage
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: true
    });

    return NextResponse.json({
      success: true,
      path: blob.url,
      fileName: blob.pathname
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei.' },
      { status: 500 }
    );
  }
}
