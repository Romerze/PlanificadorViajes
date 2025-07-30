import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Upload API called');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('❌ No session found');
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    console.log('✅ Session found:', session.user.id);

    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.log('❌ No file found in form data');
      return NextResponse.json({ message: 'No se encontró archivo' }, { status: 400 });
    }

    console.log('📁 File received:', file.name, file.size, file.type);

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: 'El archivo es demasiado grande. Máximo 10MB.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ message: 'Tipo de archivo no permitido. Solo PDF, JPG, PNG y GIF.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log('📝 Generated filename:', fileName);
    
    // Create uploads directory path
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadsDir, fileName);

    console.log('📂 Uploads directory:', uploadsDir);
    console.log('📄 File path:', filePath);

    // Ensure uploads directory exists
    try {
      await writeFile(filePath, buffer);
      console.log('✅ File written successfully');
    } catch (error) {
      console.log('❌ Error writing file, trying to create directory');
      // If directory doesn't exist, create it
      const fs = require('fs');
      if (!fs.existsSync(uploadsDir)) {
        console.log('📁 Creating uploads directory');
        fs.mkdirSync(uploadsDir, { recursive: true });
        await writeFile(filePath, buffer);
        console.log('✅ File written after creating directory');
      } else {
        console.log('❌ Directory exists but write failed:', error);
        throw error;
      }
    }

    // Return the public URL (accessible directly from /uploads)
    const fileUrl = `/uploads/${fileName}`;

    console.log('🔗 Generated URL:', fileUrl);

    return NextResponse.json({
      fileUrl,
      fileName: file.name,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}