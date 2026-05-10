import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { generateUniqueReferralCode } from '@/lib/utils/referral';

// Existing users won't have a referral code — generate lazily on first visit
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorised' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded?.userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

    const user = await User.findById(decoded.userId).select('name referralCode referralBalance');
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (!user.referralCode) {
      user.referralCode = await generateUniqueReferralCode(user.name);
      await user.save();
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `${appUrl}/packages?ref=${user.referralCode}`,
        referralBalance: user.referralBalance ?? 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
