import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import { sendBookingConfirmation } from '@/lib/utils/email';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    let userId = searchParams.get('userId');

    // If userId not in query, try to get from token
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      const token = getTokenFromHeader(authHeader);
      if (token) {
        const decoded = verifyToken(token) as any;
        if (decoded && decoded.userId) {
          userId = decoded.userId;
        }
      }
    }

    console.log('GET /api/bookings - userId:', userId);

    const filter: any = {};
    if (userId) {
      filter.user = userId;
    }

    const bookings = await Booking.find(filter)
      .populate('tour')
      .populate('user')
      .sort({ createdAt: -1 });

    console.log('Found bookings:', bookings.length);
    console.log('First booking sample:', bookings[0] ? {
      _id: bookings[0]._id,
      tour: bookings[0].tour?._id || bookings[0].tour,
      user: bookings[0].user?._id || bookings[0].user,
      customerEmail: bookings[0].customerEmail
    } : 'none');

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const tourId = body.tour || body.tourId;
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Ensure tour field is set correctly
    const bookingData = {
      ...body,
      tour: tourId,
    };
    delete bookingData.tourId; // Remove tourId if it exists

    const booking = await Booking.create(bookingData);

    // Send confirmation email
    try {
      await sendBookingConfirmation(booking.customerEmail, {
        customerName: booking.customerName,
        tourTitle: tour.title,
        bookingDate: booking.bookingDate.toISOString(),
        numberOfTravelers: booking.numberOfTravelers,
        totalAmount: booking.totalAmount,
        bookingId: booking._id.toString(),
      });
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
