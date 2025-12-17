import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import { verifyToken } from '@/lib/utils/auth';
import { sendApplicationStatusUpdate } from '@/lib/utils/email';

export async function GET(
  req: NextRequest,
  { params }: { params: { dependantId: string } }
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

    const { dependantId } = params;

    const dependant = await Dependant.findById(dependantId).populate('bookingId userId');
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    const booking = await Booking.findById(dependant.bookingId).populate('tour');

    return NextResponse.json({
      success: true,
      dependant,
      booking,
    });
  } catch (error: any) {
    console.error('Error fetching dependant application:', error);
    return NextResponse.json(
      { error: 'Failed to fetch application', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { dependantId: string } }
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

    const { dependantId } = params;
    const { status } = await req.json();

    if (!['pending', 'submitted', 'under_review', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const dependant = await Dependant.findById(dependantId);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    const oldStatus = dependant.applicationStatus;
    dependant.applicationStatus = status;
    dependant.applicationReviewedAt = new Date();
    dependant.applicationReviewedBy = decoded.userId;

    await dependant.save();

    // Send email notification to customer if status changed
    if (oldStatus !== status) {
      try {
        const booking = await Booking.findById(dependant.bookingId);
        if (booking) {
          const tour = await Tour.findById(booking.tour);
          const applicationName = dependant.firstName 
            ? `${dependant.firstName} ${dependant.lastName || ''}`.trim()
            : dependant.name;
          
          await sendApplicationStatusUpdate(
            booking.customerEmail,
            booking.customerName,
            'dependant',
            applicationName,
            status,
            tour?.title || 'Unknown Tour',
            booking._id.toString()
          );
        }
      } catch (emailError) {
        console.error('Failed to send application status update email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application status updated successfully',
      status: dependant.applicationStatus,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error.message },
      { status: 500 }
    );
  }
}
