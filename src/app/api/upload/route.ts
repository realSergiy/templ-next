import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data: FormData = await request.formData();
    const file: FormDataEntryValue | null = data.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file received' });
    }

    if (typeof file === 'string') {
      return NextResponse.json({ success: false, message: 'Invalid file data received' });
    }

    const bytes: ArrayBuffer = await file.arrayBuffer();
    const buffer: Buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filePath = path.join(process.cwd(), 'data', filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: filename,
      size: file.size,
      type: file.type,
    });
  } catch (e: unknown) {
    console.error('Error uploading file:', e);
    return NextResponse.json({
      success: false,
      message: 'Error uploading file',
    });
  }
}
