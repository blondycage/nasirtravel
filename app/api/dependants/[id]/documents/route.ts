import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import { verifyToken } from '@/lib/utils/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/utils/cloudinary';

// POST - Upload document for dependant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && dependant.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json(
        { error: 'File and name are required' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await uploadToCloudinary(base64, 'dependants');

    dependant.documents.push({
      name,
      url: result.url,
      publicId: result.publicId,
      uploadedAt: new Date(),
    });

    await dependant.save();

    return NextResponse.json({
      success: true,
      document: dependant.documents[dependant.documents.length - 1],
    });
  } catch (error: any) {
    console.error('Upload document error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
