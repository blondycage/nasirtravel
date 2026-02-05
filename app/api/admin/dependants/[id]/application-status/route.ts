import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { sendApplicationNeedsRevision, sendApplicationRejected } from '@/lib/utils/email';

// PATCH - Update dependant application status
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

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    const body = await request.json();
    const { status, reason } = body;

    const validStatuses = ['pending', 'submitted', 'under_review', 'accepted', 'rejected', 'needs_revision'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Valid status is required. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate reason is provided for rejection or revision
    if ((status === 'rejected' || status === 'needs_revision') && !reason) {
      return NextResponse.json(
        { error: 'Reason is required when rejecting or requesting revision' },
        { status: 400 }
      );
    }

    // Update dependant
    dependant.applicationStatus = status;
    dependant.applicationReviewedAt = new Date();
    dependant.applicationReviewedBy = decoded.userId;

    if (status === 'rejected' || status === 'needs_revision') {
      dependant.applicationRejectionReason = reason;
    } else {
      dependant.applicationRejectionReason = undefined;
    }

    await dependant.save();

    // Get booking details for email
    const booking = await Booking.findById(dependant.bookingId).populate('tour');

    // Send email notifications
    if (booking) {
      const tourTitle = (booking.tour as any)?.title || 'Unknown Tour';

      try {
        if (status === 'needs_revision' && reason) {
          await sendApplicationNeedsRevision(
            booking.customerEmail,
            booking.customerName,
            'dependant',
            dependant.name,
            reason,
            tourTitle,
            booking._id.toString()
          );
        } else if (status === 'rejected' && reason) {
          await sendApplicationRejected(
            booking.customerEmail,
            booking.customerName,
            'dependant',
            dependant.name,
            reason,
            tourTitle,
            booking._id.toString()
          );
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Continue even if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: `Application status updated to ${status}`,
      data: dependant,
    });
  } catch (error: any) {
    console.error('Update dependant application status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application status' },
      { status: 500 }
    );
  }
}
