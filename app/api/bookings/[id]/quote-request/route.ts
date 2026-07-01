import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Dependant from '@/lib/models/Dependant';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { sendQuoteRequestReceived } from '@/lib/utils/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const booking = await Booking.findById(params.id).populate('tour');
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;

    let userEmail = decoded.email;
    if (!userEmail && !isOwnerByUserId) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }

    const isOwnerByEmail = booking.customerEmail === userEmail;

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.bookingStatus === 'cancelled') {
      return NextResponse.json({ error: 'Cancelled bookings cannot request confirmation' }, { status: 400 });
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'This booking has already been paid' }, { status: 400 });
    }

    const dependantCount = await Dependant.countDocuments({ bookingId: params.id });
    const currentTravelerCount = 1 + dependantCount;

    if (currentTravelerCount !== booking.numberOfTravelers) {
      return NextResponse.json(
        {
          error: `Traveler count mismatch. This booking is for ${booking.numberOfTravelers} traveler(s), but ${currentTravelerCount} traveler profile(s) are currently attached.`,
        },
        { status: 400 }
      );
    }

    booking.pricingStatus = 'quote_requested';
    booking.quoteRequestedAt = new Date();
    await booking.save();

    try {
      await sendQuoteRequestReceived(booking.customerEmail, {
        customerName: booking.customerName,
        tourTitle: (booking.tour as any)?.title || 'Your selected package',
        bookingId: booking._id.toString(),
        numberOfTravelers: booking.numberOfTravelers,
      });
    } catch (emailError) {
      console.error('Failed to send quote request received email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation requested successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Quote request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to request confirmation' },
      { status: 500 }
    );
  }
}
