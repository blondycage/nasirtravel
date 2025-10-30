import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching booking with ID:', params.id);
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

    console.log('Looking for booking...');
    const booking = await Booking.findById(params.id)
      .populate('tour')
      .populate('user');

    console.log('Booking found:', booking ? 'yes' : 'no');

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    // Allow access if: 1) user field matches, 2) customerEmail matches user's email, 3) is admin
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user._id.toString() === decoded.userId;

    // Get user's email from decoded token or fetch from DB
    let userEmail = decoded.email;
    if (!userEmail) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }

    const isOwnerByEmail = booking.customerEmail === userEmail;

    console.log('Access check - isOwnerByUserId:', isOwnerByUserId, 'isOwnerByEmail:', isOwnerByEmail, 'isAdmin:', isAdmin);

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    console.log('Returning booking data');
    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Get booking error:', error.message);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await request.json();
    const { bookingStatus, paymentStatus } = body;

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Only admin can update booking/payment status
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
