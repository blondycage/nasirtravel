import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import UserDependantProfile from '@/lib/models/UserDependantProfile';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// GET - Get all dependant profiles for the authenticated user
export async function GET(request: NextRequest) {
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

    const profiles = await UserDependantProfile.find({ userId: decoded.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, dependants: profiles });
  } catch (error: any) {
    console.error('Get user dependants error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dependants' },
      { status: 500 }
    );
  }
}

// POST - Create a new dependant profile
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, relationship, dateOfBirth, passportNumber } = body;

    if (!name || !relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    const profile = await UserDependantProfile.create({
      userId: decoded.userId,
      name,
      relationship,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      passportNumber,
    });

    return NextResponse.json({ success: true, dependant: profile }, { status: 201 });
  } catch (error: any) {
    console.error('Create user dependant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dependant' },
      { status: 500 }
    );
  }
}
