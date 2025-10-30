import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';

    const filter: any = { status };
    if (category && category !== 'All') {
      filter.category = category;
    }

    const tours = await Tour.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: tours });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const tour = await Tour.create(body);
    return NextResponse.json({ success: true, data: tour }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
