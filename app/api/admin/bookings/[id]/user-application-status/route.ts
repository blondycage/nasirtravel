import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// PATCH - Update user application status
export async function PATCH(
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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'submitted', 'under_review', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Valid status is required. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    booking.userApplicationStatus = status;
    booking.userApplicationReviewedAt = new Date();
    booking.userApplicationReviewedBy = decoded.userId;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `User application status updated to ${status}`,
      data: booking,
    });
  } catch (error: any) {
    console.error('Update user application status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application status' },
      { status: 500 }
    );
  }
}
