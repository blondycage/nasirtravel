import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HajjInterest from '@/lib/models/HajjInterest';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const interests = await HajjInterest.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      interests,
      data: interests,
    });
  } catch (error: any) {
    console.error('GET /api/admin/hajj-interest error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch interest forms' },
      { status: 500 }
    );
  }
}
