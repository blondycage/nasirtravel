import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tour from '@/lib/models/Tour';
import { normalizePackageInfoTables } from '@/lib/utils/packageInfoTables';
import { normalizeTourInventoryInput } from '@/lib/utils/tourInventory';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const tour = await Tour.findById(params.id);

    if (!tour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tour });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const body = await request.json();
    const inventory = normalizeTourInventoryInput(body);
    if (inventory.error) return NextResponse.json({ success: false, error: inventory.error }, { status: 400 });
    Object.assign(body, inventory.value);
    body.infoTables = normalizePackageInfoTables(body.infoTables);

    const tour = await Tour.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: tour });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const tour = await Tour.findByIdAndDelete(params.id);

    if (!tour) {
      return NextResponse.json({ success: false, error: 'Tour not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: {} });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
