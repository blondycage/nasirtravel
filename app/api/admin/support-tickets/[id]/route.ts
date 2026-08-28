import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';
import { verifyToken, getTokenFromHeader } from '@/lib/utils/auth';

const ALLOWED_STATUSES = new Set(['open', 'in_progress', 'resolved', 'closed']);
const ALLOWED_PRIORITIES = new Set(['normal', 'high']);

async function requireAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  if (!token) return false;

  const decoded = verifyToken(token) as any;
  return Boolean(decoded && decoded.role === 'admin');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!(await requireAdmin(request))) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const update: Record<string, string> = {};

    if (typeof body.status === 'string' && ALLOWED_STATUSES.has(body.status)) {
      update.status = body.status;
    }

    if (typeof body.priority === 'string' && ALLOWED_PRIORITIES.has(body.priority)) {
      update.priority = body.priority;
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid ticket updates provided' },
        { status: 400 }
      );
    }

    const ticket = await SupportTicket.findByIdAndUpdate(
      params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    console.error('[Admin Support Ticket Update Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update support ticket' },
      { status: 500 }
    );
  }
}
