import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

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
          <p><strong>Total Amount:</strong> $${bookingDetails.totalAmount}</p>
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

export const sendPaymentConfirmation = async (
  to: string,
  paymentDetails: {
    customerName: string;
    amount: number;
    bookingId: string;
  }
) => {
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
