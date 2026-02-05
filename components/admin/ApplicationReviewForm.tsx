'use client';

import { useState } from 'react';

interface ApplicationReviewFormProps {
  currentStatus: string;
  currentReason?: string;
  onSubmit: (status: string, reason?: string) => Promise<void>;
  onCancel?: () => void;
}

export default function ApplicationReviewForm({
  currentStatus,
  currentReason,
  onSubmit,
  onCancel,
}: ApplicationReviewFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState(currentReason || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-700' },
    { value: 'submitted', label: 'Submitted', color: 'text-blue-700' },
    { value: 'under_review', label: 'Under Review', color: 'text-orange-700' },
    { value: 'needs_revision', label: 'Needs Revision', color: 'text-purple-700' },
    { value: 'accepted', label: 'Accepted', color: 'text-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-700' },
  ];

  const requiresReason = status === 'rejected' || status === 'needs_revision';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (requiresReason && !reason.trim()) {
      setError('Reason is required for rejection or revision');
      return;
    }

    setLoading(true);

    try {
      await onSubmit(status, requiresReason ? reason : undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Change Application Status</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Application Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reason Field (shown for rejection or revision) */}
      {requiresReason && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {status === 'rejected' ? 'Rejection Reason' : 'Revision Notes'}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder={
              status === 'rejected'
                ? 'Enter the reason for rejection...'
                : 'Enter notes on what needs to be revised...'
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={loading}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            {status === 'rejected'
              ? 'This reason will be sent to the customer via email.'
              : 'The customer will receive these notes via email and can resubmit their application.'}
          </p>
        </div>
      )}

      {/* Info Message */}
      {status !== currentStatus && (
        <div className={`mb-4 p-3 rounded-lg border-l-4 ${
          requiresReason
            ? 'bg-yellow-50 border-yellow-400'
            : 'bg-blue-50 border-blue-400'
        }`}>
          <p className="text-sm font-medium">
            {requiresReason
              ? '⚠️ An email will be sent to the customer with your feedback.'
              : '✓ Status will be updated immediately.'}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || status === currentStatus}
          className={`flex-1 px-6 py-3 rounded-lg font-semibold transition ${
            loading || status === currentStatus
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Updating...' : 'Update Status'}
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

      {/* Current Reason Display */}
      {currentReason && (status === 'rejected' || status === 'needs_revision') && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Current {currentStatus === 'rejected' ? 'Rejection Reason' : 'Revision Notes'}:
          </p>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{currentReason}</p>
        </div>
      )}
    </form>
  );
}
