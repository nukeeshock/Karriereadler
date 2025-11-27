import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import crypto from 'crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('photo') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Kein Foto hochgeladen.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Nur JPG und PNG Dateien sind erlaubt.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Datei ist zu groß. Maximum 5MB erlaubt.' },
        { status: 400 }
      );
    }

    // Generate unique filename with validated extension
    const ext = file.name.split('.').pop();
    if (!ext || ext.length > 10) {
      return NextResponse.json(
        { error: 'Ungültiger Dateiname oder Dateierweiterung.' },
        { status: 400 }
      );
    }

    const randomName = crypto.randomBytes(16).toString('hex');
    const fileName = `${user.id}_${randomName}.${ext}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'photos');
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/photos/${fileName}`;

    return NextResponse.json({
      success: true,
      path: publicPath,
      fileName
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Hochladen des Fotos.' },
      { status: 500 }
    );
  }
}
