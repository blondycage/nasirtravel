import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import User from '@/lib/models/User';
import Referral from '@/lib/models/Referral';
import stripe from '@/lib/utils/stripe';
import { calculateReward } from '@/lib/utils/referral';

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

    // Create referral record if this booking used a referral code
    // Isolated in its own try/catch — never blocks booking confirmation
    try {
      if (booking.referralCode) {
        const existing = await Referral.findOne({ booking: booking._id });
        if (!existing) {
          const referrer = await User.findOne({ referralCode: booking.referralCode });
          const tour = await Tour.findById(booking.tour);

          if (referrer && tour) {
            const rewardType = tour.referralRewardType;
            const rewardValue = tour.referralRewardValue ?? 0;

            if (rewardType && rewardType !== 'none' && rewardValue > 0) {
              const rewardAmount = calculateReward(rewardType, rewardValue, booking.totalAmount);
              const referral = await Referral.create({
                referrer: referrer._id,
                referred: booking.user,
                booking: booking._id,
                tour: tour._id,
                referralCode: booking.referralCode,
                rewardType,
                rewardValue,
                rewardAmount,
                status: 'pending',
                statusHistory: [],
              });
              // Write Referral ID back onto Booking for bidirectional lookup
              await Booking.findByIdAndUpdate(booking._id, { referral: referral._id });
            }
          }
        }
      }
    } catch (referralError) {
      console.error('Failed to create referral record (non-blocking):', referralError);
    }

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
