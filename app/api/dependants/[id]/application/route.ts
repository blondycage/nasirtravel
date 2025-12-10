import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Dependant from '@/lib/models/Dependant';
import Booking from '@/lib/models/Booking';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// GET - Get application form data for a dependant
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

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwner = dependant.userId.toString() === decoded.userId;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Return application form data
    const applicationData = {
      countryOfNationality: dependant.countryOfNationality,
      firstName: dependant.firstName,
      fatherName: dependant.fatherName,
      lastName: dependant.lastName,
      gender: dependant.gender,
      maritalStatus: dependant.maritalStatus,
      dateOfBirth: dependant.dateOfBirth,
      countryOfBirth: dependant.countryOfBirth,
      cityOfBirth: dependant.cityOfBirth,
      profession: dependant.profession,
      applicationNumber: dependant.applicationNumber,
      passportType: dependant.passportType,
      passportNumber: dependant.passportNumber,
      passportIssuePlace: dependant.passportIssuePlace,
      passportIssueDate: dependant.passportIssueDate,
      passportExpiryDate: dependant.passportExpiryDate,
      residenceCountry: dependant.residenceCountry,
      residenceCity: dependant.residenceCity,
      residenceZipCode: dependant.residenceZipCode,
      residenceAddress: dependant.residenceAddress,
      applicationFormSubmitted: dependant.applicationFormSubmitted,
      applicationStatus: dependant.applicationStatus,
    };

    return NextResponse.json({ success: true, data: applicationData });
  } catch (error: any) {
    console.error('Get dependant application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch application data' },
      { status: 500 }
    );
  }
}

// POST - Submit application form for a dependant
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

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwner = dependant.userId.toString() === decoded.userId;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if booking application is closed
    const booking = await Booking.findById(dependant.bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.applicationClosed) {
      return NextResponse.json(
        { error: 'Application process has been closed. Cannot submit application.' },
        { status: 400 }
      );
    }

    // Check if already reviewed/accepted (can't edit)
    if (dependant.applicationStatus === 'accepted' || dependant.applicationStatus === 'rejected') {
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

    // Update dependant with application form data
    dependant.countryOfNationality = body.countryOfNationality;
    dependant.firstName = body.firstName;
    dependant.fatherName = body.fatherName;
    dependant.lastName = body.lastName;
    dependant.gender = body.gender;
    dependant.maritalStatus = body.maritalStatus;
    dependant.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : dependant.dateOfBirth;
    dependant.countryOfBirth = body.countryOfBirth;
    dependant.cityOfBirth = body.cityOfBirth;
    dependant.profession = body.profession;
    dependant.passportType = body.passportType;
    dependant.passportNumber = body.passportNumber;
    dependant.passportIssuePlace = body.passportIssuePlace;
    dependant.passportIssueDate = body.passportIssueDate ? new Date(body.passportIssueDate) : undefined;
    dependant.passportExpiryDate = body.passportExpiryDate ? new Date(body.passportExpiryDate) : undefined;
    dependant.residenceCountry = body.residenceCountry;
    dependant.residenceCity = body.residenceCity;
    dependant.residenceZipCode = body.residenceZipCode;
    dependant.residenceAddress = body.residenceAddress;

    // Mark as submitted if not already
    if (!dependant.applicationFormSubmitted) {
      dependant.applicationFormSubmitted = true;
      dependant.applicationFormSubmittedAt = new Date();
      dependant.applicationStatus = 'submitted';
    }

    await dependant.save();

    return NextResponse.json({
      success: true,
      message: 'Application form submitted successfully',
      data: dependant,
    });
  } catch (error: any) {
    console.error('Submit dependant application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

// PATCH - Update application form (only if not reviewed)
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

    const dependant = await Dependant.findById(params.id);
    if (!dependant) {
      return NextResponse.json({ error: 'Dependant not found' }, { status: 404 });
    }

    // Check access
    const isAdmin = decoded.role === 'admin';
    const isOwner = dependant.userId.toString() === decoded.userId;

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if already reviewed/accepted (can't edit)
    if (dependant.applicationStatus === 'accepted' || dependant.applicationStatus === 'rejected') {
      return NextResponse.json(
        { error: 'Application has already been reviewed. Cannot modify.' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Update only provided fields
    if (body.countryOfNationality !== undefined) dependant.countryOfNationality = body.countryOfNationality;
    if (body.firstName !== undefined) dependant.firstName = body.firstName;
    if (body.fatherName !== undefined) dependant.fatherName = body.fatherName;
    if (body.lastName !== undefined) dependant.lastName = body.lastName;
    if (body.gender !== undefined) dependant.gender = body.gender;
    if (body.maritalStatus !== undefined) dependant.maritalStatus = body.maritalStatus;
    if (body.dateOfBirth !== undefined) dependant.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined;
    if (body.countryOfBirth !== undefined) dependant.countryOfBirth = body.countryOfBirth;
    if (body.cityOfBirth !== undefined) dependant.cityOfBirth = body.cityOfBirth;
    if (body.profession !== undefined) dependant.profession = body.profession;
    if (body.passportType !== undefined) dependant.passportType = body.passportType;
    if (body.passportNumber !== undefined) dependant.passportNumber = body.passportNumber;
    if (body.passportIssuePlace !== undefined) dependant.passportIssuePlace = body.passportIssuePlace;
    if (body.passportIssueDate !== undefined) dependant.passportIssueDate = body.passportIssueDate ? new Date(body.passportIssueDate) : undefined;
    if (body.passportExpiryDate !== undefined) dependant.passportExpiryDate = body.passportExpiryDate ? new Date(body.passportExpiryDate) : undefined;
    if (body.residenceCountry !== undefined) dependant.residenceCountry = body.residenceCountry;
    if (body.residenceCity !== undefined) dependant.residenceCity = body.residenceCity;
    if (body.residenceZipCode !== undefined) dependant.residenceZipCode = body.residenceZipCode;
    if (body.residenceAddress !== undefined) dependant.residenceAddress = body.residenceAddress;

    await dependant.save();

    return NextResponse.json({
      success: true,
      message: 'Application form updated successfully',
      data: dependant,
    });
  } catch (error: any) {
    console.error('Update dependant application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}
