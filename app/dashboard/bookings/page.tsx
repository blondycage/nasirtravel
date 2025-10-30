'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Booking {
  _id: string;
  tour: {
    _id: string;
    title: string;
    image: string;
  };
  bookingDate: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  documents: any[];
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filterBookings = () => {
    const now = new Date();

    switch (filter) {
      case 'upcoming':
        return bookings.filter(b => new Date(b.bookingDate) >= now);
      case 'past':
        return bookings.filter(b => new Date(b.bookingDate) < now);
      default:
        return bookings;
    }
  };

  const filteredBookings = filterBookings();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage all your tour bookings</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Past
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven't made any bookings yet."
              : `You have no ${filter} bookings.`}
          </p>
          <Link
            href="/packages"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Tours
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Tour Image */}
                  {booking.tour?.image && (
                    <div className="w-full md:w-48 h-32 flex-shrink-0">
                      <img
                        src={booking.tour.image}
                        alt={booking.tour.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.tour?.title || 'Tour'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Booking Date: {new Date(booking.bookingDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          ${(booking.totalAmount / 100).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.bookingStatus)}`}>
                            {booking.bookingStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{booking.numberOfTravelers} Traveler(s)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>
                      {booking.documents && booking.documents.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span>📎</span>
                          <span>{booking.documents.length} Document(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Link
                        href={`/dashboard/bookings/${booking._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        View Details
                      </Link>
                      {booking.paymentStatus === 'pending' && (
                        <Link
                          href={`/payment/${booking._id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
                        >
                          Complete Payment
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
