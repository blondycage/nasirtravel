import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

export const createPaymentIntent = async (amount: number, metadata: any) => {
  try {
    console.log('Creating payment intent for amount:', amount);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);
    return paymentIntent;
  } catch (error: any) {
    console.error('Stripe payment intent error:', error.message);
    console.error('Error details:', error);
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

export const retrievePaymentIntent = async (paymentIntentId: string) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error: any) {
    console.error('Stripe retrieve error:', error);
    throw new Error('Failed to retrieve payment intent');
  }
};

export const refundPayment = async (paymentIntentId: string) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
    });
    return refund;
  } catch (error: any) {
    console.error('Stripe refund error:', error);
    throw new Error('Failed to refund payment');
  }
};

export default stripe;
