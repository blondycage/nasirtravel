import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/utils/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await uploadToCloudinary(base64);

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
