import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { hashPassword, generateToken } from '@/lib/utils/auth';
import { sendSignupConfirmation } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password, phone } = body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send welcome email
    console.log('📨 Attempting to send signup confirmation email...');
    try {
      const emailResult = await sendSignupConfirmation(user.email, user.name);
      console.log('📬 Signup email result:', emailResult);

      if (emailResult.success) {
        console.log('✅ Signup confirmation email sent successfully');
      } else {
        console.warn('⚠️ Signup email failed but continuing with registration');
      }
    } catch (emailError: any) {
      console.error('❌ Failed to send signup confirmation email:');
      console.error('Error details:', {
        message: emailError.message,
        stack: emailError.stack,
        fullError: emailError
      });
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
