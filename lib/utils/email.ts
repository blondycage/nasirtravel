import nodemailer from 'nodemailer';

// Check if email is configured
const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);
};

// Create transporter only if email is configured (Zoho SMTP)
const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  return nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });
};

export const sendBookingConfirmation = async (
  to: string,
  bookingDetails: {
    customerName: string;
    tourTitle: string;
    bookingDate: string;
    numberOfTravelers: number;
    totalAmount: number;
    bookingId: string;
  }
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping booking confirmation email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Booking Confirmation - Naasir Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Booking Confirmation</h2>
        <p>Dear ${bookingDetails.customerName},</p>
        <p>Thank you for booking with Naasir Travel! Your booking has been confirmed.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Booking Details</h3>
          <p><strong>Booking ID:</strong> ${bookingDetails.bookingId}</p>
          <p><strong>Tour:</strong> ${bookingDetails.tourTitle}</p>
          <p><strong>Date:</strong> ${bookingDetails.bookingDate}</p>
          <p><strong>Number of Travelers:</strong> ${bookingDetails.numberOfTravelers}</p>
          <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <p>We will send you more details about your tour closer to the departure date.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br>Naasir Travel Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// Email template for user signup
export const sendSignupConfirmation = async (to: string, userName: string) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping signup confirmation email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Welcome to Naasir Travel!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Naasir Travel!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for creating an account with Naasir Travel! We're excited to have you join us on your journey.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #374151; font-size: 14px; margin: 0;">
              <strong>Your account is now active!</strong> You can now:
            </p>
            <ul style="color: #374151; font-size: 14px; margin: 10px 0; padding-left: 20px;">
              <li>Book tours and packages</li>
              <li>Track your bookings</li>
              <li>Submit application forms</li>
              <li>Manage your profile</li>
            </ul>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            If you have any questions or need assistance, please don't hesitate to contact us at 
            <a href="mailto:info@naasirtravel.com" style="color: #1e40af; text-decoration: none;">info@naasirtravel.com</a> 
            or call us at <a href="tel:+18886627467" style="color: #1e40af; text-decoration: none;">1 (888) 662-7467</a>.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #1e40af;">The Naasir Travel Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// Email template for password reset
export const sendPasswordResetEmail = async (to: string, userName: string, resetToken: string) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping password reset email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Password Reset Request - Naasir Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your Naasir Travel account. Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetLink}" style="color: #1e40af; word-break: break-all;">${resetLink}</a>
          </p>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="color: #92400e; font-size: 14px; margin: 0;">
              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact us if you have concerns.
            </p>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #1e40af;">The Naasir Travel Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// Email notification to admin when application is submitted
export const sendAdminApplicationNotification = async (
  applicationType: 'user' | 'dependant',
  bookingId: string,
  applicationId: string,
  customerName: string,
  customerEmail: string,
  tourTitle: string
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping admin notification email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminLink = applicationType === 'user' 
    ? `${appUrl}/admin/applications?bookingId=${bookingId}`
    : `${appUrl}/admin/applications/dependant/${applicationId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'info@naasirtravel.com',
    subject: `New ${applicationType === 'user' ? 'User' : 'Dependant'} Application Submitted - ${customerName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Application Submitted</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            A new ${applicationType === 'user' ? 'user' : 'dependant'} application has been submitted and requires your review.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Application Details</h3>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Type:</strong> ${applicationType === 'user' ? 'Main User Application' : 'Dependant Application'}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Customer Name:</strong> ${customerName}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Customer Email:</strong> ${customerEmail}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Tour:</strong> ${tourTitle}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Booking ID:</strong> ${bookingId}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${adminLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              Review Application
            </a>
          </div>
          
          <p style="color: #374151; font-size: 14px; line-height: 1.6;">
            Click the button above to review and process this application in the admin panel.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// Email notification when application status is updated by admin
export const sendApplicationStatusUpdate = async (
  to: string,
  customerName: string,
  applicationType: 'user' | 'dependant',
  applicationName: string,
  status: string,
  tourTitle: string,
  bookingId: string
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping application status update email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    accepted: {
      title: 'Application Accepted!',
      message: 'Congratulations! Your application has been accepted. We will contact you with further details soon.',
      color: '#10b981',
    },
    rejected: {
      title: 'Application Status Update',
      message: 'Your application has been reviewed. Unfortunately, it was not accepted at this time. Please contact us for more information.',
      color: '#ef4444',
    },
    under_review: {
      title: 'Application Under Review',
      message: 'Your application is currently under review by our team. We will notify you once a decision has been made.',
      color: '#f59e0b',
    },
    submitted: {
      title: 'Application Submitted',
      message: 'Your application has been successfully submitted and is awaiting review.',
      color: '#3b82f6',
    },
  };

  const statusInfo = statusMessages[status] || {
    title: 'Application Status Update',
    message: `Your application status has been updated to: ${status}`,
    color: '#6b7280',
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const bookingLink = `${appUrl}/dashboard/bookings/${bookingId}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `${statusInfo.title} - Naasir Travel`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">${statusInfo.title}</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${customerName},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            ${statusInfo.message}
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusInfo.color};">
            <h3 style="margin-top: 0; color: #1e40af;">Application Information</h3>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Application Type:</strong> ${applicationType === 'user' ? 'Main User Application' : 'Dependant Application'}
            </p>
            ${applicationType === 'dependant' ? `<p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Name:</strong> ${applicationName}</p>` : ''}
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold; text-transform: capitalize;">${status.replace('_', ' ')}</span>
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Tour:</strong> ${tourTitle}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Booking ID:</strong> ${bookingId}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${bookingLink}" 
               style="display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Booking Details
            </a>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            If you have any questions, please contact us at 
            <a href="mailto:info@naasirtravel.com" style="color: #1e40af; text-decoration: none;">info@naasirtravel.com</a> 
            or call us at <a href="tel:+18886627467" style="color: #1e40af; text-decoration: none;">1 (888) 662-7467</a>.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #1e40af;">The Naasir Travel Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

// Email notification when enquiry/contact form is submitted
export const sendEnquiryNotification = async (
  enquiryData: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    packageInterest?: string;
  }
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping enquiry notification email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  // Send to admin
  const adminMailOptions = {
    from: process.env.EMAIL_USER,
    to: 'info@naasirtravel.com',
    subject: `New Enquiry: ${enquiryData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">New Enquiry Received</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Enquiry Details</h3>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Name:</strong> ${enquiryData.name}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Email:</strong> <a href="mailto:${enquiryData.email}" style="color: #1e40af;">${enquiryData.email}</a>
            </p>
            ${enquiryData.phone ? `<p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${enquiryData.phone}" style="color: #1e40af;">${enquiryData.phone}</a></p>` : ''}
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Subject:</strong> ${enquiryData.subject}
            </p>
            ${enquiryData.packageInterest ? `<p style="color: #374151; font-size: 14px; margin: 5px 0;"><strong>Package Interest:</strong> ${enquiryData.packageInterest}</p>` : ''}
            <p style="color: #374151; font-size: 14px; margin: 10px 0 5px 0;">
              <strong>Message:</strong>
            </p>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #d1d5db; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${enquiryData.message}
            </div>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  // Send confirmation to customer
  const customerMailOptions = {
    from: process.env.EMAIL_USER,
    to: enquiryData.email,
    subject: 'Thank you for your enquiry - Naasir Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Enquiry</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">Dear ${enquiryData.name},</p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for contacting Naasir Travel! We have received your enquiry and our team will get back to you within 24 hours.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">Your Enquiry</h3>
            <p style="color: #374151; font-size: 14px; margin: 5px 0;">
              <strong>Subject:</strong> ${enquiryData.subject}
            </p>
            <p style="color: #374151; font-size: 14px; margin: 10px 0 5px 0;">
              <strong>Message:</strong>
            </p>
            <div style="background: white; padding: 15px; border-radius: 4px; border: 1px solid #d1d5db; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
${enquiryData.message}
            </div>
          </div>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            In the meantime, feel free to browse our <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/packages" style="color: #1e40af; text-decoration: none;">packages</a> or contact us directly at 
            <a href="mailto:info@naasirtravel.com" style="color: #1e40af; text-decoration: none;">info@naasirtravel.com</a> 
            or <a href="tel:+18886627467" style="color: #1e40af; text-decoration: none;">1 (888) 662-7467</a>.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #1e40af;">The Naasir Travel Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Naasir Travel. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions),
    ]);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};

export const sendPaymentConfirmation = async (
  to: string,
  paymentDetails: {
    customerName: string;
    amount: number;
    bookingId: string;
  }
) => {
  if (!isEmailConfigured()) {
    console.log('Email not configured, skipping payment confirmation email');
    return { success: false, error: 'Email not configured' };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: false, error: 'Failed to create email transporter' };
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Payment Confirmation - Naasir Travel',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Payment Confirmed</h2>
        <p>Dear ${paymentDetails.customerName},</p>
        <p>We have received your payment successfully.</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Payment Details</h3>
          <p><strong>Booking ID:</strong> ${paymentDetails.bookingId}</p>
          <p><strong>Amount Paid:</strong> $${paymentDetails.amount}</p>
        </div>

        <p>Thank you for your payment!</p>

        <p>Best regards,<br>Naasir Travel Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
};
