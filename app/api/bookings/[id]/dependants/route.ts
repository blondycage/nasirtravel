import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import { verifyToken } from '@/lib/utils/auth';

// GET - List all dependants for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify booking exists and belongs to user (or user is admin)
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (decoded.role !== 'admin' && booking.userId?.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dependants = await Dependant.find({ bookingId: params.id });

    return NextResponse.json({ dependants });
  } catch (error: any) {
    console.error('Get dependants error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch dependants' },
      { status: 500 }
    );
  }
}

// POST - Create a new dependant
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify booking exists and belongs to user
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.bookingStatus !== 'confirmed') {
      return NextResponse.json(
        { error: 'Can only add dependants to confirmed bookings' },
        { status: 400 }
      );
    }

    if (decoded.role !== 'admin' && booking.userId?.toString() !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, relationship, dateOfBirth, passportNumber } = await request.json();

    if (!name || !relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    const dependant = new Dependant({
      bookingId: params.id,
      userId: decoded.userId,
      name,
      relationship,
      dateOfBirth,
      passportNumber,
      documents: [],
    });

    await dependant.save();

    return NextResponse.json({ dependant }, { status: 201 });
  } catch (error: any) {
    console.error('Create dependant error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create dependant' },
      { status: 500 }
    );
  }
}
