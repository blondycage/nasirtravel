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
    if (!decoded?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const referrals = await Referral.find({ referrer: decoded.userId })
      .populate('referred', 'name email')
      .populate('tour', 'title category')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: referrals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
