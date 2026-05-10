import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Referral from '@/lib/models/Referral';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (decoded?.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const filter: Record<string, unknown> = {};
    if (status && status !== 'all') filter.status = status;

    const referrals = await Referral.find(filter)
      .populate('referrer', 'name email')
      .populate('referred', 'name email')
      .populate('tour', 'title category')
      .populate('booking', 'totalAmount bookingDate')
      .sort({ createdAt: -1 });

    const totals = {
      totalRewards: referrals.reduce((sum, r) => sum + r.rewardAmount, 0),
      paidOut: referrals.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.rewardAmount, 0),
      pending: referrals.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.rewardAmount, 0),
    };

    return NextResponse.json({ success: true, data: referrals, totals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
