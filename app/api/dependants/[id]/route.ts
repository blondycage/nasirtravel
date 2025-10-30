import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Dependant';
import { verifyToken } from '@/lib/utils/auth';
import { deleteFromCloudinary } from '@/lib/utils/cloudinary';

// DELETE - Delete a dependant
export async function DELETE(
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

    // Verify ownership
    if (user.role !== 'admin' && dependant.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete all associated documents from Cloudinary
    for (const doc of dependant.documents) {
      try {
        await deleteFromCloudinary(doc.publicId);
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }

    await Dependant.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete dependant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dependant' },
      { status: 500 }
    );
  }
}
