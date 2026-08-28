import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SupportTicket from '@/lib/models/SupportTicket';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const name = cleanString(body.name, 120);
    const email = cleanString(body.email, 180).toLowerCase();
    const phone = cleanString(body.phone, 60);
    const subject = cleanString(body.subject, 160) || 'Chatbot support request';
    const message = cleanString(body.message, 2000);
    const lastUserMessage = cleanString(body.lastUserMessage, 1000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    await connectDB();

    const ticket = await SupportTicket.create({
      name,
      email,
      phone: phone || undefined,
      subject,
      message,
      source: 'chatbot',
      status: 'open',
      priority: 'normal',
      metadata: {
        lastUserMessage: lastUserMessage || undefined,
        matchedEntryIds: Array.isArray(body.matchedEntryIds)
          ? body.matchedEntryIds.filter((id: unknown) => typeof id === 'string').slice(0, 10)
          : [],
        evidenceSufficient: typeof body.evidenceSufficient === 'boolean'
          ? body.evidenceSufficient
          : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      ticketId: ticket._id.toString(),
      message: 'Your support request has been created.',
    }, { status: 201 });
  } catch (error) {
    console.error('[Support Ticket Error]', error);
    return NextResponse.json(
      { success: false, error: 'Unable to create support request right now.' },
      { status: 500 }
    );
  }
}
