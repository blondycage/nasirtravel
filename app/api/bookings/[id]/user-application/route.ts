import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Tour from '@/lib/models/Tour';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';
import { sendAdminApplicationNotification } from '@/lib/utils/email';

// GET - Get user application form data
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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;
    
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

    // Return application form data
    const applicationData = booking.userApplicationFormData || {};
    applicationData.applicationFormSubmitted = booking.userApplicationFormSubmitted;
    applicationData.applicationStatus = booking.userApplicationStatus;

    return NextResponse.json({ success: true, data: applicationData });
  } catch (error: any) {
    console.error('Get user application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application data' },
      { status: 500 }
    );
  }
}

// POST - Submit user application form
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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;
    
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

    // Check if booking application is closed
    if (booking.applicationClosed) {
      return NextResponse.json(
        { error: 'Application process has been closed. Cannot submit application.' },
        { status: 400 }
      );
    }

    // Check if already reviewed/accepted (can't edit)
    if (booking.userApplicationStatus === 'accepted' || booking.userApplicationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Application has already been reviewed. Cannot modify.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate passport expiry (6+ months from now)
    if (body.passportExpiryDate) {
      const expiryDate = new Date(body.passportExpiryDate);
      const sixMonthsFromNow = new Date();
      sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
      
      if (expiryDate < sixMonthsFromNow) {
        return NextResponse.json(
          { error: 'Passport must be valid at least 6 months from the visa application submission date' },
          { status: 400 }
        );
      }
    }

    // Generate application number if not exists
    if (!booking.userApplicationFormData?.applicationNumber) {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(100000 + Math.random() * 900000).toString();
      body.applicationNumber = `${year}${month}${day}${random}`;
    }

    // Update booking with application form data
    booking.userApplicationFormData = {
      countryOfNationality: body.countryOfNationality,
      firstName: body.firstName,
      fatherName: body.fatherName,
      lastName: body.lastName,
      gender: body.gender,
      maritalStatus: body.maritalStatus,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
      countryOfBirth: body.countryOfBirth,
      cityOfBirth: body.cityOfBirth,
      profession: body.profession,
      applicationNumber: body.applicationNumber || booking.userApplicationFormData?.applicationNumber,
      passportType: body.passportType,
      passportNumber: body.passportNumber,
      passportIssuePlace: body.passportIssuePlace,
      passportIssueDate: body.passportIssueDate ? new Date(body.passportIssueDate) : undefined,
      passportExpiryDate: body.passportExpiryDate ? new Date(body.passportExpiryDate) : undefined,
      residenceCountry: body.residenceCountry,
      residenceCity: body.residenceCity,
      residenceZipCode: body.residenceZipCode,
      residenceAddress: body.residenceAddress,
    };

    // Mark as submitted if not already
    const isNewSubmission = !booking.userApplicationFormSubmitted;
    if (isNewSubmission) {
      booking.userApplicationFormSubmitted = true;
      booking.userApplicationFormSubmittedAt = new Date();
      booking.userApplicationStatus = 'submitted';
    }

    await booking.save();

    // Send admin notification email if this is a new submission
    if (isNewSubmission) {
      try {
        const tour = await Tour.findById(booking.tour);
        await sendAdminApplicationNotification(
          'user',
          booking._id.toString(),
          booking._id.toString(),
          booking.customerName,
          booking.customerEmail,
          tour?.title || 'Unknown Tour'
        );
      } catch (emailError) {
        console.error('Failed to send admin notification email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application form submitted successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Submit user application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH - Update user application form (only if not reviewed)
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

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwnerByUserId = booking.user && booking.user.toString() === decoded.userId;
    
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

    // Check if already reviewed/accepted (can't edit)
    if (booking.userApplicationStatus === 'accepted' || booking.userApplicationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Application has already been reviewed. Cannot modify.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update only provided fields
    if (!booking.userApplicationFormData) {
      booking.userApplicationFormData = {};
    }

    if (body.countryOfNationality !== undefined) booking.userApplicationFormData.countryOfNationality = body.countryOfNationality;
    if (body.firstName !== undefined) booking.userApplicationFormData.firstName = body.firstName;
    if (body.fatherName !== undefined) booking.userApplicationFormData.fatherName = body.fatherName;
    if (body.lastName !== undefined) booking.userApplicationFormData.lastName = body.lastName;
    if (body.gender !== undefined) booking.userApplicationFormData.gender = body.gender;
    if (body.maritalStatus !== undefined) booking.userApplicationFormData.maritalStatus = body.maritalStatus;
    if (body.dateOfBirth !== undefined) booking.userApplicationFormData.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;
    if (body.countryOfBirth !== undefined) booking.userApplicationFormData.countryOfBirth = body.countryOfBirth;
    if (body.cityOfBirth !== undefined) booking.userApplicationFormData.cityOfBirth = body.cityOfBirth;
    if (body.profession !== undefined) booking.userApplicationFormData.profession = body.profession;
    if (body.passportType !== undefined) booking.userApplicationFormData.passportType = body.passportType;
    if (body.passportNumber !== undefined) booking.userApplicationFormData.passportNumber = body.passportNumber;
    if (body.passportIssuePlace !== undefined) booking.userApplicationFormData.passportIssuePlace = body.passportIssuePlace;
    if (body.passportIssueDate !== undefined) booking.userApplicationFormData.passportIssueDate = body.passportIssueDate ? new Date(body.passportIssueDate) : undefined;
    if (body.passportExpiryDate !== undefined) booking.userApplicationFormData.passportExpiryDate = body.passportExpiryDate ? new Date(body.passportExpiryDate) : undefined;
    if (body.residenceCountry !== undefined) booking.userApplicationFormData.residenceCountry = body.residenceCountry;
    if (body.residenceCity !== undefined) booking.userApplicationFormData.residenceCity = body.residenceCity;
    if (body.residenceZipCode !== undefined) booking.userApplicationFormData.residenceZipCode = body.residenceZipCode;
    if (body.residenceAddress !== undefined) booking.userApplicationFormData.residenceAddress = body.residenceAddress;

    await booking.save();

    return NextResponse.json({
      success: true,
      message: 'Application form updated successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Update user application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}
