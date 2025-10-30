import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import stripe from '@/lib/utils/stripe';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { paymentIntent } = await request.json();

    if (!paymentIntent) {
      return NextResponse.json(
        { error: 'Payment intent is required' },
        { status: 400 }
      );
    }

    // Verify payment with Stripe
    const payment = await stripe.paymentIntents.retrieve(paymentIntent);

    if (payment.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Update booking
    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    booking.paymentIntentId = paymentIntent;
    await booking.save();

    return NextResponse.json({
      success: true,
      booking: {
        _id: booking._id,
        customerName: booking.customerName,
        customerEmail: booking.customerEmail,
        customerPhone: booking.customerPhone,
        numberOfTravelers: booking.numberOfTravelers,
        bookingDate: booking.bookingDate,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        bookingStatus: booking.bookingStatus,
        specialRequests: booking.specialRequests,
      }
    });
  } catch (error: any) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
