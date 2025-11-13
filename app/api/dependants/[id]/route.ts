import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { deleteFromCloudinary } from '@/lib/utils/cloudinary';

// DELETE - Delete a dependant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    // Verify ownership
    if (decoded.role !== 'admin' && dependant.userId.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if application is closed (only admin can bypass this)
    const booking = await Booking.findById(dependant.bookingId);
    if (booking && booking.applicationClosed && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Application process has been closed. Cannot remove dependants.' },
        { status: 400 }
      );
    }

    // Delete all associated documents from Cloudinary
    if (dependant.personalPassportPicture?.publicId) {
      try {
        await deleteFromCloudinary(dependant.personalPassportPicture.publicId);
      } catch (error) {
        console.error('Error deleting personal passport picture:', error);
      }
    }

    if (dependant.internationalPassport?.publicId) {
      try {
        await deleteFromCloudinary(dependant.internationalPassport.publicId);
      } catch (error) {
        console.error('Error deleting international passport:', error);
      }
    }

    if (dependant.supportingDocuments) {
      for (const doc of dependant.supportingDocuments) {
        try {
          await deleteFromCloudinary(doc.publicId);
        } catch (error) {
          console.error('Error deleting supporting document:', error);
        }
      }
    }

    // Also delete from general documents array
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
