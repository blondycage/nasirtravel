'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface IDocument {
  _id?: string;
  name: string;
  url: string;
  publicId: string;
  uploadedAt: string;
}

interface BookingDetails {
  _id: string;
  tour?: {
    _id: string;
    title: string;
    images: string[];
    category: string;
    startDates: string[];
    departure?: string;
  };
  tourId?: {
    _id: string;
    title: string;
    image: string;
    category: string;
    dates: string;
    accommodation: string;
    departure?: string;
  };
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  numberOfTravelers: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingStatus: 'pending' | 'confirmed' | 'cancelled';
  bookingDate: string;
  specialRequests?: string;
  paymentIntentId?: string;
  documents: IDocument[];
  applicationClosed?: boolean;
  userApplicationFormSubmitted?: boolean;
  userApplicationStatus?: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [dependants, setDependants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    } else {
      setLoading(false);
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !bookingId) {
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success && data.data) {
        setBooking(data.data);
      } else {
        console.error('Failed to fetch booking:', data.error || 'Unknown error');
      }

      // Fetch dependants for this booking
      const dependantsRes = await fetch(`/api/bookings/${bookingId}/dependants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (dependantsRes.ok) {
        const dependantsData = await dependantsRes.json();
        setDependants(dependantsData.dependants || []);
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload documents');
      }

      // Refresh booking details
      await fetchBookingDetails();
      e.target.value = ''; // Reset file input
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      // Refresh booking details
      await fetchBookingDetails();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-blue border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
          <Link href="/dashboard" className="text-primary-blue hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tourData = booking.tour || booking.tourId;
  const tourImage = tourData?.images?.[0] || tourData?.image || '/placeholder-tour.jpg';
  const tourTitle = tourData?.title || 'Tour Package';
  const tourCategory = tourData?.category || 'N/A';
  const tourDates = tourData?.startDates?.[0]
    ? new Date(tourData.startDates[0]).toLocaleDateString()
    : tourData?.dates || 'N/A';
  const tourDeparture = tourData?.departure;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/dashboard" className="hover:text-primary-blue">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Booking Details</span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Booking Details</h1>
            <p className="text-gray-600">Booking ID: {booking._id.slice(-12).toUpperCase()}</p>
          </div>
          <button
            onClick={handlePrint}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors print:hidden"
          >
            Print Invoice
          </button>
        </motion.div>

        {/* Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
        >
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Payment Status</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                booking.paymentStatus
              )}`}
            >
              {booking.paymentStatus.toUpperCase()}
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-600 mb-2">Booking Status</p>
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                booking.bookingStatus
              )}`}
            >
              {booking.bookingStatus.toUpperCase()}
            </span>
          </div>
        </motion.div>

        {/* Next Steps Banner - Only show if payment is paid and application not closed */}
        {booking.paymentStatus === 'paid' && !booking.applicationClosed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-600 rounded-lg p-6 mb-6 shadow-md"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="bg-blue-600 text-white rounded-full p-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  📋 Important Next Steps
                </h3>
                <p className="text-gray-700 mb-4 font-medium">
                  Your payment has been received! To complete your booking, please complete the following:
                </p>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <p className="font-semibold text-gray-900">Fill Application Forms</p>
                      <p className="text-sm text-gray-600">Complete the visa application form for yourself and all travelers in your booking ({booking.numberOfTravelers} {booking.numberOfTravelers === 1 ? 'traveler' : 'travelers'})</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <p className="font-semibold text-gray-900">Upload Required Documents</p>
                      <p className="text-sm text-gray-600">Upload passport copies, photos, and other required documents for all travelers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <p className="font-semibold text-gray-900">Add Dependants (if applicable)</p>
                      <p className="text-sm text-gray-600">Add and complete application forms for any additional travelers or family members</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-800">
                    <span className="font-bold">⚠️ Note:</span> Your visa application cannot be processed until all forms and documents are submitted for all travelers.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Application Status & Actions - Only show if payment is paid */}
        {booking.paymentStatus === 'paid' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Application Process</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {booking.applicationClosed 
                    ? 'Application process has been closed by admin'
                    : 'Complete your visa application forms and upload required documents'}
                </p>
              </div>
              {booking.userApplicationStatus && (
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(
                    booking.userApplicationStatus === 'accepted' ? 'confirmed' : 
                    booking.userApplicationStatus === 'rejected' ? 'failed' : 
                    booking.userApplicationStatus === 'under_review' ? 'pending' : 
                    booking.userApplicationStatus
                  )}`}
                >
                  {booking.userApplicationStatus.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            
            {!booking.applicationClosed && (
              <div className="space-y-3">
                <Link
                  href={`/dashboard/bookings/${bookingId}/application`}
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                >
                  {booking.userApplicationFormSubmitted 
                    ? 'View/Edit Your Application Form' 
                    : 'Fill Your Application Form'}
                </Link>
                <Link
                  href={`/dashboard/bookings/${bookingId}/documents`}
                  className="block w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition text-center font-semibold"
                >
                  Manage Documents & Dependants
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* Tour Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md overflow-hidden mb-6"
        >
          <div className="relative h-64">
            <Image
              src={tourImage}
              alt={tourTitle}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{tourTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Category</p>
                <p className="font-semibold text-gray-900">{tourCategory}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Tour Dates</p>
                <p className="font-semibold text-gray-900">{tourDates}</p>
              </div>
              {tourDeparture && (
                <div>
                  <p className="text-gray-600 mb-1">Departure</p>
                  <p className="font-semibold text-gray-900">{tourDeparture}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Booking Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer Name</p>
              <p className="font-semibold text-gray-900">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-gray-900">{booking.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="font-semibold text-gray-900">{booking.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Number of Travelers</p>
              <p className="font-semibold text-gray-900">{booking.numberOfTravelers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Booking Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.bookingDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Booked On</p>
              <p className="font-semibold text-gray-900">
                {new Date(booking.createdAt).toLocaleDateString()}
              </p>
            </div>
            {booking.specialRequests && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                <p className="font-semibold text-gray-900">{booking.specialRequests}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal ({booking.numberOfTravelers} travelers)</span>
              <span className="font-semibold">${booking.totalAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-primary-blue">${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            {booking.paymentIntentId && (
              <div className="text-xs text-gray-500 pt-2">
                Payment ID: {booking.paymentIntentId}
              </div>
            )}
          </div>
        </motion.div>

        {/* Dependants Section - Show all dependants added to booking */}
        {booking.paymentStatus === 'paid' && dependants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 mb-6 print:hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Dependants</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {dependants.length} dependant{dependants.length !== 1 ? 's' : ''} added to this booking
                </p>
              </div>
              <Link
                href={`/dashboard/bookings/${bookingId}/documents`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Manage Dependants →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dependants.map((dep: any) => (
                <div key={dep._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{dep.name}</h4>
                      <p className="text-sm text-gray-600">{dep.relationship}</p>
                      {dep.applicationStatus && (
                        <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                          dep.applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                          dep.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          dep.applicationStatus === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                          dep.applicationStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {dep.applicationStatus.replace('_', ' ').toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/dashboard/bookings/${bookingId}/dependants/${dep._id}/application`}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      {dep.applicationFormSubmitted ? 'View' : 'Fill'} Form
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Documents Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-md p-6 mb-6 print:hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Travel Documents</h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload passports, visas, or other required documents ({booking.documents?.length || 0} uploaded)
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2">
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📎</span>
                    <span>Upload Documents</span>
                  </>
                )}
              </div>
            </label>
          </div>

          {uploadError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {uploadError}
            </div>
          )}

          {booking.documents && booking.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.documents.map((doc) => (
                <div
                  key={doc._id || doc.publicId}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteDocument(doc._id || doc.publicId)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-5xl mb-3">📂</div>
              <p>No documents uploaded yet</p>
              <p className="text-sm mt-1">Upload your travel documents to keep them organized</p>
            </div>
          )}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 print:hidden"
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-orange transition-colors font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
