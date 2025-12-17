import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import { verifyToken } from '@/lib/utils/auth';
import { sendApplicationStatusUpdate } from '@/lib/utils/email';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB();

    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    const { bookingId } = params;
    const { status } = await req.json();

    if (!['pending', 'submitted', 'under_review', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const oldStatus = booking.userApplicationStatus;
    booking.userApplicationStatus = status;
    booking.userApplicationReviewedAt = new Date();
    booking.userApplicationReviewedBy = decoded.userId;

    await booking.save();

    // Send email notification to customer if status changed
    if (oldStatus !== status) {
      try {
        const tour = await Tour.findById(booking.tour);
        const applicationName = booking.userApplicationFormData?.firstName 
          ? `${booking.userApplicationFormData.firstName} ${booking.userApplicationFormData.lastName || ''}`.trim()
          : booking.customerName;
        
        await sendApplicationStatusUpdate(
          booking.customerEmail,
          booking.customerName,
          'user',
          applicationName,
          status,
          tour?.title || 'Unknown Tour',
          booking._id.toString()
        );
      } catch (emailError) {
        console.error('Failed to send application status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      status: booking.userApplicationStatus,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error.message },
      { status: 500 }
    );
  }
}
