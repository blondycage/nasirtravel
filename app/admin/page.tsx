'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  totalTours: number;
  totalUsers: number;
  totalReviews: number;
  pendingReferrals: number;
  totalReferralsPaid: number;
  referralRewardsOwed: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E40AF]" />
      </div>
    );
  }

  return (
    <div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalBookings || 0}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Bookings</p>
                <p className="text-3xl font-bold text-orange-600">{stats?.pendingBookings || 0}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Tours</p>
                <p className="text-3xl font-bold text-blue-600">{stats?.totalTours || 0}</p>
              </div>
              <div className="text-4xl">🗺️</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Reviews</p>
                <p className="text-3xl font-bold text-yellow-600">{stats?.totalReviews || 0}</p>
              </div>
              <div className="text-4xl">⭐</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Referrals</p>
                <p className="text-3xl font-bold text-orange-500">{stats?.pendingReferrals || 0}</p>
                <p className="text-xs text-gray-400 mt-1">awaiting confirmation</p>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rewards Owed</p>
                <p className="text-3xl font-bold text-red-500">
                  CA${(stats?.referralRewardsOwed || 0).toFixed(2)}
                </p>
                <p className="text-xs text-gray-400 mt-1">pending + confirmed</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Referrals Paid Out</p>
                <p className="text-3xl font-bold text-green-600">{stats?.totalReferralsPaid || 0}</p>
                <p className="text-xs text-gray-400 mt-1">completed rewards</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/tours"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">📝</div>
              <p className="font-medium">Manage Tours</p>
            </Link>

            <Link
              href="/admin/bookings"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">📋</div>
              <p className="font-medium">View Bookings</p>
            </Link>

            <Link
              href="/admin/users"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">👥</div>
              <p className="font-medium">Manage Users</p>
            </Link>

            <Link
              href="/admin/reviews"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">⭐</div>
              <p className="font-medium">Manage Reviews</p>
            </Link>

            <Link
              href="/admin/applications"
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-center"
            >
              <div className="text-3xl mb-2">📄</div>
              <p className="font-medium">Review Applications</p>
            </Link>

            <Link
              href="/admin/referrals"
              className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition text-center"
            >
              <div className="text-3xl mb-2">🎁</div>
              <p className="font-medium">Manage Referrals</p>
              {(stats?.pendingReferrals ?? 0) > 0 && (
                <span className="inline-block mt-1 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                  {stats?.pendingReferrals} pending
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <p className="text-gray-600">Recent bookings and updates will appear here.</p>
        </div>
    </div>
  );
}
