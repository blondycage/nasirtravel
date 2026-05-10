import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Referral from '@/lib/models/Referral';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (decoded?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    // 1. Orphans — bookings that used a referral code but have no Referral document
    const bookingsWithCode = await Booking.find(
      { referralCode: { $exists: true, $ne: null } },
      { _id: 1, referralCode: 1, referral: 1, totalAmount: 1, customerName: 1, bookingDate: 1, paymentStatus: 1, bookingStatus: 1 }
    ).populate('tour', 'title').lean();

    const orphans = bookingsWithCode.filter(b => !b.referral);

    // 2. Status mismatches — Referral is active (pending/confirmed/paid) but Booking is cancelled/refunded
    const activeReferrals = await Referral.find(
      { status: { $in: ['pending', 'confirmed', 'paid'] } }
    )
      .populate('booking', 'paymentStatus bookingStatus customerName totalAmount bookingDate')
      .populate('referrer', 'name email')
      .lean();

    const mismatches = activeReferrals.filter(r => {
      const b = r.booking as any;
      if (!b) return true; // booking deleted — always a mismatch
      return b.bookingStatus === 'cancelled' || b.paymentStatus === 'refunded';
    });

    // 3. Unlinked — Referral documents where Booking.referral pointer is missing
    //    (created before we added the bidirectional link)
    const allReferralBookingIds = await Referral.distinct('booking');
    const bookingsWithoutBacklink = await Booking.find(
      {
        _id: { $in: allReferralBookingIds },
        referral: { $exists: false },
      },
      { _id: 1, customerName: 1, referralCode: 1, totalAmount: 1 }
    ).lean();

    // Summary counts
    const totalWithCode = bookingsWithCode.length;
    const totalReferrals = await Referral.countDocuments();
    const matchRate = totalWithCode > 0
      ? (((totalWithCode - orphans.length) / totalWithCode) * 100).toFixed(1)
      : '100.0';

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          bookingsWithReferralCode: totalWithCode,
          referralRecordsCreated: totalReferrals,
          orphanCount: orphans.length,
          mismatchCount: mismatches.length,
          unlinkCount: bookingsWithoutBacklink.length,
          matchRate: `${matchRate}%`,
        },
        orphans,
        mismatches,
        unlinked: bookingsWithoutBacklink,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Fix an orphan — create the missing Referral record for a booking that has a code but no record
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (decoded?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { bookingId } = await request.json();

    const booking = await Booking.findById(bookingId).populate('tour');
    if (!booking) return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    if (!booking.referralCode) return NextResponse.json({ success: false, error: 'Booking has no referral code' }, { status: 400 });

    const existing = await Referral.findOne({ booking: booking._id });
    if (existing) return NextResponse.json({ success: false, error: 'Referral already exists for this booking' }, { status: 409 });

    const User = (await import('@/lib/models/User')).default;
    const { calculateReward } = await import('@/lib/utils/referral');

    const referrer = await User.findOne({ referralCode: booking.referralCode });
    if (!referrer) return NextResponse.json({ success: false, error: 'Referral code owner not found' }, { status: 404 });

    const tour = booking.tour as any;
    const rewardType = tour?.referralRewardType;
    const rewardValue = tour?.referralRewardValue ?? 0;

    if (!rewardType || rewardType === 'none' || rewardValue <= 0) {
      return NextResponse.json({ success: false, error: 'Package has no referral reward configured' }, { status: 400 });
    }

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
      statusHistory: [{
        from: 'none',
        to: 'pending',
        changedBy: decoded.userId,
        changedAt: new Date(),
        note: 'Manually created via reconciliation tool',
      }],
    });

    await Booking.findByIdAndUpdate(booking._id, { referral: referral._id });

    return NextResponse.json({ success: true, data: referral }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
