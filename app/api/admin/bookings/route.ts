import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
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

    const bookings = await Booking.find()
      .populate('tourId')
      .populate('userId')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings, bookings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
