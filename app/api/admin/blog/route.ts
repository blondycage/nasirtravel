import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';
import { requireAdmin } from '@/lib/utils/adminAuth';
import { prepareBlogPost, validateBlogPost } from '@/lib/utils/blogAdmin';

export async function GET(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied;
  try { await connectDB(); return NextResponse.json({ success: true, data: await BlogPost.find().sort({ updatedAt: -1 }).lean() }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await connectDB();
    const input = prepareBlogPost(await request.json());
    const validationError = validateBlogPost(input); if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    const post = await BlogPost.create(input);
    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.code === 11000 ? 'That slug is already in use.' : error.message }, { status: 400 }); }
}
