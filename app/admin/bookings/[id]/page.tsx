'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
  _id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface Dependant {
  _id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  passportNumber?: string;
  travelerType?: 'adult' | 'child' | 'infant';
  applicationNumber?: string;
  applicationFormSubmitted?: boolean;
  applicationStatus?: 'pending' | 'submitted' | 'under_review' | 'accepted' | 'rejected' | 'needs_revision';
  documents: Document[];
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = Array.isArray(params.id) ? params.id[0] : (params.id as string);

  const [booking, setBooking] = useState<any>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    adultPrice: '',
    childPrice: '',
    infantPrice: '',
    quoteExpiresAt: '',
    quoteNotes: '',
  });

  useEffect(() => {
    fetchData();
  }, [bookingId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch booking
      const bookingRes = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!bookingRes.ok) {
        const errorData = await bookingRes.json();
        throw new Error(errorData.error || 'Failed to fetch booking');
      }
      const bookingData = await bookingRes.json();
      if (bookingData.success) {
        setBooking(bookingData.data);
      } else {
        throw new Error(bookingData.error || 'Booking not found');
      }

      // Fetch dependants
      const dependantsRes = await fetch(`/api/bookings/${bookingId}/dependants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dependantsRes.ok) {
        const dependantsData = await dependantsRes.json();
        setDependants(dependantsData.dependants);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (field: 'bookingStatus' | 'paymentStatus', value: string) => {
    setUpdating(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status');
      }

      if (data.success) {
        setBooking(data.data);
        setSuccessMessage(`${field === 'bookingStatus' ? 'Booking' : 'Payment'} status updated successfully!`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const sendQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/admin/bookings/${bookingId}/quote`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quoteForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send quote');
      }

      setBooking(data.data);
      setSuccessMessage('Quote sent successfully.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setQuoteLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTravelerBreakdown = () => {
    const total = Number(booking?.numberOfTravelers || 1);
    const hasBreakdown =
      booking?.adultTravelers !== undefined ||
      booking?.childTravelers !== undefined ||
      booking?.infantTravelers !== undefined;

    return {
      adultTravelers: hasBreakdown ? Number(booking?.adultTravelers || 0) : total,
      childTravelers: Number(booking?.childTravelers || 0),
      infantTravelers: Number(booking?.infantTravelers || 0),
      total,
    };
  };

  const calculateQuotePreview = () => {
    const breakdown = getTravelerBreakdown();
    const adultPrice = Number(quoteForm.adultPrice || 0);
    const childPrice = Number(quoteForm.childPrice || 0);
    const infantPrice = Number(quoteForm.infantPrice || 0);

    return {
      adultTotal: breakdown.adultTravelers * adultPrice,
      childTotal: breakdown.childTravelers * childPrice,
      infantTotal: breakdown.infantTravelers * infantPrice,
      total:
        breakdown.adultTravelers * adultPrice +
        breakdown.childTravelers * childPrice +
        breakdown.infantTravelers * infantPrice,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Booking Not Found</h2>
          <Link href="/admin/bookings" className="text-blue-600 hover:underline">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const travelerBreakdown = getTravelerBreakdown();
  const quotePreview = calculateQuotePreview();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-700">
              ← Back to Bookings
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Booking Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Booking Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Customer Name</p>
              <p className="font-medium">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{booking.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{booking.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Travelers</p>
              <p className="font-medium">{booking.numberOfTravelers}</p>
              <p className="text-xs text-gray-500">
                Adults: {travelerBreakdown.adultTravelers} | Children: {travelerBreakdown.childTravelers} | Infants: {travelerBreakdown.infantTravelers}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-green-600">CA${booking.totalAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Date</p>
              <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Payment Status</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.paymentStatus)}`}>
                  {booking.paymentStatus}
                </span>
                <select
                  value={booking.paymentStatus}
                  onChange={(e) => updateBookingStatus('paymentStatus', e.target.value)}
                  disabled={updating}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Booking Status</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.bookingStatus)}`}>
                  {booking.bookingStatus}
                </span>
                <select
                  value={booking.bookingStatus}
                  onChange={(e) => updateBookingStatus('bookingStatus', e.target.value)}
                  disabled={updating}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Special Requests</p>
              <p className="font-medium">{booking.specialRequests}</p>
            </div>
          )}
        </div>

        {/* Quote Management */}
        {booking.paymentStatus !== 'paid' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Quote Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Pricing Status</p>
                <p className="font-semibold capitalize">{booking.pricingStatus?.replace('_', ' ') || 'unpriced'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Travelers</p>
                <p className="font-semibold">{booking.numberOfTravelers}</p>
                <p className="text-xs text-gray-500">
                  Adults: {travelerBreakdown.adultTravelers}, Children: {travelerBreakdown.childTravelers}, Infants: {travelerBreakdown.infantTravelers}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Quote</p>
                <p className="font-semibold text-green-600">
                  {booking.quotedTotalAmount ? `CA$${booking.quotedTotalAmount.toLocaleString()}` : 'Not quoted'}
                </p>
              </div>
            </div>

            <form onSubmit={sendQuote} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="adultPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Adult Price (CAD) *
                </label>
                <input
                  type="number"
                  id="adultPrice"
                  min="0"
                  step="0.01"
                  required
                  value={quoteForm.adultPrice}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, adultPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="childPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Child Price (CAD)
                </label>
                <input
                  type="number"
                  id="childPrice"
                  min="0"
                  step="0.01"
                  value={quoteForm.childPrice}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, childPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="infantPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Infant Price (CAD)
                </label>
                <input
                  type="number"
                  id="infantPrice"
                  min="0"
                  step="0.01"
                  value={quoteForm.infantPrice}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, infantPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="quoteExpiresAt" className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Expires
                </label>
                <input
                  type="date"
                  id="quoteExpiresAt"
                  value={quoteForm.quoteExpiresAt}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, quoteExpiresAt: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="quoteNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Quote Notes
                </label>
                <textarea
                  id="quoteNotes"
                  rows={3}
                  value={quoteForm.quoteNotes}
                  onChange={(e) => setQuoteForm(prev => ({ ...prev, quoteNotes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes shown with the customer quote"
                />
              </div>
              <div className="md:col-span-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900 mb-2">Quote Preview</p>
                <div className="space-y-1">
                  <p>Adults: {travelerBreakdown.adultTravelers} x CA${Number(quoteForm.adultPrice || 0).toFixed(2)} = CA${quotePreview.adultTotal.toFixed(2)}</p>
                  <p>Children: {travelerBreakdown.childTravelers} x CA${Number(quoteForm.childPrice || 0).toFixed(2)} = CA${quotePreview.childTotal.toFixed(2)}</p>
                  <p>Infants: {travelerBreakdown.infantTravelers} x CA${Number(quoteForm.infantPrice || 0).toFixed(2)} = CA${quotePreview.infantTotal.toFixed(2)}</p>
                  <p className="font-bold text-gray-900 pt-1">Total: CA${quotePreview.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={quoteLoading}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {quoteLoading ? 'Sending Quote...' : 'Send Quote'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Customer Documents */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Customer Documents</h2>
          {booking.documents && booking.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {booking.documents.map((doc: Document) => (
                <div key={doc._id} className="border rounded-lg p-4">
                  <p className="font-medium mb-2">{doc.name}</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Document →
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No documents uploaded yet</p>
          )}
        </div>

        {/* Application Management Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Application Management</h2>
            {booking.applicationClosed ? (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                Closed
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                Open
              </span>
            )}
          </div>

          {/* User Application */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Applicant</h3>
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{booking.customerName}</p>
                  <p className="text-sm text-gray-600">Primary Customer</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.userApplicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                    booking.userApplicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                    booking.userApplicationStatus === 'needs_revision' ? 'bg-purple-100 text-purple-800' :
                    booking.userApplicationStatus === 'under_review' ? 'bg-orange-100 text-orange-800' :
                    booking.userApplicationStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.userApplicationStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                  </span>
                </div>
              </div>
              {booking.userApplicationFormData?.applicationNumber && (
                <p className="text-sm text-gray-600 mb-2">
                  Application #: {booking.userApplicationFormData.applicationNumber}
                </p>
              )}
              <div className="flex gap-2 mt-3">
                <Link
                  href={`/admin/applications/user/${booking._id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  {booking.userApplicationFormSubmitted ? 'Review Application' : 'View Details'}
                </Link>
              </div>
            </div>
          </div>

          {/* Dependant Applications */}
          {dependants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dependants ({dependants.length})</h3>
              <div className="space-y-3">
                {dependants.map((dependant) => (
                  <div key={dependant._id} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{dependant.name}</p>
                        <p className="text-sm text-gray-600">{dependant.relationship}</p>
                        {dependant.travelerType && (
                          <p className="text-xs text-gray-500 capitalize">{dependant.travelerType}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          dependant.applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                          dependant.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          dependant.applicationStatus === 'needs_revision' ? 'bg-purple-100 text-purple-800' :
                          dependant.applicationStatus === 'under_review' ? 'bg-orange-100 text-orange-800' :
                          dependant.applicationStatus === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {dependant.applicationStatus?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    {dependant.applicationNumber && (
                      <p className="text-sm text-gray-600 mb-2">
                        Application #: {dependant.applicationNumber}
                      </p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={`/admin/applications/dependant/${dependant._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        {dependant.applicationFormSubmitted ? 'Review Application' : 'View Details'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dependants and Their Documents */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Dependants & Documents</h2>
          {dependants.length > 0 ? (
            <div className="space-y-6">
              {dependants.map((dependant) => (
                <div key={dependant._id} className="border rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold">{dependant.name}</h3>
                    <p className="text-sm text-gray-600">Relationship: {dependant.relationship}</p>
                    {dependant.travelerType && (
                      <p className="text-sm text-gray-600 capitalize">Traveler type: {dependant.travelerType}</p>
                    )}
                    {dependant.dateOfBirth && (
                      <p className="text-sm text-gray-600">
                        DOB: {new Date(dependant.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                    {dependant.passportNumber && (
                      <p className="text-sm text-gray-600">Passport: {dependant.passportNumber}</p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium mb-2">Documents:</p>
                    {dependant.documents && dependant.documents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dependant.documents.map((doc) => (
                          <div key={doc._id} className="bg-gray-50 rounded p-3">
                            <p className="font-medium text-sm">{doc.name}</p>
                            <p className="text-xs text-gray-500 mb-2">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              View →
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No documents uploaded</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No dependants added yet</p>
          )}
        </div>
      </main>
    </div>
  );
}
