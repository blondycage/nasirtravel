'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PaymentForm from '@/components/PaymentForm';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [clientSecret, setClientSecret] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        setClientSecret(data.clientSecret);
        setAmount(data.amount);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      createPaymentIntent();
    }
  }, [bookingId]);

  const handleSuccess = () => {
    router.push(`/booking-confirmation?booking=${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-700 mb-2">Payment Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No payment information available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <PaymentForm
        clientSecret={clientSecret}
        bookingId={bookingId}
        amount={amount}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
