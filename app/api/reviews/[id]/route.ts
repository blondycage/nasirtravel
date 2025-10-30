import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Review from '@/lib/models/Review';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const review = await Review.findById(params.id);

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    // Only admin or review owner can update
    if (decoded.role !== 'admin' && review.user.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updatedReview = await Review.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: false,
    });

    return NextResponse.json({ success: true, data: updatedReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const review = await Review.findById(params.id);

    if (!review) {
      return NextResponse.json({ success: false, error: 'Review not found' }, { status: 404 });
    }

    // Only admin or review owner can delete
    if (decoded.role !== 'admin' && review.user.toString() !== decoded.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await Review.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
