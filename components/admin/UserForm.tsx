'use client';

import { useState } from 'react';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    role?: 'user' | 'admin';
  };
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export default function UserForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    password: '',
    role: initialData?.role || 'user',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    if (mode === 'create' && !formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);

    try {
      // For edit mode, don't send password field
      const submitData = mode === 'edit'
        ? { name: formData.name, email: formData.email, phone: formData.phone, role: formData.role }
        : formData;

      await onSubmit(submitData);
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'create' ? 'Create New User' : 'Edit User'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="John Doe"
          disabled={loading}
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="john@example.com"
          disabled={loading}
        />
      </div>

      {/* Phone */}
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="+1 (555) 123-4567"
          disabled={loading}
        />
      </div>

      {/* Password (only for create mode) */}
      {mode === 'create' && (
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Minimum 6 characters"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>
      )}

      {/* Role */}
      <div className="mb-6">
        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
          User Role <span className="text-red-500">*</span>
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          <option value="user">User (Customer)</option>
          <option value="admin">Admin</option>
        </select>
        <p className="mt-1 text-sm text-gray-500">
          Admins have full access to manage tours, bookings, and applications
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} User`}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {mode === 'edit' && (
        <p className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <strong>Note:</strong> Password cannot be changed through this form. Use the password reset feature if needed.
        </p>
      )}
    </form>
  );
}
