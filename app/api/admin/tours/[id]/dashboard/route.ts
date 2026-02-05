import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
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

    const tourId = params.id;

    // Get tour details
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    // Get all bookings for this tour
    const bookings = await Booking.find({ tour: tourId })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    // Get all dependants for these bookings
    const bookingIds = bookings.map(b => b._id);
    const dependants = await Dependant.find({ bookingId: { $in: bookingIds } });

    // Build detailed bookings with applications
    const bookingsWithApplications = await Promise.all(
      bookings.map(async (booking) => {
        // Get dependants for this booking
        const bookingDependants = dependants.filter(
          d => d.bookingId.toString() === booking._id.toString()
        );

        // Build applications array
        const applications = [];

        // Add user application
        applications.push({
          type: 'user',
          applicantName: booking.customerName,
          applicationNumber: booking.userApplicationFormData?.applicationNumber || 'Not assigned',
          status: booking.userApplicationStatus || 'pending',
          submittedAt: booking.userApplicationFormSubmittedAt,
          rejectionReason: booking.userApplicationRejectionReason,
        });

        // Add dependant applications
        for (const dependant of bookingDependants) {
          applications.push({
            type: 'dependant',
            dependantId: dependant._id,
            applicantName: dependant.name,
            relationship: dependant.relationship,
            applicationNumber: dependant.applicationNumber || 'Not assigned',
            status: dependant.applicationStatus,
            submittedAt: dependant.applicationFormSubmittedAt,
            rejectionReason: dependant.applicationRejectionReason,
          });
        }

        // Calculate application statistics
        const applicationStats = {
          total: applications.length,
          pending: applications.filter(a => a.status === 'pending').length,
          submitted: applications.filter(a => a.status === 'submitted').length,
          under_review: applications.filter(a => a.status === 'under_review').length,
          accepted: applications.filter(a => a.status === 'accepted').length,
          rejected: applications.filter(a => a.status === 'rejected').length,
          needs_revision: applications.filter(a => a.status === 'needs_revision').length,
        };

        return {
          _id: booking._id,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          customerPhone: booking.customerPhone,
          user: booking.user,
          numberOfTravelers: booking.numberOfTravelers,
          totalAmount: booking.totalAmount,
          paymentStatus: booking.paymentStatus,
          bookingStatus: booking.bookingStatus,
          bookingDate: booking.bookingDate,
          applicationClosed: booking.applicationClosed,
          createdAt: booking.createdAt,
          applications,
          applicationStats,
          dependants: bookingDependants.map(d => ({
            _id: d._id,
            name: d.name,
            relationship: d.relationship,
          })),
        };
      })
    );

    // Calculate overall statistics
    const totalBookings = bookings.length;
    const paidBookings = bookings.filter(b => b.paymentStatus === 'paid').length;
    const pendingPayments = bookings.filter(b => b.paymentStatus === 'pending').length;

    // Calculate application statistics across all bookings
    const allApplications = bookingsWithApplications.flatMap(b => b.applications);
    const applicationStats = {
      total: allApplications.length,
      pending: allApplications.filter(a => a.status === 'pending').length,
      submitted: allApplications.filter(a => a.status === 'submitted').length,
      under_review: allApplications.filter(a => a.status === 'under_review').length,
      accepted: allApplications.filter(a => a.status === 'accepted').length,
      rejected: allApplications.filter(a => a.status === 'rejected').length,
      needs_revision: allApplications.filter(a => a.status === 'needs_revision').length,
    };

    const stats = {
      totalBookings,
      paidBookings,
      pendingPayments,
      totalRevenue: bookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      ...applicationStats,
    };

    return NextResponse.json({
      success: true,
      data: {
        tour: {
          _id: tour._id,
          title: tour.title,
          category: tour.category,
          packageType: tour.packageType,
          price: tour.price,
          dates: tour.dates,
          status: tour.status,
        },
        stats,
        bookings: bookingsWithApplications,
      },
    });
  } catch (error: any) {
    console.error('Package dashboard error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
