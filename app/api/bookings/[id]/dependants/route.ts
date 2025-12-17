import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// GET - List all dependants for a booking
export async function GET(
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

    // Verify booking exists and belongs to user (or user is admin)
    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access - same logic as booking details API
    const isAdmin = decoded.role === 'admin';
    
    let isOwnerByUserId = false;
    if (booking.user) {
      if (typeof booking.user === 'object' && booking.user._id) {
        isOwnerByUserId = booking.user._id.toString() === decoded.userId;
      } else if (typeof booking.user === 'string') {
        isOwnerByUserId = booking.user.toString() === decoded.userId;
      } else if (booking.user.toString) {
        isOwnerByUserId = booking.user.toString() === decoded.userId;
      }
    }

    let userEmail = decoded.email;
    if (!userEmail && !isOwnerByUserId) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }
    
    const isOwnerByEmail = booking.customerEmail === userEmail;

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dependants = await Dependant.find({ bookingId: params.id }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, dependants });
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

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

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

    // Check if payment is completed
    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json(
        { error: 'Payment must be completed before adding dependants' },
        { status: 400 }
      );
    }

    // Check if application is closed (only admin can bypass this)
    if (booking.applicationClosed && decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Application process has been closed. Cannot add new dependants.' },
        { status: 400 }
      );
    }

    // Check access - same logic as booking details API
    const isAdmin = decoded.role === 'admin';
    
    let isOwnerByUserId = false;
    if (booking.user) {
      if (typeof booking.user === 'object' && booking.user._id) {
        isOwnerByUserId = booking.user._id.toString() === decoded.userId;
      } else if (typeof booking.user === 'string') {
        isOwnerByUserId = booking.user.toString() === decoded.userId;
      } else if (booking.user.toString) {
        isOwnerByUserId = booking.user.toString() === decoded.userId;
      }
    }

    let userEmail = decoded.email;
    if (!userEmail && !isOwnerByUserId) {
      const User = (await import('@/lib/models/User')).default;
      const user = await User.findById(decoded.userId);
      userEmail = user?.email;
    }
    
    const isOwnerByEmail = booking.customerEmail === userEmail;

    if (!isOwnerByUserId && !isOwnerByEmail && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, relationship, dateOfBirth, passportNumber, profileId } = body;

    // If profileId is provided, fetch the profile and use its data
    let dependantData: any = {
      bookingId: params.id,
      userId: decoded.userId,
      name,
      relationship,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      passportNumber,
      documents: [],
    };

    if (profileId) {
      const UserDependantProfile = (await import('@/lib/models/UserDependantProfile')).default;
      const profile = await UserDependantProfile.findOne({
        _id: profileId,
        userId: decoded.userId,
      });

      if (profile) {
        // Use profile data, but allow override from body
        dependantData = {
          ...dependantData,
          name: name || profile.name,
          relationship: relationship || profile.relationship,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : profile.dateOfBirth,
          passportNumber: passportNumber || profile.passportNumber,
          countryOfNationality: profile.countryOfNationality,
          firstName: profile.firstName,
          fatherName: profile.fatherName,
          lastName: profile.lastName,
          gender: profile.gender,
          maritalStatus: profile.maritalStatus,
          countryOfBirth: profile.countryOfBirth,
          cityOfBirth: profile.cityOfBirth,
          profession: profile.profession,
        };
      }
    }

    if (!dependantData.name || !dependantData.relationship) {
      return NextResponse.json(
        { error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    // Validate that adding this dependant won't exceed numberOfTravelers
    // Count: 1 (main user) + existing dependants + 1 (new dependant) <= numberOfTravelers
    const existingDependants = await Dependant.countDocuments({ bookingId: params.id });
    const totalTravelers = 1 + existingDependants + 1; // 1 main user + existing dependants + new dependant
    
    if (totalTravelers > booking.numberOfTravelers) {
      const remainingSlots = booking.numberOfTravelers - (1 + existingDependants);
      return NextResponse.json(
        { 
          error: `Cannot add more dependants. The booking is for ${booking.numberOfTravelers} traveler(s) (including the main user). You have ${remainingSlots} slot(s) remaining.` 
        },
        { status: 400 }
      );
    }

    const dependant = new Dependant(dependantData);
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
