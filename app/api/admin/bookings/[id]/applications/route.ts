import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Dependant from '@/lib/models/Dependant';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

// GET - Get all application data (user + all dependants) for admin review
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const booking = await Booking.findById(params.id)
      .populate('user')
      .populate('tour');
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Get all dependants for this booking
    const dependants = await Dependant.find({ bookingId: params.id });

    // Format user application data
    const userApplication = {
      type: 'user',
      applicationFormData: booking.userApplicationFormData || {},
      applicationFormSubmitted: booking.userApplicationFormSubmitted,
      applicationStatus: booking.userApplicationStatus || 'pending',
      applicationFormSubmittedAt: booking.userApplicationFormSubmittedAt,
      applicationReviewedAt: booking.userApplicationReviewedAt,
      documents: {
        personalPassportPicture: booking.userPersonalPassportPicture,
        internationalPassport: booking.userInternationalPassport,
        supportingDocuments: booking.userSupportingDocuments || [],
      },
    };

    // Format dependant application data
    const dependantApplications = dependants.map(dep => ({
      id: dep._id,
      type: 'dependant',
      name: dep.name,
      relationship: dep.relationship,
      applicationFormData: {
        countryOfNationality: dep.countryOfNationality,
        firstName: dep.firstName,
        fatherName: dep.fatherName,
        lastName: dep.lastName,
        gender: dep.gender,
        maritalStatus: dep.maritalStatus,
        dateOfBirth: dep.dateOfBirth,
        countryOfBirth: dep.countryOfBirth,
        cityOfBirth: dep.cityOfBirth,
        profession: dep.profession,
        applicationNumber: dep.applicationNumber,
        passportType: dep.passportType,
        passportNumber: dep.passportNumber,
        passportIssuePlace: dep.passportIssuePlace,
        passportIssueDate: dep.passportIssueDate,
        passportExpiryDate: dep.passportExpiryDate,
        expectedArrivalDate: dep.expectedArrivalDate,
        expectedDepartureDate: dep.expectedDepartureDate,
        residenceCountry: dep.residenceCountry,
        residenceCity: dep.residenceCity,
        residenceZipCode: dep.residenceZipCode,
        residenceAddress: dep.residenceAddress,
      },
      applicationFormSubmitted: dep.applicationFormSubmitted,
      applicationStatus: dep.applicationStatus,
      applicationFormSubmittedAt: dep.applicationFormSubmittedAt,
      applicationReviewedAt: dep.applicationReviewedAt,
      documents: {
        personalPassportPicture: dep.personalPassportPicture,
        internationalPassport: dep.internationalPassport,
        supportingDocuments: dep.supportingDocuments || [],
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        booking: {
          id: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          applicationClosed: booking.applicationClosed,
          applicationClosedAt: booking.applicationClosedAt,
        },
        userApplication,
        dependantApplications,
      },
    });
  } catch (error: any) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

// PATCH - Close application process
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
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const booking = await Booking.findById(params.id);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'close') {
      booking.applicationClosed = true;
      booking.applicationClosedAt = new Date();
      booking.applicationClosedBy = decoded.userId;
    } else if (action === 'reopen') {
      booking.applicationClosed = false;
      booking.applicationClosedAt = undefined;
      booking.applicationClosedBy = undefined;
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "close" or "reopen"' },
        { status: 400 }
      );
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Application process ${action === 'close' ? 'closed' : 'reopened'} successfully`,
      data: booking,
    });
  } catch (error: any) {
    console.error('Close application error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update application status' },
      { status: 500 }
    );
  }
}
