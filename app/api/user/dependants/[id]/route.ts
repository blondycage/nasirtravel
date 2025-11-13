import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserDependantProfile from '@/lib/models/UserDependantProfile';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// DELETE - Delete a dependant profile
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const profile = await UserDependantProfile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Dependant profile not found' }, { status: 404 });
    }

    if (profile.userId.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await UserDependantProfile.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user dependant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete dependant' },
      { status: 500 }
    );
  }
}

// PATCH - Update a dependant profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const profile = await UserDependantProfile.findById(params.id);
    if (!profile) {
      return NextResponse.json({ error: 'Dependant profile not found' }, { status: 404 });
    }

    if (profile.userId.toString() !== decoded.userId && decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    if (body.name) profile.name = body.name;
    if (body.relationship) profile.relationship = body.relationship;
    if (body.dateOfBirth !== undefined) profile.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;
    if (body.passportNumber !== undefined) profile.passportNumber = body.passportNumber;

    await profile.save();

    return NextResponse.json({ success: true, dependant: profile });
  } catch (error: any) {
    console.error('Update user dependant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update dependant' },
      { status: 500 }
    );
  }
}
