import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    const post = await BlogPost.findOne({ slug: params.slug, status: 'published' }).lean();
    if (!post) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
