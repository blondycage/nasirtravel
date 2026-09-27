import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TravelEnquiry from '@/lib/models/TravelEnquiry';
import { getTokenFromHeader, verifyToken } from '@/lib/utils/auth';

const statuses = new Set(['new', 'contacted', 'quoted', 'closed']);
const authorize = (request: NextRequest) => {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  const decoded = token ? verifyToken(token) as any : null;
  if (!decoded) return 401;
  return decoded.role === 'admin' ? 200 : 403;
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authStatus = authorize(request);
    if (authStatus !== 200) return NextResponse.json({ success: false, error: authStatus === 401 ? 'Unauthorized' : 'Forbidden' }, { status: authStatus });
    if (!mongoose.Types.ObjectId.isValid(params.id)) return NextResponse.json({ success: false, error: 'Invalid enquiry ID' }, { status: 400 });
    await connectDB();
    const enquiry = await TravelEnquiry.findById(params.id).populate('package', 'title').lean();
    if (!enquiry) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authStatus = authorize(request);
    if (authStatus !== 200) return NextResponse.json({ success: false, error: authStatus === 401 ? 'Unauthorized' : 'Forbidden' }, { status: authStatus });
    if (!mongoose.Types.ObjectId.isValid(params.id)) return NextResponse.json({ success: false, error: 'Invalid enquiry ID' }, { status: 400 });
    const body = await request.json();
    if (!statuses.has(body.status)) return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    await connectDB();
    const enquiry = await TravelEnquiry.findByIdAndUpdate(params.id, {
      status: body.status,
      adminNotes: String(body.adminNotes ?? '').trim().slice(0, 5000),
    }, { new: true, runValidators: true });
    if (!enquiry) return NextResponse.json({ success: false, error: 'Enquiry not found' }, { status: 404 });
    return NextResponse.json({ success: true, enquiry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
