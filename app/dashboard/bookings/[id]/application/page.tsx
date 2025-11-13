'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ApplicationForm, { ApplicationFormData } from '@/components/ApplicationForm';
import ToastContainer, { useToast } from '@/components/Toast';

export default function UserApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { toasts, success, error: showError, removeToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [applicationData, setApplicationData] = useState<ApplicationFormData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchData();
    }
  }, [bookingId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch booking
      const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!bookingRes.ok) {
        throw new Error('Failed to fetch booking');
      }

      const bookingData = await bookingRes.json();
      if (!bookingData.success) {
        throw new Error(bookingData.error || 'Failed to fetch booking');
      }

      setBooking(bookingData.data);

      // Check if payment is paid
      if (bookingData.data.paymentStatus !== 'paid') {
        setError('Payment must be completed before filling application form');
        setLoading(false);
        return;
      }

      // Check if application is closed
      if (bookingData.data.applicationClosed) {
        setError('Application process has been closed. Cannot submit application.');
        setLoading(false);
        return;
      }

      // Fetch existing application data
      const appRes = await fetch(`/api/bookings/${bookingId}/user-application`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (appRes.ok) {
        const appData = await appRes.json();
        if (appData.success && appData.data) {
          // Convert dates to string format for form
          const formData: ApplicationFormData = {
            ...appData.data,
            dateOfBirth: appData.data.dateOfBirth ? new Date(appData.data.dateOfBirth).toISOString().split('T')[0] : undefined,
            passportIssueDate: appData.data.passportIssueDate ? new Date(appData.data.passportIssueDate).toISOString().split('T')[0] : undefined,
            passportExpiryDate: appData.data.passportExpiryDate ? new Date(appData.data.passportExpiryDate).toISOString().split('T')[0] : undefined,
            expectedArrivalDate: appData.data.expectedArrivalDate ? new Date(appData.data.expectedArrivalDate).toISOString().split('T')[0] : undefined,
            expectedDepartureDate: appData.data.expectedDepartureDate ? new Date(appData.data.expectedDepartureDate).toISOString().split('T')[0] : undefined,
          };
          setApplicationData(formData);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: ApplicationFormData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/bookings/${bookingId}/user-application`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }

      // Refresh data
      await fetchData();
      success('Application form submitted successfully!');
      
      return Promise.resolve();
    } catch (err: any) {
      showError(err.message || 'Failed to submit application');
      throw new Error(err.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href={`/dashboard/bookings/${bookingId}`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Booking Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-6">
          <Link
            href={`/dashboard/bookings/${bookingId}`}
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Booking Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Your Application Form</h1>
          <p className="text-gray-600 mt-2">
            Please fill out all required fields. Make sure the information matches your passport exactly.
          </p>
        </div>

        <ApplicationForm
          applicantType="user"
          applicantId={bookingId}
          initialData={applicationData || undefined}
          onSubmit={handleSubmit}
          readOnly={booking?.userApplicationStatus === 'accepted' || booking?.userApplicationStatus === 'rejected'}
          applicantName={booking?.customerName}
        />
      </div>
    </div>
  );
}
