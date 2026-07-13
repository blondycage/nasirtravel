import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { sendBookingQuoteReady } from '@/lib/utils/email';
import { calculateQuoteTotal, getTravelerBreakdown, getTravelerTotal } from '@/lib/utils/travelers';

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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const adultPrice = Number(body.adultPrice ?? body.pricePerPerson);
    const childPrice = body.childPrice === '' || body.childPrice === undefined ? 0 : Number(body.childPrice);
    const infantPrice = body.infantPrice === '' || body.infantPrice === undefined ? 0 : Number(body.infantPrice);
    const quoteNotes = body.quoteNotes;
    const quoteExpiresAt = body.quoteExpiresAt ? new Date(body.quoteExpiresAt) : undefined;

    if (!adultPrice || adultPrice <= 0) {
      return NextResponse.json({ error: 'A valid adult price is required' }, { status: 400 });
    }

    if (childPrice < 0 || infantPrice < 0 || Number.isNaN(childPrice) || Number.isNaN(infantPrice)) {
      return NextResponse.json({ error: 'Child and infant prices cannot be negative' }, { status: 400 });
    }

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.paymentStatus === 'paid') {
      return NextResponse.json({ error: 'Paid bookings cannot be requoted' }, { status: 400 });
    }

    const breakdown = getTravelerBreakdown(booking);
    const travelerCount = getTravelerTotal(breakdown);
    const quoteTotals = calculateQuoteTotal(breakdown, { adultPrice, childPrice, infantPrice });
    const quotedTotalAmount = quoteTotals.total;

    booking.pricePerPerson = adultPrice;
    booking.adultPrice = adultPrice;
    booking.childPrice = childPrice;
    booking.infantPrice = infantPrice;
    booking.quotedTravelerCount = travelerCount;
    booking.quotedAdultTravelers = breakdown.adultTravelers;
    booking.quotedChildTravelers = breakdown.childTravelers;
    booking.quotedInfantTravelers = breakdown.infantTravelers;
    booking.quotedTotalAmount = quotedTotalAmount;
    booking.totalAmount = quotedTotalAmount;
    booking.quoteNotes = quoteNotes;
    booking.quoteSentAt = new Date();
    booking.quoteExpiresAt = quoteExpiresAt;
    booking.pricingStatus = 'quoted';

    await booking.save();
    await booking.populate('tour');
    await booking.populate('user');

    try {
      await sendBookingQuoteReady(booking.customerEmail, {
        customerName: booking.customerName,
        tourTitle: (booking.tour as any)?.title || 'Your selected package',
        bookingId: booking._id.toString(),
        numberOfTravelers: travelerCount,
        pricePerPerson: adultPrice,
        adultTravelers: breakdown.adultTravelers,
        childTravelers: breakdown.childTravelers,
        infantTravelers: breakdown.infantTravelers,
        adultPrice,
        childPrice,
        infantPrice,
        totalAmount: quotedTotalAmount,
        quoteNotes,
        quoteExpiresAt,
      });
    } catch (emailError) {
      console.error('Failed to send booking quote email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Quote sent successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Send quote error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send quote' },
      { status: 500 }
    );
  }
}
