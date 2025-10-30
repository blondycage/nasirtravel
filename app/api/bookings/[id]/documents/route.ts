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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadedDocuments = [];

    for (const file of files) {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `naasirtravel/bookings/${params.id}`,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      }) as any;

      uploadedDocuments.push({
        name: file.name,
        url: result.secure_url,
        publicId: result.public_id,
        uploadedAt: new Date(),
      });
    }

    // Add documents to booking
    booking.documents.push(...uploadedDocuments);
    await booking.save();

    return NextResponse.json({
      success: true,
      data: { documents: uploadedDocuments },
      message: `${uploadedDocuments.length} document(s) uploaded successfully`,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
