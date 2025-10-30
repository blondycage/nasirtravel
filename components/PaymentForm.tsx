'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormContentProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

function PaymentFormContent({ bookingId, amount, onSuccess }: PaymentFormContentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking-confirmation?booking=${bookingId}`,
        },
      });

      if (submitError) {
        setError(submitError.message || 'Payment failed');
      } else {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
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
            ${(amount / 100).toLocaleString()}
          </span>
        </div>
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay $${(amount / 100).toLocaleString()}`}
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
        <PaymentFormContent bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
      </Elements>
    </div>
  );
}
