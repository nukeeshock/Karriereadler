import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

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

    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${user.id}_${randomName}.${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes');
    await mkdir(uploadDir, { recursive: true });

    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicPath = `/uploads/resumes/${fileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen der Datei.' },
      { status: 500 }
    );
  }
}
