import { NextRequest, NextResponse } from 'next/server';
import { sendEnquiryNotification } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message, packageInterest } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email notification
    try {
      await sendEnquiryNotification({
        name,
        email,
        phone,
        subject,
        message,
        packageInterest,
      });
    } catch (emailError) {
      console.error('Failed to send enquiry email:', emailError);
      // Still return success to user even if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Your enquiry has been submitted successfully. We will get back to you soon!',
    });
  } catch (error: any) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
