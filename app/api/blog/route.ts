import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get('page') || 1));
    const limit = Math.min(24, Math.max(1, Number(params.get('limit') || 9)));
    const search = params.get('search')?.trim();
    const category = params.get('category')?.trim();
    const tag = params.get('tag')?.trim().toLowerCase();
    const filter: Record<string, unknown> = { status: 'published' };
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];

    const [posts, total] = await Promise.all([
      BlogPost.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      BlogPost.countDocuments(filter),
    ]);
    return NextResponse.json({ success: true, data: posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
