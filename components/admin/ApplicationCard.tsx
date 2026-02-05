'use client';

import Link from 'next/link';

interface ApplicationCardProps {
  type: 'user' | 'dependant';
  applicantName: string;
  applicationNumber?: string;
  status: string;
  submittedAt?: string | Date;
  rejectionReason?: string;
  bookingId: string;
  dependantId?: string;
  relationship?: string;
  showActions?: boolean;
}

export default function ApplicationCard({
  type,
  applicantName,
  applicationNumber,
  status,
  submittedAt,
  rejectionReason,
  bookingId,
  dependantId,
  relationship,
  showActions = true,
}: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      submitted: 'bg-blue-100 text-blue-800 border-blue-300',
      under_review: 'bg-orange-100 text-orange-800 border-orange-300',
      needs_revision: 'bg-purple-100 text-purple-800 border-purple-300',
      accepted: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      pending: '⏳',
      submitted: '📨',
      under_review: '🔍',
      needs_revision: '✏️',
      accepted: '✅',
      rejected: '❌',
    };
    return icons[status] || '📄';
  };

  const applicationLink = type === 'user'
    ? `/admin/applications/user/${bookingId}`
    : `/admin/applications/dependant/${dependantId}`;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{applicantName}</h3>
            {type === 'dependant' && relationship && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {relationship}
              </span>
            )}
          </div>

          {applicationNumber && (
            <p className="text-sm text-gray-600">
              App #{applicationNumber}
            </p>
          )}
        </div>

        {/* Type Badge */}
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            type === 'user'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-teal-100 text-teal-800'
          }`}
        >
          {type === 'user' ? 'PRIMARY' : 'DEPENDANT'}
        </span>
      </div>

      {/* Status */}
      <div className="mb-3">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${getStatusColor(status)}`}>
          <span className="text-lg">{getStatusIcon(status)}</span>
          <span className="font-semibold text-sm uppercase">
            {status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Submitted Date */}
      {submittedAt && (
        <p className="text-sm text-gray-600 mb-2">
          <span className="font-medium">Submitted:</span>{' '}
          {new Date(submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}

      {/* Rejection Reason */}
      {rejectionReason && (status === 'rejected' || status === 'needs_revision') && (
        <div className={`mb-3 p-3 rounded-lg border-l-4 ${
          status === 'rejected'
            ? 'bg-red-50 border-red-400'
            : 'bg-purple-50 border-purple-400'
        }`}>
          <p className="text-sm font-semibold mb-1">
            {status === 'rejected' ? 'Rejection Reason:' : 'Revision Notes:'}
          </p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Link
            href={applicationLink}
            className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            {status === 'accepted' || status === 'rejected' ? 'View Details' : 'Review Application'}
          </Link>

          <Link
            href={`/admin/bookings/${bookingId}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            View Booking
          </Link>
        </div>
      )}
    </div>
  );
}
