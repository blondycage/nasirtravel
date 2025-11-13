import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

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
    const { status } = body;

    const validStatuses = ['pending', 'submitted', 'under_review', 'accepted', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Valid status is required. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    dependant.applicationStatus = status;
    dependant.applicationReviewedAt = new Date();
    dependant.applicationReviewedBy = decoded.userId;

    await dependant.save();

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
