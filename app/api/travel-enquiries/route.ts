import { randomBytes } from 'crypto';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import TravelEnquiry, { type TravelService } from '@/lib/models/TravelEnquiry';
import { sendTravelEnquiryAdminNotification } from '@/lib/utils/email';

const servicesAllowed = new Set(['flights', 'hotels', 'existing_package', 'custom_package']);
const purposesAllowed = new Set(['umrah', 'hajj', 'vacation', 'business', 'family_visit', 'other']);
const readinessAllowed = new Set(['planning', 'ready_for_quote', 'ready_to_book']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max = 2000) => String(value ?? '').trim().slice(0, max);
const validDate = (value: unknown) => value ? new Date(String(value)) : undefined;

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (clean(body.website)) {
      return NextResponse.json({ success: false, error: 'Unable to submit request.' }, { status: 400 });
    }
    if (body.captchaVerified !== true) {
      return NextResponse.json({ success: false, error: 'Please complete the verification code.' }, { status: 400 });
    }

    const name = clean(body.name, 120);
    const email = clean(body.email, 180).toLowerCase();
    const phone = clean(body.phone, 60);
    const origin = clean(body.origin, 160);
    const destination = clean(body.destination, 160);
    const services = Array.from(new Set(Array.isArray(body.services) ? body.services : [])) as TravelService[];
    if (!name || !emailPattern.test(email) || !phone || !origin || !destination) {
      return NextResponse.json({ success: false, error: 'Name, valid email, phone, origin, and destination are required.' }, { status: 400 });
    }
    if (!services.length || services.some((service) => !servicesAllowed.has(service))) {
      return NextResponse.json({ success: false, error: 'Select at least one valid travel service.' }, { status: 400 });
    }
    if (!purposesAllowed.has(body.purpose) || !readinessAllowed.has(body.readiness)) {
      return NextResponse.json({ success: false, error: 'Select a valid travel purpose and readiness.' }, { status: 400 });
    }

    const adults = Number(body.travelers?.adults);
    const children = Number(body.travelers?.children ?? 0);
    const infants = Number(body.travelers?.infants ?? 0);
    if (![adults, children, infants].every(Number.isInteger) || adults < 1 || children < 0 || infants < 0) {
      return NextResponse.json({ success: false, error: 'Traveler counts must be valid whole numbers.' }, { status: 400 });
    }

    const departureDate = validDate(body.departureDate);
    const returnDate = validDate(body.returnDate);
    if ((departureDate && Number.isNaN(departureDate.getTime())) || (returnDate && Number.isNaN(returnDate.getTime()))) {
      return NextResponse.json({ success: false, error: 'Enter valid travel dates.' }, { status: 400 });
    }
    if (departureDate && returnDate && returnDate < departureDate) {
      return NextResponse.json({ success: false, error: 'Return date cannot be before departure date.' }, { status: 400 });
    }

    let selectedTour: { _id: mongoose.Types.ObjectId; title: string } | null = null;
    if (services.includes('existing_package')) {
      if (!mongoose.Types.ObjectId.isValid(body.packageId)) {
        return NextResponse.json({ success: false, error: 'Select a valid package.' }, { status: 400 });
      }
      selectedTour = await Tour.findOne({ _id: body.packageId, status: 'published' }).select('_id title').lean() as any;
      if (!selectedTour) return NextResponse.json({ success: false, error: 'The selected package is unavailable.' }, { status: 400 });
    }
    const customRequirements = clean(body.customRequirements, 5000);
    if (services.includes('custom_package') && !customRequirements) {
      return NextResponse.json({ success: false, error: 'Describe your custom package requirements.' }, { status: 400 });
    }

    const hotelCheckIn = validDate(body.hotelPreferences?.checkIn);
    const hotelCheckOut = validDate(body.hotelPreferences?.checkOut);
    if ((hotelCheckIn && Number.isNaN(hotelCheckIn.getTime())) || (hotelCheckOut && Number.isNaN(hotelCheckOut.getTime()))) {
      return NextResponse.json({ success: false, error: 'Enter valid hotel dates.' }, { status: 400 });
    }
    if (hotelCheckIn && hotelCheckOut && hotelCheckOut < hotelCheckIn) {
      return NextResponse.json({ success: false, error: 'Hotel checkout cannot be before check-in.' }, { status: 400 });
    }
    const rooms = body.hotelPreferences?.rooms ? Number(body.hotelPreferences.rooms) : undefined;
    if (rooms !== undefined && (!Number.isInteger(rooms) || rooms < 1)) {
      return NextResponse.json({ success: false, error: 'Hotel rooms must be a whole number greater than zero.' }, { status: 400 });
    }

    const reference = `NTR-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    const enquiry = await TravelEnquiry.create({
      reference, name, email, phone, services, purpose: body.purpose, readiness: body.readiness,
      travelers: { adults, children, infants }, origin, destination, departureDate, returnDate,
      flexibleDates: Boolean(body.flexibleDates), budget: clean(body.budget, 120),
      flightPreferences: services.includes('flights') ? {
        cabin: clean(body.flightPreferences?.cabin, 40),
        preferredAirline: clean(body.flightPreferences?.preferredAirline, 100),
        stopPreference: clean(body.flightPreferences?.stopPreference, 40),
        notes: clean(body.flightPreferences?.notes, 2000),
      } : undefined,
      hotelPreferences: services.includes('hotels') ? {
        destination: clean(body.hotelPreferences?.destination, 160), checkIn: hotelCheckIn, checkOut: hotelCheckOut,
        rooms, starRating: clean(body.hotelPreferences?.starRating, 20), notes: clean(body.hotelPreferences?.notes, 2000),
      } : undefined,
      package: selectedTour?._id, packageTitleSnapshot: selectedTour?.title,
      customRequirements: services.includes('custom_package') ? customRequirements : undefined,
      generalNotes: clean(body.generalNotes, 5000),
    });

    const emailResult = await sendTravelEnquiryAdminNotification({
      enquiryId: enquiry._id.toString(), reference, name, email, phone, services, purpose: body.purpose,
      readiness: body.readiness, origin, destination, departureDate: departureDate?.toISOString(),
      returnDate: returnDate?.toISOString(), packageTitle: selectedTour?.title,
    });
    await TravelEnquiry.findByIdAndUpdate(enquiry._id, emailResult.success
      ? { notificationStatus: 'sent', $unset: { notificationError: 1 } }
      : { notificationStatus: 'failed', notificationError: String(emailResult.error || 'Email delivery failed').slice(0, 500) });

    return NextResponse.json({ success: true, reference, message: 'Your travel request has been received.' }, { status: 201 });
  } catch (error: any) {
    console.error('Travel enquiry submission error:', error);
    return NextResponse.json({ success: false, error: 'Unable to submit your request. Please try again.' }, { status: 500 });
  }
}
