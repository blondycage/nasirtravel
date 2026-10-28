import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/lib/models/BlogPost';
import { requireAdmin } from '@/lib/utils/adminAuth';
import { prepareBlogPost, validateBlogPost } from '@/lib/utils/blogAdmin';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request); if (denied) return denied;
  try { await connectDB(); const post = await BlogPost.findById(params.id).lean(); if (!post) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 }); return NextResponse.json({ success: true, data: post }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request); if (denied) return denied;
  try {
    await connectDB(); const input = prepareBlogPost(await request.json()); const validationError = validateBlogPost(input); if (validationError) return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    const post = await BlogPost.findByIdAndUpdate(params.id, input, { new: true, runValidators: true }); if (!post) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: post });
  } catch (error: any) { return NextResponse.json({ success: false, error: error.code === 11000 ? 'That slug is already in use.' : error.message }, { status: 400 }); }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = requireAdmin(request); if (denied) return denied;
  try { await connectDB(); const post = await BlogPost.findByIdAndDelete(params.id); if (!post) return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 }); return NextResponse.json({ success: true }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: 500 }); }
}
