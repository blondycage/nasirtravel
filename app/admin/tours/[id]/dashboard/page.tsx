'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ApplicationCard from '@/components/admin/ApplicationCard';
import PackageDashboardStats from '@/components/admin/PackageDashboardStats';

interface Booking {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  bookingDate: string;
  totalAmount: number;
  paymentStatus: string;
  applications: Array<{
    type: 'user' | 'dependant';
    status: string;
    name: string;
    bookingId?: string;
    dependantId?: string;
    rejectionReason?: string;
  }>;
}

interface DashboardData {
  tour: {
    _id: string;
    title: string;
    description: string;
    price: number;
  };
  stats: {
    totalBookings: number;
    totalRevenue: number;
    totalApplications: number;
    applicationsByStatus: {
      pending: number;
      submitted: number;
      under_review: number;
      accepted: number;
      rejected: number;
      needs_revision: number;
    };
  };
  bookings: Booking[];
}

export default function PackageDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, [tourId]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/tours/${tourId}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading package dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Failed to Load Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/tours" className="text-blue-600 hover:underline">
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  const { tour, stats, bookings } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/tours" className="text-blue-600 hover:text-blue-700">
              ← Back to Tours
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tour.title}</h1>
              <p className="text-sm text-gray-600">Package Dashboard</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Tour Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">Package Details</h2>
          <p className="text-gray-700 mb-2">{tour.description}</p>
          <p className="text-lg font-semibold text-blue-600">
            Price: CA${tour.price.toLocaleString()}
          </p>
        </div>

        {/* Stats */}
        <PackageDashboardStats stats={stats} />

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">
            All Bookings ({bookings.length})
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No bookings for this package yet</p>
          ) : (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-6 bg-gray-50">
                  {/* Booking Header */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{booking.user.email}</p>
                      <p className="text-sm text-gray-600">
                        Booked: {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        CA${booking.totalAmount.toLocaleString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                      <div className="mt-2">
                        <Link
                          href={`/admin/bookings/${booking._id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Full Booking →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Applications */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Applications ({booking.applications.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {booking.applications.map((app, index) => (
                        <ApplicationCard
                          key={index}
                          type={app.type}
                          applicantName={app.applicantName}
                          applicationNumber={app.applicationNumber}
                          status={app.status}
                          submittedAt={app.submittedAt}
                          rejectionReason={app.rejectionReason}
                          bookingId={app.bookingId}
                          dependantId={app.dependantId}
                          relationship={app.relationship}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
