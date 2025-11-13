import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/utils/cloudinary';

// POST - Upload document for user (main applicant)
export async function POST(
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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;
    
    let userEmail = decoded.email;
    if (!userEmail && !isOwnerByUserId) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }
    
    const isOwnerByEmail = booking.customerEmail === userEmail;

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('documentType') as string;
    const name = formData.get('name') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validTypes = ['personal_passport_picture', 'international_passport', 'supporting_document'];
    if (!documentType || !validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Valid documentType is required (personal_passport_picture, international_passport, or supporting_document)' },
        { status: 400 }
      );
    }

    // For supporting documents, name is required
    if (documentType === 'supporting_document' && !name) {
      return NextResponse.json(
        { error: 'Document name is required for supporting documents' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    // Upload to Cloudinary with proper folder structure
    const folder = `bookings/${params.id}/user`;
    const result = await uploadToCloudinary(base64, folder);

    const document = {
      name: documentType === 'supporting_document' ? name : (documentType === 'personal_passport_picture' ? 'Personal Passport Picture' : 'International Passport'),
      url: result.url,
      publicId: result.publicId,
      documentType: documentType as 'personal_passport_picture' | 'international_passport' | 'supporting_document',
      uploadedAt: new Date(),
    };

    // Handle specific document types
    if (documentType === 'personal_passport_picture') {
      // Delete old personal passport picture if exists
      if (booking.userPersonalPassportPicture?.publicId) {
        try {
          await deleteFromCloudinary(booking.userPersonalPassportPicture.publicId);
        } catch (error) {
          console.error('Error deleting old personal passport picture:', error);
        }
      }
      booking.userPersonalPassportPicture = document;
    } else if (documentType === 'international_passport') {
      // Delete old international passport if exists
      if (booking.userInternationalPassport?.publicId) {
        try {
          await deleteFromCloudinary(booking.userInternationalPassport.publicId);
        } catch (error) {
          console.error('Error deleting old international passport:', error);
        }
      }
      booking.userInternationalPassport = document;
    } else if (documentType === 'supporting_document') {
      // Add to supporting documents array
      if (!booking.userSupportingDocuments) {
        booking.userSupportingDocuments = [];
      }
      booking.userSupportingDocuments.push(document);
    }

    // Also add to general documents array for backward compatibility
    booking.documents.push(document);

    await booking.save();

    return NextResponse.json({
      success: true,
      document: document,
    });
  } catch (error: any) {
    console.error('Upload user document error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
