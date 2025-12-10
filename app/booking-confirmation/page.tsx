'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking');
  const paymentIntent = searchParams.get('payment_intent');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const confirmBooking = async () => {
      if (!bookingId || !paymentIntent) {
        setError('Invalid confirmation link');
        setLoading(false);
        return;
      }

      try {
        // Update booking status after successful payment
        const response = await fetch(`/api/bookings/${bookingId}/confirm`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntent })
        });

        if (!response.ok) {
          throw new Error('Failed to confirm booking');
        }

        const data = await response.json();
        setBooking(data.booking);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [bookingId, paymentIntent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Confirming your booking...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-24 pb-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-red-700 mb-2">Confirmation Error</h1>
              <p className="text-red-600 mb-6">{error || 'Unable to confirm your booking'}</p>
              <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                Return Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">Booking Confirmed!</h1>
              <p className="text-gray-600">Thank you for your booking. Your payment was successful.</p>
            </div>

            {/* Booking Details */}
            <div className="border-t border-b border-gray-200 py-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking ID:</span>
                  <span className="font-medium text-gray-900">{booking._id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Customer Name:</span>
                  <span className="font-medium text-gray-900">{booking.customerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">{booking.customerEmail}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{booking.customerPhone}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Number of Travelers:</span>
                  <span className="font-medium text-gray-900">{booking.numberOfTravelers}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="text-gray-900 font-semibold">Total Amount:</span>
                  <span className="font-bold text-green-600">
                    ${booking.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {booking.paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Status:</span>
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {booking.bookingStatus}
                  </span>
                </div>
              </div>

              {booking.specialRequests && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-gray-600 text-sm mb-1">Special Requests:</p>
                  <p className="text-gray-900">{booking.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-2">📧 What's Next?</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• A confirmation email has been sent to {booking.customerEmail}</li>
                <li>• You'll receive detailed tour information closer to your departure date</li>
                <li>• Our team will contact you if any additional information is needed</li>
                <li>• Save your Booking ID: <strong>{booking._id}</strong></li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium text-center hover:bg-blue-700 transition"
              >
                Return Home
              </Link>
              <Link
                href="/packages"
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium text-center hover:bg-gray-300 transition"
              >
                Browse More Tours
              </Link>
            </div>

            {/* Support */}
            <div className="mt-8 text-center text-sm text-gray-600">
              <p>Need help? Contact us at support@naasirtravel.com</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}
