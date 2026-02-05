import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Booking from '@/lib/models/Booking';
import Dependant from '@/lib/models/Dependant';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    // Get user
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Get user's bookings with tour information
    const bookings = await Booking.find({ user: userId })
      .populate('tour', 'title category packageType')
      .sort({ createdAt: -1 });

    // Get all dependants across all bookings
    const dependants = await Dependant.find({ userId });

    // Build applications summary
    const applications = [];

    // Add user applications from bookings
    for (const booking of bookings) {
      if (booking.userApplicationFormSubmitted) {
        applications.push({
          type: 'user',
          bookingId: booking._id,
          tourTitle: (booking.tour as any)?.title || 'Unknown',
          status: booking.userApplicationStatus,
          submittedAt: booking.userApplicationFormSubmittedAt,
          rejectionReason: booking.userApplicationRejectionReason,
        });
      }
    }

    // Add dependant applications
    for (const dependant of dependants) {
      if (dependant.applicationFormSubmitted) {
        const booking = bookings.find(b => b._id.toString() === dependant.bookingId.toString());
        applications.push({
          type: 'dependant',
          dependantId: dependant._id,
          dependantName: dependant.name,
          bookingId: dependant.bookingId,
          tourTitle: booking ? (booking.tour as any)?.title : 'Unknown',
          status: dependant.applicationStatus,
          submittedAt: dependant.applicationFormSubmittedAt,
          rejectionReason: dependant.applicationRejectionReason,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user,
        bookings,
        applications,
        stats: {
          totalBookings: bookings.length,
          totalApplications: applications.length,
          totalDependants: dependants.length,
        },
      },
    });
  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;
    const body = await request.json();
    const { name, email, phone, role } = body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Email already in use by another user' },
          { status: 400 }
        );
      }
    }

    // Update user (excluding password as per requirements)
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;

    await user.save();

    // Return updated user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: userResponse,
    });
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token) as any;
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user has bookings
    const bookingsCount = await Booking.countDocuments({ user: userId });
    if (bookingsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete user with existing bookings. User has ${bookingsCount} booking(s).`,
        },
        { status: 400 }
      );
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
