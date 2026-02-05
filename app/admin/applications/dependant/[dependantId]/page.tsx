'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, authFetch } from '@/hooks/useAuth';
import ApplicationReviewForm from '@/components/admin/ApplicationReviewForm';

export default function AdminDependantApplicationReviewPage() {
  const params = useParams();
  const router = useRouter();
  const dependantId = params.dependantId as string;
  const { isAuthenticated, isLoading: authLoading } = useAuth({ requiredRole: 'admin' });

  const [dependant, setDependant] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated && dependantId) {
      fetchApplication();
    }
  }, [dependantId, isAuthenticated]);

  const fetchApplication = async () => {
    try {
      const response = await authFetch(`/api/admin/applications/dependant/${dependantId}`);

      if (!response.ok) throw new Error('Failed to fetch application');

      const data = await response.json();
      setDependant(data.dependant);
      setBooking(data.booking);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, reason?: string) => {
    const response = await authFetch(`/api/admin/dependants/${dependantId}/application-status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to update status');
    }

    setSuccessMessage(`Application status updated to ${status.replace('_', ' ')}${reason ? ' and email sent to customer' : ''}`);
    setTimeout(() => setSuccessMessage(''), 5000);
    await fetchApplication();
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect automatically
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Application Not Found</h2>
        <Link href="/admin/applications" className="text-blue-600 hover:underline">
          Back to Applications
        </Link>
      </div>
    );
  }

  const formData = dependant || {};
  const packageType = booking?.packageType || 'standard';

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm rounded-lg mb-6 p-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base">
            ← Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/admin/applications" className="text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm sm:text-base">
            Applications
          </Link>
          <span className="text-gray-300">|</span>
          <span className="text-gray-700 font-semibold text-sm sm:text-base">Dependant Application</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Dependant Application Review
        </h1>
        <p className="text-sm sm:text-base text-gray-600">{dependant?.name} - {booking?.tour?.title}</p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          ✓ {successMessage}
        </div>
      )}

      {/* Status Update Section */}
      <ApplicationReviewForm
        currentStatus={dependant?.applicationStatus || 'pending'}
        currentReason={dependant?.applicationRejectionReason}
        onSubmit={handleUpdateStatus}
      />

      {/* Application Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Application Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Package Type</p>
            <p className="font-semibold capitalize">{packageType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Submitted At</p>
            <p className="font-semibold">
              {dependant?.applicationFormSubmittedAt
                ? new Date(dependant.applicationFormSubmittedAt).toLocaleString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Nationality</p>
            <p className="font-semibold">{formData.countryOfNationality || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">First Name</p>
            <p className="font-semibold">{formData.firstName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Middle Name</p>
            <p className="font-semibold">{formData.fatherName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Name</p>
            <p className="font-semibold">{formData.lastName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-semibold capitalize">{formData.gender || 'N/A'}</p>
          </div>
          {packageType === 'umrah' && (
            <div>
              <p className="text-sm text-gray-600">Marital Status</p>
              <p className="font-semibold">{formData.maritalStatus || 'N/A'}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-semibold">
              {formData.dateOfBirth
                ? new Date(formData.dateOfBirth).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          {packageType === 'umrah' && (
            <>
              <div>
                <p className="text-sm text-gray-600">Country of Birth</p>
                <p className="font-semibold">{formData.countryOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City of Birth</p>
                <p className="font-semibold">{formData.cityOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profession</p>
                <p className="font-semibold">{formData.profession || 'N/A'}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Passport Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Passport Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Passport Number</p>
            <p className="font-semibold">{formData.passportNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Passport Issue Place</p>
            <p className="font-semibold">{formData.passportIssuePlace || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Issue Date</p>
            <p className="font-semibold">
              {formData.passportIssueDate
                ? new Date(formData.passportIssueDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Expiry Date</p>
            <p className="font-semibold">
              {formData.passportExpiryDate
                ? new Date(formData.passportExpiryDate).toLocaleDateString()
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Residence Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Residence Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Country</p>
            <p className="font-semibold">{formData.residenceCountry || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">City</p>
            <p className="font-semibold">{formData.residenceCity || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Postal Code</p>
            <p className="font-semibold">{formData.residenceZipCode || 'N/A'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Street Address</p>
            <p className="font-semibold">{formData.residenceAddress || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Documents</h2>
        <div className="space-y-3">
          {dependant?.personalPassportPicture && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>📸 Personal Passport Picture</span>
              <a
                href={dependant.personalPassportPicture.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </div>
          )}
          {dependant?.internationalPassport && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>🛂 International Passport</span>
              <a
                href={dependant.internationalPassport.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </div>
          )}
          {packageType === 'umrah' && dependant?.passportPhoto && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span>🖼️ Passport Style Photo</span>
              <a
                href={dependant.passportPhoto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View
              </a>
            </div>
          )}
          {dependant?.supportingDocuments?.length > 0 && (
            <div>
              <p className="font-semibold mb-2">Supporting Documents:</p>
              {dependant.supportingDocuments.map((doc: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded mb-2">
                  <span>📄 {doc.name}</span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
