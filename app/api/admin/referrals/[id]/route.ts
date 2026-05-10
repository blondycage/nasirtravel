import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Referral from '@/lib/models/Referral';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['paid', 'cancelled'],
  paid: [],
  cancelled: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (decoded?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { status, note } = await request.json();

    const referral = await Referral.findById(params.id);
    if (!referral) return NextResponse.json({ success: false, error: 'Referral not found' }, { status: 404 });

    if (!VALID_TRANSITIONS[referral.status]?.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Cannot transition from "${referral.status}" to "${status}"` },
        { status: 400 }
      );
    }

    const previousStatus = referral.status;

    // Append audit entry before changing status
    referral.statusHistory.push({
      from: previousStatus,
      to: status,
      changedBy: decoded.userId,
      changedAt: new Date(),
      ...(note ? { note } : {}),
    });

    referral.status = status;

    if (status === 'paid') {
      referral.paidAt = new Date();
      referral.paidBy = decoded.userId;
      await User.findByIdAndUpdate(referral.referrer, {
        $inc: { referralBalance: referral.rewardAmount },
      });
    }

    await referral.save();

    return NextResponse.json({ success: true, data: referral });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
