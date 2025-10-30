import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import Review from '@/lib/models/Review';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const totalTours = await Tour.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ bookingStatus: 'pending' });
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();

    return NextResponse.json({
      success: true,
      data: {
        totalTours,
        totalBookings,
        pendingBookings,
        totalUsers,
        totalReviews,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
