import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import { sendBookingConfirmation } from '@/lib/utils/email';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const filter: any = {};
    if (userId) {
      filter.user = userId;
    }

    const bookings = await Booking.find(filter)
      .populate('tour')
      .populate('user')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
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
