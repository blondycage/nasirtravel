'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to fetch user');

      const data = await response.json();
      setUserData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">User Not Found</h2>
          <Link href="/admin/users" className="text-blue-600 hover:underline">
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  const { user, bookings, applications, stats } = userData;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/users" className="text-blue-600 hover:text-blue-700">
                ← Back to Users
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
            </div>
            <Link
              href={`/admin/users/${userId}/edit`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Edit User
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* User Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold">{user.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Joined</p>
              <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalBookings}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalApplications}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Dependants</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalDependants}</p>
          </div>
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Bookings ({bookings.length})</h2>
          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.map((booking: any) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{booking.tour?.title || 'Unknown Tour'}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.bookingDate).toLocaleDateString()} • CA${booking.totalAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                      <Link
                        href={`/admin/bookings/${booking._id}`}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No bookings yet</p>
          )}
        </div>

        {/* Applications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Applications ({applications.length})</h2>
          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {app.type === 'user' ? 'User Application' : `Dependant: ${app.dependantName}`}
                      </p>
                      <p className="text-sm text-gray-600">{app.tourTitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        app.status === 'needs_revision' ? 'bg-purple-100 text-purple-800' :
                        app.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                      <Link
                        href={app.type === 'user'
                          ? `/admin/applications/user/${app.bookingId}`
                          : `/admin/applications/dependant/${app.dependantId}`
                        }
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No applications yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
