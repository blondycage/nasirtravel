import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import stripe from '@/lib/utils/stripe';

function serializeConfirmedBooking(booking: any) {
  return {
    _id: booking._id,
    customerName: booking.customerName,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    numberOfTravelers: booking.numberOfTravelers,
    adultTravelers: booking.adultTravelers,
    childTravelers: booking.childTravelers,
    infantTravelers: booking.infantTravelers,
    bookingDate: booking.bookingDate,
    totalAmount: booking.totalAmount,
    quotedTotalAmount: booking.quotedTotalAmount,
    pricePerPerson: booking.pricePerPerson,
    adultPrice: booking.adultPrice,
    childPrice: booking.childPrice,
    infantPrice: booking.infantPrice,
    quotedAdultTravelers: booking.quotedAdultTravelers,
    quotedChildTravelers: booking.quotedChildTravelers,
    quotedInfantTravelers: booking.quotedInfantTravelers,
    paymentStatus: booking.paymentStatus,
    bookingStatus: booking.bookingStatus,
    specialRequests: booking.specialRequests,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const booking = await Booking.findById(params.id);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.paymentStatus !== 'paid' || booking.bookingStatus !== 'confirmed') {
      return NextResponse.json(
        { error: 'Booking payment is still being confirmed. Please refresh in a moment.' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: serializeConfirmedBooking(booking),
    });
  } catch (error: any) {
    console.error('Booking confirmation lookup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load booking confirmation' },
      { status: 500 }
    );
  }
}

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
    booking.pricingStatus = 'paid';
    booking.paymentIntentId = paymentIntent;
    booking.stripePaymentIntentId = paymentIntent;
    await booking.save();

    return NextResponse.json({
      success: true,
      booking: serializeConfirmedBooking(booking),
    });
  } catch (error: any) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm booking' },
      { status: 500 }
    );
  }
}
