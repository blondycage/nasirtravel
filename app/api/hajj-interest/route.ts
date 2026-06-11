import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HajjInterest from '@/lib/models/HajjInterest';

const allowedPartySizes = new Set(['1', '2', '3', '4+']);
const allowedPackageTypes = new Set(['luxury', 'premium', 'standard']);
const allowedAccommodationTypes = new Set(['non-shifting', 'shifting']);
const allowedRoomPreferences = new Set(['quad', 'triple', 'double']);
const allowedPlanningValues = new Set(['yes', 'no']);

const cleanString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const email = cleanString(body.email).toLowerCase();
    const firstName = cleanString(body.firstName);
    const lastName = cleanString(body.lastName);
    const phoneNumber = cleanString(body.phoneNumber);
    const partySize = cleanString(body.partySize);
    const packageType = cleanString(body.packageType);
    const accommodationType = cleanString(body.accommodationType);
    const roomPreference = cleanString(body.roomPreference);
    const departurePort = cleanString(body.departurePort);
    const planningToGo = cleanString(body.planningToGo);

    if (!email || !firstName || !lastName || !phoneNumber || !partySize || !packageType || !accommodationType || !roomPreference || !departurePort || !planningToGo) {
      return NextResponse.json(
        { success: false, error: 'Please complete all required fields.' },
        { status: 400 }
      );
    }

    if (!allowedPartySizes.has(partySize)) {
      return NextResponse.json({ success: false, error: 'Invalid household size.' }, { status: 400 });
    }

    if (!allowedPackageTypes.has(packageType)) {
      return NextResponse.json({ success: false, error: 'Invalid package type.' }, { status: 400 });
    }

    if (!allowedAccommodationTypes.has(accommodationType)) {
      return NextResponse.json({ success: false, error: 'Invalid accommodation preference.' }, { status: 400 });
    }

    if (!allowedRoomPreferences.has(roomPreference)) {
      return NextResponse.json({ success: false, error: 'Invalid room preference.' }, { status: 400 });
    }

    if (!allowedPlanningValues.has(planningToGo)) {
      return NextResponse.json({ success: false, error: 'Invalid Hajj planning selection.' }, { status: 400 });
    }

    const dependants = Array.isArray(body.dependants)
      ? body.dependants.map((dependant: any) => ({
          name: cleanString(dependant?.name),
          phoneNumber: cleanString(dependant?.phoneNumber),
          email: cleanString(dependant?.email),
        }))
      : [];

    for (const dependant of dependants) {
      if (!dependant.name) {
        return NextResponse.json(
          {
            success: false,
            error: 'Each dependant must include a name.',
          },
          { status: 400 }
        );
      }

      if (!dependant.phoneNumber && !dependant.email) {
        return NextResponse.json(
          {
            success: false,
            error: `Each dependant must include a phone number or email address.`,
          },
          { status: 400 }
        );
      }
    }

    const savedInterest = await HajjInterest.create({
      email,
      firstName,
      lastName,
      phoneNumber,
      partySize,
      packageType,
      accommodationType,
      roomPreference,
      departurePort,
      planningToGo,
      dependants,
    });

    return NextResponse.json(
      { success: true, message: 'Interest form submitted successfully', interest: savedInterest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/hajj-interest error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit interest form' },
      { status: 500 }
    );
  }
}
