import { NextRequest, NextResponse } from 'next/server';
import { sendSignupConfirmation } from '@/lib/utils/email';

/**
 * Test email endpoint - REMOVE IN PRODUCTION
 * Use this to test email configuration
 *
 * Usage: POST /api/test-email
 * Body: { "email": "test@example.com", "userName": "Test User" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, userName } = body;

    if (!email || !userName) {
      return NextResponse.json(
        { success: false, error: 'Email and userName are required' },
        { status: 400 }
      );
    }

    console.log('\n🧪 TEST EMAIL ENDPOINT - Starting test...\n');
    console.log(`Sending test email to: ${email}`);
    console.log(`User name: ${userName}`);
    console.log('\n📧 Check console for detailed debug logs below:\n');

    const result = await sendSignupConfirmation(email, userName);

    if (result.success) {
      console.log('\n✅ TEST EMAIL - SUCCESS\n');
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check server console for debug logs.'
      });
    } else {
      console.log('\n❌ TEST EMAIL - FAILED\n');
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'Failed to send test email. Check server console for debug logs.'
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('\n❌ TEST EMAIL - EXCEPTION\n', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Exception occurred. Check server console for details.'
    }, { status: 500 });
  }
}
