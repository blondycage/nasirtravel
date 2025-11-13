import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { deleteFromCloudinary } from '@/lib/utils/cloudinary';

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

    let documentFound = false;
    let publicIdToDelete: string | null = null;

    // Check userPersonalPassportPicture
    if (booking.userPersonalPassportPicture && 
        (booking.userPersonalPassportPicture._id?.toString() === params.docId || 
         booking.userPersonalPassportPicture.publicId === params.docId)) {
      publicIdToDelete = booking.userPersonalPassportPicture.publicId;
      booking.userPersonalPassportPicture = undefined;
      documentFound = true;
    }
    // Check userInternationalPassport
    else if (booking.userInternationalPassport && 
             (booking.userInternationalPassport._id?.toString() === params.docId || 
              booking.userInternationalPassport.publicId === params.docId)) {
      publicIdToDelete = booking.userInternationalPassport.publicId;
      booking.userInternationalPassport = undefined;
      documentFound = true;
    }
    // Check userSupportingDocuments array
    else if (booking.userSupportingDocuments && booking.userSupportingDocuments.length > 0) {
      const docIndex = booking.userSupportingDocuments.findIndex(
        (doc: any) => doc._id?.toString() === params.docId || doc.publicId === params.docId
      );
      
      if (docIndex !== -1) {
        publicIdToDelete = booking.userSupportingDocuments[docIndex].publicId;
        booking.userSupportingDocuments.splice(docIndex, 1);
        documentFound = true;
      }
    }
    // Also check general documents array (for backward compatibility)
    if (!documentFound && booking.documents && booking.documents.length > 0) {
      const docIndex = booking.documents.findIndex(
        (doc: any) => doc._id?.toString() === params.docId || doc.publicId === params.docId
      );
      
      if (docIndex !== -1) {
        publicIdToDelete = booking.documents[docIndex].publicId;
        booking.documents.splice(docIndex, 1);
        documentFound = true;
      }
    }

    if (!documentFound) {
      return NextResponse.json(
        { success: false, error: 'Document not found' },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    if (publicIdToDelete) {
      try {
        await deleteFromCloudinary(publicIdToDelete);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue even if Cloudinary deletion fails
      }
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error: any) {
    console.error('Document deletion error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
