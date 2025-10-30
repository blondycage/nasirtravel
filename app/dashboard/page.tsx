'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Booking {
  _id: string;
  tour?: {
    _id: string;
    title: string;
    image?: string;
  };
  tourId?: {
    _id: string;
    title: string;
    image?: string;
  };
  customerName: string;
  customerEmail: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  documents: any[];
  createdAt: string;
}

export default function UserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      console.log('Fetching bookings for userId:', userId);

      if (!userId) {
        console.error('No userId found in localStorage');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/bookings?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Bookings response status:', res.status);

      const data = await res.json();
      console.log('Bookings data:', data);

      if (data.success) {
        setBookings(data.data || []);
      } else {
        console.error('Bookings fetch failed:', data.error);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = bookings
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const upcomingBookings = bookings.filter(
    (b) => new Date(b.bookingDate) > new Date() && b.bookingStatus !== 'cancelled'
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Manage your bookings and profile</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-primary-blue">{bookings.length}</p>
              </div>
              <div className="text-4xl">🎫</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Upcoming Trips</p>
                <p className="text-3xl font-bold text-primary-orange">{upcomingBookings.length}</p>
              </div>
              <div className="text-4xl">✈️</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-green-600">${totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {['all', 'upcoming', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-primary-blue text-primary-blue'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab} Bookings
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
                <p className="mt-4 text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🧳</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start your journey by booking a tour package</p>
                <Link
                  href="/packages"
                  className="inline-block bg-gradient-to-r from-primary-blue to-primary-orange text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-shadow"
                >
                  Browse Tours
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings
                  .filter((booking) => {
                    if (activeTab === 'upcoming') {
                      return (
                        new Date(booking.bookingDate) > new Date() &&
                        booking.bookingStatus !== 'cancelled'
                      );
                    }
                    if (activeTab === 'past') {
                      return (
                        new Date(booking.bookingDate) <= new Date() ||
                        booking.bookingStatus === 'cancelled'
                      );
                    }
                    return true;
                  })
                  .map((booking, index) => (
                    <motion.div
                      key={booking._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {booking.tour?.title || booking.tourId?.title || 'Tour Package'}
                          </h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Booking ID:</span> {booking._id.slice(-8)}
                            </p>
                            <p>
                              <span className="font-medium">Date:</span>{' '}
                              {new Date(booking.bookingDate).toLocaleDateString()}
                            </p>
                            <p>
                              <span className="font-medium">Travelers:</span> {booking.numberOfTravelers}
                            </p>
                            <p>
                              <span className="font-medium">Amount:</span> ${booking.totalAmount}
                            </p>
                            {booking.documents && booking.documents.length > 0 && (
                              <p className="flex items-center gap-1">
                                <span className="font-medium">Documents:</span>
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  {booking.documents.length}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="flex gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.paymentStatus
                              )}`}
                            >
                              {booking.paymentStatus}
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                booking.bookingStatus
                              )}`}
                            >
                              {booking.bookingStatus}
                            </span>
                          </div>

                          <Link
                            href={`/dashboard/bookings/${booking._id}`}
                            className="text-primary-blue hover:text-primary-orange font-medium text-sm transition-colors"
                          >
                            View Details →
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Link
            href="/packages"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Browse Tours</h3>
                <p className="text-gray-600 text-sm">Explore our travel packages</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">🗺️</div>
            </div>
          </Link>

          <Link
            href="/dashboard/profile"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">My Profile</h3>
                <p className="text-gray-600 text-sm">Update your information</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">👤</div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
