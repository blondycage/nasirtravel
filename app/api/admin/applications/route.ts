import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Dependant from '@/lib/models/Dependant';
import Tour from '@/lib/models/Tour';
import { verifyToken } from '@/lib/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Ensure models are registered
    Tour;

    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 });
    }

    // Fetch all bookings with submitted applications
    const bookings = await Booking.find({
      paymentStatus: 'paid',
      userApplicationFormSubmitted: true
    }).populate('tour user').sort({ userApplicationFormSubmittedAt: -1 });

    // Fetch all dependants with submitted applications
    const dependants = await Dependant.find({
      applicationFormSubmitted: true
    }).populate('bookingId userId').sort({ applicationFormSubmittedAt: -1 });

    // Format user applications
    const userApplications = bookings.map((booking: any) => ({
      _id: booking._id,
      type: 'user',
      bookingId: booking._id,
      applicantName: booking.customerName,
      customerEmail: booking.customerEmail,
      packageType: booking.packageType || 'standard',
      tourTitle: booking.tour?.title || 'Unknown Tour',
      status: booking.userApplicationStatus || 'pending',
      submittedAt: booking.userApplicationFormSubmittedAt,
      formData: booking.userApplicationFormData,
    }));

    // Get unique booking IDs from dependants
    const dependantBookingIds = [...new Set(dependants.map((d: any) => d.bookingId?._id).filter(Boolean))];

    // Fetch bookings with tours for dependants
    const dependantBookings = await Booking.find({
      _id: { $in: dependantBookingIds }
    }).populate('tour');

    // Create a map for quick lookup
    const bookingMap = new Map(dependantBookings.map((b: any) => [b._id.toString(), b]));

    // Format dependant applications
    const dependantApplications = dependants.map((dependant: any) => {
      const booking = bookingMap.get(dependant.bookingId?._id?.toString());
      return {
        _id: dependant._id,
        type: 'dependant',
        bookingId: booking?._id,
        dependantId: dependant._id,
        applicantName: dependant.name,
        customerEmail: booking?.customerEmail || 'N/A',
        packageType: booking?.packageType || 'standard',
        tourTitle: booking?.tour?.title || 'Unknown Tour',
        status: dependant.applicationStatus || 'pending',
        submittedAt: dependant.applicationFormSubmittedAt,
        formData: {
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
          passportNumber: dependant.passportNumber,
          passportIssuePlace: dependant.passportIssuePlace,
          passportIssueDate: dependant.passportIssueDate,
          passportExpiryDate: dependant.passportExpiryDate,
          residenceCountry: dependant.residenceCountry,
          residenceCity: dependant.residenceCity,
          residenceZipCode: dependant.residenceZipCode,
          residenceAddress: dependant.residenceAddress,
        },
      };
    });

    // Combine and sort all applications
    const allApplications = [...userApplications, ...dependantApplications].sort((a, b) => {
      const dateA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const dateB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      success: true,
      applications: allApplications,
      total: allApplications.length,
      userApplications: userApplications.length,
      dependantApplications: dependantApplications.length,
    });
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    );
  }
}
