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
  documents: Document[];
}

export default function BookingDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<any>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [showAddDependant, setShowAddDependant] = useState(false);
  const [newDependant, setNewDependant] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    passportNumber: ''
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

  const handleUploadUserDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    setUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      await fetchData();
      setDocumentName('');
      e.currentTarget.reset();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteUserDocument = async (docId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/bookings/${bookingId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddDependant = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/dependants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newDependant)
      });

      if (!response.ok) throw new Error('Failed to add dependant');

      setShowAddDependant(false);
      setNewDependant({ name: '', relationship: '', dateOfBirth: '', passportNumber: '' });
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUploadDependantDocument = async (dependantId: string, formData: FormData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dependants/${dependantId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDependantDocument = async (dependantId: string, docId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/dependants/${dependantId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteDependant = async (dependantId: string) => {
    if (!confirm('Delete this dependant and all their documents?')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/dependants/${dependantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking || booking.bookingStatus !== 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Booking Not Confirmed</h2>
          <p className="text-gray-600 mb-4">Documents can only be uploaded for confirmed bookings</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold mt-2">Manage Documents</h1>
          <p className="text-gray-600">Booking ID: {bookingId}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* User Documents Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Your Documents</h2>

          <form onSubmit={handleUploadUserDocument} className="mb-4">
            <div className="space-y-3">
              <input
                type="text"
                name="name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="Document name (e.g., Passport, Visa)"
                required
                className="w-full px-4 py-2 border rounded"
              />
              <input
                type="file"
                name="file"
                accept="image/*,.pdf"
                required
                className="w-full px-4 py-2 border rounded"
              />
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>

          <div className="space-y-2">
            {booking.documents && booking.documents.length > 0 ? (
              booking.documents.map((doc: Document) => (
                <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDeleteUserDocument(doc._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
            )}
          </div>
        </div>

        {/* Dependants Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Dependants</h2>
            <button
              onClick={() => setShowAddDependant(true)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Dependant
            </button>
          </div>

          {showAddDependant && (
            <form onSubmit={handleAddDependant} className="mb-6 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-3">Add New Dependant</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  value={newDependant.name}
                  onChange={(e) => setNewDependant({...newDependant, name: e.target.value})}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Spouse, Child)"
                  required
                  value={newDependant.relationship}
                  onChange={(e) => setNewDependant({...newDependant, relationship: e.target.value})}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={newDependant.dateOfBirth}
                  onChange={(e) => setNewDependant({...newDependant, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Passport Number (Optional)"
                  value={newDependant.passportNumber}
                  onChange={(e) => setNewDependant({...newDependant, passportNumber: e.target.value})}
                  className="w-full px-4 py-2 border rounded"
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddDependant(false)}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}

          {dependants.length > 0 ? (
            <div className="space-y-4">
              {dependants.map((dependant) => (
                <DependantCard
                  key={dependant._id}
                  dependant={dependant}
                  onUploadDocument={handleUploadDependantDocument}
                  onDeleteDocument={handleDeleteDependantDocument}
                  onDelete={handleDeleteDependant}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No dependants added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DependantCard({
  dependant,
  onUploadDocument,
  onDeleteDocument,
  onDelete
}: {
  dependant: Dependant;
  onUploadDocument: (id: string, formData: FormData) => void;
  onDeleteDocument: (depId: string, docId: string) => void;
  onDelete: (id: string) => void;
}) {
  const [docName, setDocName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onUploadDocument(dependant._id, formData);
    setDocName('');
    e.currentTarget.reset();
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold">{dependant.name}</h3>
          <p className="text-sm text-gray-600">{dependant.relationship}</p>
        </div>
        <button
          onClick={() => onDelete(dependant._id)}
          className="text-red-600 hover:underline text-sm"
        >
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            name="name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            placeholder="Document name"
            required
            className="flex-1 px-3 py-1 border rounded text-sm"
          />
          <input
            type="file"
            name="file"
            accept="image/*,.pdf"
            required
            className="flex-1 px-3 py-1 border rounded text-sm"
          />
          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
            Upload
          </button>
        </div>
      </form>

      <div className="space-y-1">
        {dependant.documents && dependant.documents.length > 0 ? (
          dependant.documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span>{doc.name}</span>
              <div className="flex gap-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
                <button
                  onClick={() => onDeleteDocument(dependant._id, doc._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No documents</p>
        )}
      </div>
    </div>
  );
}
