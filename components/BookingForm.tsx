'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BookingFormProps {
  tourId: string;
  tourTitle: string;
  pricePerPerson: number;
}

export default function BookingForm({ tourId, tourTitle, pricePerPerson }: BookingFormProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfTravelers: 1,
    bookingDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = formData.numberOfTravelers * pricePerPerson;

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(true);
          setUserData(data.user);
          // Auto-populate form with user data
          setFormData(prev => ({
            ...prev,
            customerName: data.user.name || '',
            customerEmail: data.user.email || '',
            customerPhone: data.user.phone || ''
          }));
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('token');
        }
      } catch (err) {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please log in to continue');
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tourId,
          ...formData,
          totalAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to payment page
      router.push(`/payment/${data.booking._id || data.data?._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfTravelers' ? parseInt(value) || 1 : value
    }));
  };

  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Checking authentication...</span>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    // Store current URL for redirect after login
    const currentPath = window.location.pathname;
    const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    const registerUrl = `/register?redirect=${encodeURIComponent(currentPath)}`;

    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Book {tourTitle}</h2>

        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-bold text-yellow-800 mb-2">Login Required</h3>
              <p className="text-yellow-700 mb-4">
                You must be logged in to book this tour. This ensures you can access and manage your booking,
                fill out application forms for yourself and dependants after payment.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={loginUrl} className="flex-1">
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition">
              Login to Continue
            </button>
          </Link>
          <Link href={registerUrl} className="flex-1">
            <button className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition">
              Create Account
            </button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-600 text-center">
          Don&apos;t have an account? Register now to book this tour and access all features.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Book {tourTitle}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Logged in user info */}
      <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-bold text-green-800 mb-1">Logged in as {userData?.name}</h3>
            <p className="text-sm text-green-700">
              After payment, you&apos;ll be able to fill out application forms for yourself and add dependants to this booking.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            required
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
          <p className="mt-1 text-xs text-gray-600">
            You will need to register with this email to access application forms
          </p>
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            required
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+1 (123) 456-7890"
          />
        </div>

        <div>
          <label htmlFor="numberOfTravelers" className="block text-sm font-medium mb-1">
            Number of Travelers *
          </label>
          <input
            type="number"
            id="numberOfTravelers"
            name="numberOfTravelers"
            required
            min="1"
            value={formData.numberOfTravelers}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium mb-1">
            Booking Date *
          </label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            disabled
            required
            value={formData.bookingDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            ${pricePerPerson.toLocaleString()} × {formData.numberOfTravelers} traveler(s)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
