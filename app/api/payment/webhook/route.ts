import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/utils/stripe';
import connectDB from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { sendPaymentConfirmation } from '@/lib/utils/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await connectDB();

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = 'paid';
      booking.bookingStatus = 'confirmed';
      await booking.save();

      // Send payment confirmation email
      try {
        await sendPaymentConfirmation(booking.customerEmail, {
          customerName: booking.customerName,
          amount: booking.totalAmount,
          bookingId: booking._id.toString(),
        });
      } catch (emailError) {
        console.error('Failed to send payment confirmation email:', emailError);
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    const bookingId = paymentIntent.metadata.bookingId;

    const booking = await Booking.findById(bookingId);
    if (booking) {
      booking.paymentStatus = 'failed';
      await booking.save();
    }
  }

  return NextResponse.json({ received: true });
}
