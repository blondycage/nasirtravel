import { NextRequest, NextResponse } from 'next/server';
import { createPaymentIntent } from '@/lib/utils/stripe';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { bookingId } = body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Use the admin-issued quote amount. Legacy bookings may still only have totalAmount.
    const amount = booking.quotedTotalAmount || booking.totalAmount;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'This booking has not been priced yet' }, { status: 400 });
    }

    const legacyPricedBooking = booking.totalAmount > 0 && !booking.quotedTotalAmount;
    const paymentAllowedStatuses = ['quoted', 'accepted', 'payment_pending'];
    if (!legacyPricedBooking && !paymentAllowedStatuses.includes(booking.pricingStatus)) {
      return NextResponse.json(
        { success: false, error: 'Payment is available only after a quote has been issued' },
        { status: 400 }
      );
    }

    const paymentIntent = await createPaymentIntent(amount, {
      bookingId: booking._id.toString(),
      customerEmail: booking.customerEmail,
      customerName: booking.customerName,
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    // Update booking with payment intent ID using findByIdAndUpdate to avoid version conflicts
    await Booking.findByIdAndUpdate(bookingId, {
      paymentIntentId: paymentIntent.id,
      stripePaymentIntentId: paymentIntent.id,
      pricingStatus: booking.pricingStatus === 'quoted' ? 'payment_pending' : booking.pricingStatus,
    });

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      amount: Math.round(amount * 100), // Return amount in cents for frontend
    });
  } catch (error: any) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
