'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormContentProps {
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

function PaymentFormContent({ clientSecret, bookingId, amount, onSuccess }: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error('Payment confirmation is taking too long. Please check your connection and try again.'));
      }, timeoutMs);
    });

    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timeoutId!);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment form is still loading. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        setError(submitError.message || 'Please check your payment details and try again.');
        return;
      }

      const { error: confirmError, paymentIntent } = await withTimeout(stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking=${bookingId}`,
        },
        redirect: 'if_required',
      }), 45000);

      if (confirmError) {
        setError(confirmError.message || 'Payment failed. Please try again.');
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntent: paymentIntent.id }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Payment succeeded, but booking confirmation failed. Please contact support.');
        }

        onSuccess();
        return;
      }

      if (paymentIntent?.status === 'processing') {
        setError('Your payment is still processing. Please wait a moment, then refresh the booking status.');
        return;
      }

      setError(`Payment status: ${paymentIntent?.status || 'unknown'}. Please try again or contact support.`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700">Booking Total:</span>
          <span className="text-2xl font-bold text-blue-600">
            CA${(amount / 100).toLocaleString()}
          </span>
        </div>
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay CA$${(amount / 100).toLocaleString()}`}
      </button>

      <div className="text-center text-sm text-gray-500">
        <p>🔒 Secure payment powered by Stripe</p>
      </div>
    </form>
  );
}

interface PaymentFormProps {
  clientSecret: string;
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
}

export default function PaymentForm({ clientSecret, bookingId, amount, onSuccess = () => {} }: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#2563eb',
      },
    },
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Complete Your Payment</h2>
      <Elements stripe={stripePromise} options={options}>
        <PaymentFormContent
          clientSecret={clientSecret}
          bookingId={bookingId}
          amount={amount}
          onSuccess={onSuccess}
        />
      </Elements>
    </div>
  );
}
