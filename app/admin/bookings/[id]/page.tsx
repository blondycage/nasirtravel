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
  documents: Document[];
}

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      if (!bookingRes.ok) throw new Error('Failed to fetch booking');
      const bookingData = await bookingRes.json();
      setBooking(bookingData.booking);

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
              <p className="text-sm text-gray-600">Number of Travelers</p>
              <p className="font-medium">{booking.numberOfTravelers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-medium text-green-600">${(booking.totalAmount / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Date</p>
              <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="font-medium">{booking.paymentStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Booking Status</p>
              <p className="font-medium">{booking.bookingStatus}</p>
            </div>
          </div>
          {booking.specialRequests && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Special Requests</p>
              <p className="font-medium">{booking.specialRequests}</p>
            </div>
          )}
        </div>

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
