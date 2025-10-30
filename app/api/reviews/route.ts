import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const tourId = searchParams.get('tourId');
    const status = searchParams.get('status') || 'approved';

    const filter: any = { status };
    if (tourId) {
      filter.tour = tourId;
    }

    const reviews = await Review.find(filter)
      .populate('user')
      .populate('tour')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const review = await Review.create({
      ...body,
      user: decoded.userId,
      status: 'pending',
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
