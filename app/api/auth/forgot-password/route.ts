import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { generateResetToken } from '@/lib/utils/auth';
import { sendPasswordResetEmail } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    console.log('\n🔐 FORGOT PASSWORD API - Request received');

    await connectDB();
    const body = await request.json();
    const { email } = body;

    console.log('📧 Email from request:', email);

    if (!email) {
      console.log('❌ No email provided');
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    console.log('🔍 Searching for user with email:', email);
    const user = await User.findOne({ email });

    // Always return success to prevent email enumeration
    // Don't reveal if email exists or not
    if (!user) {
      console.log('⚠️ User not found (returning success to prevent enumeration)');
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset link.',
      });
    }

    console.log('✅ User found:', { email: user.email, name: user.name, id: user._id });

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // 1 hour expiry

    console.log('🔑 Reset token generated:', {
      tokenLength: resetToken.length,
      expiresAt: resetTokenExpiry.toISOString()
    });

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    console.log('💾 Reset token saved to database');

    // Send password reset email
    console.log('📨 Attempting to send password reset email...');
    try {
      const emailResult = await sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log('📬 Email send result:', emailResult);

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Email sending failed');
      }

      console.log('✅ Password reset email sent successfully');
    } catch (emailError: any) {
      console.error('❌ Failed to send password reset email:');
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        fullError: emailError
      });

      // Clear the token if email fails
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      console.log('🧹 Cleared reset token from database due to email failure');

      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email. Please try again later.' },
        { status: 500 }
      );
    }

    console.log('✅ FORGOT PASSWORD API - Completed successfully\n');

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error: any) {
    console.error('❌ FORGOT PASSWORD API - Unexpected error:');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
