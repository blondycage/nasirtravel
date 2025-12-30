import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';

export async function GET(request: NextRequest) {
  try {
    console.log('[Tours API] GET request received');
    console.log('[Tours API] Connecting to MongoDB...');

    await connectDB();

    console.log('[Tours API] MongoDB connected successfully');

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';

    const filter: any = { status };
    if (category && category !== 'All') {
      filter.category = category;
    }

    console.log('[Tours API] Querying tours with filter:', JSON.stringify(filter));

    const tours = await Tour.find(filter).sort({ createdAt: -1 });

    console.log('[Tours API] Found', tours.length, 'tours');

    return NextResponse.json({ success: true, data: tours });
  } catch (error: any) {
    console.error('[Tours API] Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
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
