import nodemailer from 'nodemailer';

// Get the "from" email address (defaults to EMAIL_USER if not set)
const getFromAddress = () => {
  return  'noreply@naasirtravel.com';
};

// Enhanced logging utility
const logEmailDebug = (type: string, data: any) => {
  const timestamp = new Date().toISOString();
  console.log('\n' + '='.repeat(80));
  console.log(`[EMAIL DEBUG ${timestamp}] ${type}`);
  console.log('='.repeat(80));
  console.log(JSON.stringify(data, null, 2));
  console.log('='.repeat(80) + '\n');
};

// Check if email is configured
const isEmailConfigured = () => {
  const configured = !!(process.env.EMAIL_USER && process.env.EMAIL_APP_PASSWORD);

  logEmailDebug('EMAIL CONFIGURATION CHECK', {
    configured,
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPassword: !!process.env.EMAIL_APP_PASSWORD,
    emailUserLength: process.env.EMAIL_USER?.length || 0,
    emailPasswordLength: process.env.EMAIL_APP_PASSWORD?.length || 0,
    emailUser: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 3)}***` : 'NOT SET'
  });

  return configured;
};

// Create transporter only if email is configured (Gmail SMTP)
const getTransporter = () => {
  if (!isEmailConfigured()) {
    logEmailDebug('TRANSPORTER CREATION FAILED', {
      reason: 'Email not configured',
      emailUser: process.env.EMAIL_USER,
      hasPassword: !!process.env.EMAIL_APP_PASSWORD
    });
    return null;
  }

  const transportConfig = {
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD, // Your Gmail App Password (NOT regular password)
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  };

  // Show first and last 3 characters of password for verification
  const maskPassword = (pwd: string | undefined) => {
    if (!pwd) return 'NOT SET';
    if (pwd.length <= 6) return '***INVALID_LENGTH***';
    const first3 = pwd.substring(0, 3);
    const last3 = pwd.substring(pwd.length - 3);
    const middle = '*'.repeat(Math.max(0, pwd.length - 6));
    return `${first3}${middle}${last3}`;
  };

  logEmailDebug('TRANSPORTER CREATED', {
    service: transportConfig.service,
    host: transportConfig.host,
    port: transportConfig.port,
    secure: transportConfig.secure,
    user: transportConfig.auth.user,
    userMasked: transportConfig.auth.user ? `${transportConfig.auth.user.substring(0, 5)}***@${transportConfig.auth.user.split('@')[1] || ''}` : 'NOT SET',
    hasPassword: !!transportConfig.auth.pass,
    passwordLength: transportConfig.auth.pass?.length || 0,
    passwordMasked: maskPassword(transportConfig.auth.pass),
    passwordFirst3Chars: transportConfig.auth.pass?.substring(0, 3) || 'NOT SET',
    passwordLast3Chars: transportConfig.auth.pass?.substring(transportConfig.auth.pass.length - 3) || 'NOT SET',
    // Full credentials for debugging (REMOVE IN PRODUCTION!)
    FULL_EMAIL_FOR_DEBUG: process.env.EMAIL_USER,
    FULL_PASSWORD_FOR_DEBUG: process.env.EMAIL_APP_PASSWORD
  });

  return nodemailer.createTransport(transportConfig);
};

// Helper function to send email with debugging
const sendEmailWithDebug = async (
  emailType: string,
  transporter: any,
  mailOptions: any
) => {
  logEmailDebug(`${emailType} - MAIL OPTIONS`, {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    htmlLength: mailOptions.html?.length || 0
  });

  try {
    const info = await transporter.sendMail(mailOptions);
    logEmailDebug(`${emailType} - SUCCESS`, {
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
      envelope: info.envelope
    });
    return { success: true, info };
  } catch (error: any) {
    logEmailDebug(`${emailType} - ERROR`, {
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack,
      errorCommand: error.command,
      errorResponse: error.response,
      errorResponseCode: error.responseCode,
      fullError: JSON.stringify(error, null, 2)
    });
    return { success: false, error };
  }
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
  logEmailDebug('SEND BOOKING CONFIRMATION - START', {
    to,
    bookingDetails
  });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND BOOKING CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND BOOKING CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const mailOptions = {
    from: getFromAddress(),
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
          <p><strong>Total Amount:</strong> CA$${bookingDetails.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>

        <p>We will send you more details about your tour closer to the departure date.</p>
        <p>If you have any questions, please don't hesitate to contact us.</p>

        <p>Best regards,<br>Naasir Travel Team</p>
      </div>
    `,
  };

  return sendEmailWithDebug('SEND BOOKING CONFIRMATION', transporter, mailOptions);
};

// Email template for user signup
export const sendSignupConfirmation = async (to: string, userName: string) => {
  logEmailDebug('SEND SIGNUP CONFIRMATION - START', { to, userName });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND SIGNUP CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND SIGNUP CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const mailOptions = {
    from: getFromAddress(),
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

  return sendEmailWithDebug('SEND SIGNUP CONFIRMATION', transporter, mailOptions);
};

// Email template for password reset
export const sendPasswordResetEmail = async (to: string, userName: string, resetToken: string) => {
  logEmailDebug('SEND PASSWORD RESET - START', { to, userName, tokenLength: resetToken.length });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND PASSWORD RESET - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND PASSWORD RESET - FAILED', { error });
    return { success: false, error };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${appUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: getFromAddress(),
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

  return sendEmailWithDebug('SEND PASSWORD RESET', transporter, mailOptions);
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
  logEmailDebug('SEND ADMIN APPLICATION NOTIFICATION - START', {
    applicationType, bookingId, applicationId, customerName, customerEmail, tourTitle
  });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND ADMIN APPLICATION NOTIFICATION - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND ADMIN APPLICATION NOTIFICATION - FAILED', { error });
    return { success: false, error };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminLink = applicationType === 'user' 
    ? `${appUrl}/admin/applications?bookingId=${bookingId}`
    : `${appUrl}/admin/applications/dependant/${applicationId}`;

  const mailOptions = {
    from: getFromAddress(),
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

  return sendEmailWithDebug('SEND ADMIN APPLICATION NOTIFICATION', transporter, mailOptions);
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
  logEmailDebug('SEND APPLICATION STATUS UPDATE - START', {
    to, customerName, applicationType, applicationName, status, tourTitle, bookingId
  });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND APPLICATION STATUS UPDATE - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND APPLICATION STATUS UPDATE - FAILED', { error });
    return { success: false, error };
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
    from: getFromAddress(),
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

  return sendEmailWithDebug('SEND APPLICATION STATUS UPDATE', transporter, mailOptions);
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
  logEmailDebug('SEND ENQUIRY NOTIFICATION - START', { enquiryData });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND ENQUIRY NOTIFICATION - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND ENQUIRY NOTIFICATION - FAILED', { error });
    return { success: false, error };
  }

  // Send to admin
  const adminMailOptions = {
    from: getFromAddress(),
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
    from: getFromAddress(),
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
    logEmailDebug('SEND ENQUIRY NOTIFICATION - SENDING BOTH EMAILS', {
      adminTo: adminMailOptions.to,
      customerTo: customerMailOptions.to
    });

    const [adminResult, customerResult] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(customerMailOptions),
    ]);

    logEmailDebug('SEND ENQUIRY NOTIFICATION - SUCCESS', {
      adminMessageId: adminResult.messageId,
      customerMessageId: customerResult.messageId,
      adminAccepted: adminResult.accepted,
      customerAccepted: customerResult.accepted
    });

    return { success: true };
  } catch (error: any) {
    logEmailDebug('SEND ENQUIRY NOTIFICATION - ERROR', {
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack,
      fullError: JSON.stringify(error, null, 2)
    });
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
  logEmailDebug('SEND PAYMENT CONFIRMATION - START', { to, paymentDetails });

  if (!isEmailConfigured()) {
    const error = 'Email not configured';
    logEmailDebug('SEND PAYMENT CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const transporter = getTransporter();
  if (!transporter) {
    const error = 'Failed to create email transporter';
    logEmailDebug('SEND PAYMENT CONFIRMATION - FAILED', { error });
    return { success: false, error };
  }

  const mailOptions = {
    from: getFromAddress(),
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
          <p><strong>Amount Paid:</strong> CA$${paymentDetails.amount}</p>
        </div>

        <p>Thank you for your payment!</p>

        <p>Best regards,<br>Naasir Travel Team</p>
      </div>
    `,
  };

  return sendEmailWithDebug('SEND PAYMENT CONFIRMATION', transporter, mailOptions);
};
