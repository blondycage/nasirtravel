import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import { verifyToken } from '@/lib/utils/auth';
import { deleteFromCloudinary } from '@/lib/utils/cloudinary';

// DELETE - Delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
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

    const document = dependant.documents.id(params.docId);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(document.publicId);

    // Remove from array
    dependant.documents.pull(params.docId);
    await dependant.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
