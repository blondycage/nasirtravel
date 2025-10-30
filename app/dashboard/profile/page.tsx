'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <button
            onClick={handleLogout}
            className="text-primary-blue hover:underline"
          >
            Login Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-primary-blue">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">My Profile</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-blue to-primary-orange rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-600">{profile.email}</p>
                <span className="inline-block mt-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                  {profile.role.toUpperCase()}
                </span>
              </div>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: profile.name,
                      email: profile.email,
                      phone: profile.phone || '',
                    });
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Full Name</p>
                <p className="font-semibold text-gray-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email Address</p>
                <p className="font-semibold text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                <p className="font-semibold text-gray-900">{profile.phone || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
        >
          <Link
            href="/dashboard"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">My Bookings</h3>
                <p className="text-gray-600 text-sm">View all your bookings</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">🎫</div>
            </div>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment History</h3>
                <p className="text-gray-600 text-sm">View invoices & payments</p>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">💳</div>
            </div>
          </Link>
        </motion.div>

        {/* Logout Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Logout
          </button>
        </motion.div>
      </div>
    </div>
  );
}
