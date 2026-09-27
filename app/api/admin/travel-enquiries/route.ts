import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TravelEnquiry from '@/lib/models/TravelEnquiry';
import { getTokenFromHeader, verifyToken } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('authorization'));
    const decoded = token ? verifyToken(token) as any : null;
    if (!decoded) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    if (decoded.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    await connectDB();
    const enquiries = await TravelEnquiry.find().populate('package', 'title').sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, enquiries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
