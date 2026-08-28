import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const token = getTokenFromHeader(request.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const status = request.nextUrl.searchParams.get('status');
    const filter = status && status !== 'all' ? { status } : {};

    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    console.error('[Admin Support Tickets Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}
