import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; docId: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;

    let userEmail = decoded.email;
    if (!userEmail) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }

    const isOwnerByEmail = booking.customerEmail === userEmail;

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Find document
    const docIndex = booking.documents.findIndex(
      (doc: any) => doc._id?.toString() === params.docId || doc.publicId === params.docId
    );

    if (docIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    const document = booking.documents[docIndex];

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(document.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Remove document from booking
    booking.documents.splice(docIndex, 1);
    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
