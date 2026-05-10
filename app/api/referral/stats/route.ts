import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Referral from '@/lib/models/Referral';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const user = await User.findById(decoded.userId).select('referralBalance');
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    const referrals = await Referral.find({ referrer: decoded.userId });

    const stats = {
      totalReferrals: referrals.length,
      pending: referrals.filter(r => r.status === 'pending').length,
      confirmed: referrals.filter(r => r.status === 'confirmed').length,
      paid: referrals.filter(r => r.status === 'paid').length,
      totalEarned: referrals
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + r.rewardAmount, 0),
      pendingEarnings: referrals
        .filter(r => r.status === 'pending' || r.status === 'confirmed')
        .reduce((sum, r) => sum + r.rewardAmount, 0),
      referralBalance: user.referralBalance ?? 0,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
