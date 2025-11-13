'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ToastContainer, { useToast } from '@/components/Toast';

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
  const { toasts, success, error: showError, removeToast } = useToast();

  const [booking, setBooking] = useState<any>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  const [userDependantProfiles, setUserDependantProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null); // Track which document is uploading
  const [documentName, setDocumentName] = useState('');
  const [showAddDependant, setShowAddDependant] = useState(false);
  const [addingDependant, setAddingDependant] = useState(false);
  const [addMode, setAddMode] = useState<'select' | 'create'>('select'); // 'select' or 'create'
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [newDependant, setNewDependant] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    passportNumber: ''
  });

  useEffect(() => {
    fetchData();
    fetchUserDependantProfiles();
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
      setBooking(bookingData.success ? bookingData.data : bookingData.booking || bookingData);

      // Fetch dependants for this booking
      const dependantsRes = await fetch(`/api/bookings/${bookingId}/dependants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (dependantsRes.ok) {
        const dependantsData = await dependantsRes.json();
        setDependants(dependantsData.dependants || dependantsData.data?.dependants || []);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDependantProfiles = async () => {
    try {
      setLoadingProfiles(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/dependants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUserDependantProfiles(data.dependants || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch user dependant profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleUploadUserDocument = async (formData: FormData, documentType: string) => {
    const uploadId = `user_${documentType}`;
    setUploading(uploadId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/user-documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      success(`Document uploaded successfully`);
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteUserDocument = async (docId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}/user-documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document');
      }

      success('Document deleted successfully');
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete document');
    }
  };

  const handleAddDependant = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDependant(true);

    try {
      const token = localStorage.getItem('token');
      
      let requestBody: any = {};
      
      if (addMode === 'select' && selectedProfileId) {
        // Add from existing profile
        requestBody = { profileId: selectedProfileId };
      } else {
        // Create new dependant
        if (!newDependant.name || !newDependant.relationship) {
          throw new Error('Name and relationship are required');
        }
        requestBody = {
          name: newDependant.name,
          relationship: newDependant.relationship,
          dateOfBirth: newDependant.dateOfBirth || undefined,
          passportNumber: newDependant.passportNumber || undefined,
        };
      }

      const response = await fetch(`/api/bookings/${bookingId}/dependants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add dependant');
      }

      success('Dependant added successfully');
      setShowAddDependant(false);
      setAddMode('select');
      setSelectedProfileId('');
      setNewDependant({ name: '', relationship: '', dateOfBirth: '', passportNumber: '' });
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to add dependant');
    } finally {
      setAddingDependant(false);
    }
  };

  const handleCreateAndSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newDependant.name || !newDependant.relationship) {
      showError('Name and relationship are required');
      return;
    }

    setAddingDependant(true);

    try {
      const token = localStorage.getItem('token');
      
      // First create the profile
      const profileResponse = await fetch('/api/user/dependants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newDependant.name,
          relationship: newDependant.relationship,
          dateOfBirth: newDependant.dateOfBirth || undefined,
          passportNumber: newDependant.passportNumber || undefined,
        })
      });

      const profileData = await profileResponse.json();
      if (!profileResponse.ok) {
        throw new Error(profileData.error || 'Failed to create dependant profile');
      }

      // Then add to booking
      const bookingResponse = await fetch(`/api/bookings/${bookingId}/dependants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ profileId: profileData.dependant._id })
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        throw new Error(bookingData.error || 'Failed to add dependant to booking');
      }

      success('Dependant profile created and added to booking successfully');
      setShowAddDependant(false);
      setAddMode('select');
      setNewDependant({ name: '', relationship: '', dateOfBirth: '', passportNumber: '' });
      await fetchUserDependantProfiles();
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to create and add dependant');
    } finally {
      setAddingDependant(false);
    }
  };

  const handleUploadDependantDocument = async (dependantId: string, formData: FormData, documentType: string) => {
    const uploadId = `dependant_${dependantId}_${documentType}`;
    setUploading(uploadId);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dependants/${dependantId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      success('Document uploaded successfully');
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteDependantDocument = async (dependantId: string, docId: string) => {
    if (!confirm('Delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dependants/${dependantId}/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete document');
      }

      success('Document deleted successfully');
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete document');
    }
  };

  const handleDeleteDependant = async (dependantId: string) => {
    if (!confirm('Delete this dependant and all their documents?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dependants/${dependantId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete dependant');
      }

      success('Dependant deleted successfully');
      await fetchData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete dependant');
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
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (booking.paymentStatus !== 'paid') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Payment Required</h2>
          <p className="text-gray-600 mb-4">Payment must be completed before managing documents</p>
          <Link href={`/dashboard/bookings/${bookingId}`} className="text-blue-600 hover:underline">
            Back to Booking Details
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:underline">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold mt-2">Manage Documents</h1>
          <p className="text-gray-600">Booking ID: {bookingId}</p>
        </div>

        {/* User Documents Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Your Documents</h2>
              <p className="text-sm text-gray-600 mt-1">
                Upload required documents: Personal Passport Picture, International Passport, and Supporting Documents
              </p>
            </div>
            <Link
              href={`/dashboard/bookings/${bookingId}/application`}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              {booking.userApplicationFormSubmitted ? 'View Application' : 'Fill Application Form'}
            </Link>
          </div>

          {!booking.applicationClosed && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Personal Passport Picture
                  {uploading === 'user_personal_passport_picture' && (
                    <span className="ml-2 text-blue-600 text-xs">⏳ Uploading...</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading === 'user_personal_passport_picture'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('documentType', 'personal_passport_picture');
                      handleUploadUserDocument(formData, 'personal_passport_picture');
                    }
                  }}
                  className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  International Passport
                  {uploading === 'user_international_passport' && (
                    <span className="ml-2 text-blue-600 text-xs">⏳ Uploading...</span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading === 'user_international_passport'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const formData = new FormData();
                      formData.append('file', file);
                      formData.append('documentType', 'international_passport');
                      handleUploadUserDocument(formData, 'international_passport');
                    }
                  }}
                  className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Supporting Document
                  {uploading === 'user_supporting_document' && (
                    <span className="ml-2 text-blue-600 text-xs">⏳ Uploading...</span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Document name (e.g., Visa, ID Card)"
                    disabled={uploading === 'user_supporting_document'}
                    className="flex-1 px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploading === 'user_supporting_document' || !documentName}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && documentName) {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('documentType', 'supporting_document');
                        formData.append('name', documentName);
                        handleUploadUserDocument(formData, 'supporting_document');
                        setDocumentName('');
                        e.target.value = '';
                      } else if (!documentName) {
                        showError('Please enter a document name first');
                      }
                    }}
                    className="px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {booking.userPersonalPassportPicture && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">📷 Personal Passport Picture</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.userPersonalPassportPicture.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={booking.userPersonalPassportPicture.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </a>
                  {!booking.applicationClosed && (
                    <button
                      onClick={() => handleDeleteUserDocument(booking.userPersonalPassportPicture._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
            {booking.userInternationalPassport && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">🛂 International Passport</p>
                  <p className="text-sm text-gray-500">
                    {new Date(booking.userInternationalPassport.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={booking.userInternationalPassport.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View
                  </a>
                  {!booking.applicationClosed && (
                    <button
                      onClick={() => handleDeleteUserDocument(booking.userInternationalPassport._id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            )}
            {booking.userSupportingDocuments && booking.userSupportingDocuments.length > 0 && (
              booking.userSupportingDocuments.map((doc: any) => (
                <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">📄 {doc.name}</p>
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
                    {!booking.applicationClosed && (
                      <button
                        onClick={() => handleDeleteUserDocument(doc._id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {(!booking.userPersonalPassportPicture && !booking.userInternationalPassport && (!booking.userSupportingDocuments || booking.userSupportingDocuments.length === 0)) && (
              <p className="text-gray-500 text-center py-4">No documents uploaded yet</p>
            )}
          </div>
        </div>

        {/* Dependants Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Dependants</h2>
              <p className="text-sm text-gray-600 mt-1">
                {dependants.length} dependant{dependants.length !== 1 ? 's' : ''} added to this booking
              </p>
              {booking.applicationClosed && (
                <p className="text-sm text-red-600 mt-1">Application process is closed. Cannot add/remove dependants.</p>
              )}
            </div>
            {!booking.applicationClosed && (
              <button
                onClick={() => {
                  setShowAddDependant(true);
                  setAddMode('select');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                + Add Dependant
              </button>
            )}
          </div>

          {showAddDependant && (
            <div className="mb-6 p-4 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Add Dependant to Booking</h3>
                <button
                  onClick={() => {
                    setShowAddDependant(false);
                    setAddMode('select');
                    setSelectedProfileId('');
                    setNewDependant({ name: '', relationship: '', dateOfBirth: '', passportNumber: '' });
                  }}
                  disabled={addingDependant}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setAddMode('select')}
                  disabled={addingDependant}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    addMode === 'select'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } disabled:opacity-50`}
                >
                  Select Existing
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('create')}
                  disabled={addingDependant}
                  className={`px-4 py-2 rounded text-sm font-medium ${
                    addMode === 'create'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300'
                  } disabled:opacity-50`}
                >
                  Create New
                </button>
              </div>

              {addMode === 'select' ? (
                <div className="space-y-3">
                  {loadingProfiles ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto"></div>
                      <p className="text-sm text-gray-600 mt-2">Loading dependants...</p>
                    </div>
                  ) : userDependantProfiles.length > 0 ? (
                    <>
                      <label className="block text-sm font-medium mb-2">Select a Dependant</label>
                      <select
                        value={selectedProfileId}
                        onChange={(e) => setSelectedProfileId(e.target.value)}
                        disabled={addingDependant}
                        className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Select a dependant --</option>
                        {userDependantProfiles.map((profile) => (
                          <option key={profile._id} value={profile._id}>
                            {profile.name} ({profile.relationship})
                            {profile.dateOfBirth && ` - ${new Date(profile.dateOfBirth).toLocaleDateString()}`}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddDependant}
                        disabled={addingDependant || !selectedProfileId}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {addingDependant ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          'Add Selected Dependant'
                        )}
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-600">
                      <p className="mb-2">No saved dependants found.</p>
                      <p className="text-sm">Switch to "Create New" to add a dependant and save it for future use.</p>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCreateAndSaveProfile} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    required
                    disabled={addingDependant}
                    value={newDependant.name}
                    onChange={(e) => setNewDependant({...newDependant, name: e.target.value})}
                    className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    placeholder="Relationship (e.g., Spouse, Child) *"
                    required
                    disabled={addingDependant}
                    value={newDependant.relationship}
                    onChange={(e) => setNewDependant({...newDependant, relationship: e.target.value})}
                    className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    disabled={addingDependant}
                    value={newDependant.dateOfBirth}
                    onChange={(e) => setNewDependant({...newDependant, dateOfBirth: e.target.value})}
                    className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <input
                    type="text"
                    placeholder="Passport Number (Optional)"
                    disabled={addingDependant}
                    value={newDependant.passportNumber}
                    onChange={(e) => setNewDependant({...newDependant, passportNumber: e.target.value})}
                    className="w-full px-4 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={addingDependant}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addingDependant ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Creating & Adding...</span>
                        </>
                      ) : (
                        'Create & Add to Booking'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleAddDependant}
                      disabled={addingDependant || !newDependant.name || !newDependant.relationship}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Add Only (Don't Save)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {dependants.length > 0 ? (
            <div className="space-y-4">
              {dependants.map((dependant: any) => (
                <DependantCard
                  key={dependant._id}
                  dependant={dependant}
                  bookingId={bookingId}
                  applicationClosed={booking.applicationClosed}
                  onUploadDocument={handleUploadDependantDocument}
                  onDeleteDocument={handleDeleteDependantDocument}
                  onDelete={handleDeleteDependant}
                  uploading={uploading}
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
  bookingId,
  applicationClosed,
  onUploadDocument,
  onDeleteDocument,
  onDelete,
  uploading
}: {
  dependant: any;
  bookingId: string;
  applicationClosed?: boolean;
  onUploadDocument: (id: string, formData: FormData, documentType: string) => void;
  onDeleteDocument: (depId: string, docId: string) => void;
  onDelete: (id: string) => void;
  uploading: string | null;
}) {
  const [docName, setDocName] = useState('');

  const handleUpload = (documentType: string, file?: File, name?: string) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (name) formData.append('name', name);
    onUploadDocument(dependant._id, formData, documentType);
  };

  const isUploading = (docType: string) => {
    return uploading === `dependant_${dependant._id}_${docType}`;
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold">{dependant.name}</h3>
          <p className="text-sm text-gray-600">{dependant.relationship}</p>
          {dependant.applicationStatus && (
            <span className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
              dependant.applicationStatus === 'accepted' ? 'bg-green-100 text-green-800' :
              dependant.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
              dependant.applicationStatus === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {dependant.applicationStatus.replace('_', ' ').toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/bookings/${bookingId}/dependants/${dependant._id}/application`}
            className="text-blue-600 hover:underline text-sm"
          >
            {dependant.applicationFormSubmitted ? 'View Application' : 'Fill Application'}
          </Link>
          {!applicationClosed && (
            <button
              onClick={() => onDelete(dependant._id)}
              className="text-red-600 hover:underline text-sm"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {!applicationClosed && (
        <div className="mb-3 space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">
              Personal Passport Picture
              {isUploading('personal_passport_picture') && (
                <span className="ml-1 text-blue-600 text-xs">⏳</span>
              )}
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading('personal_passport_picture')}
              onChange={(e) => handleUpload('personal_passport_picture', e.target.files?.[0])}
              className="w-full px-2 py-1 border rounded text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              International Passport
              {isUploading('international_passport') && (
                <span className="ml-1 text-blue-600 text-xs">⏳</span>
              )}
            </label>
            <input
              type="file"
              accept="image/*"
              disabled={isUploading('international_passport')}
              onChange={(e) => handleUpload('international_passport', e.target.files?.[0])}
              className="w-full px-2 py-1 border rounded text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">
              Supporting Document
              {isUploading('supporting_document') && (
                <span className="ml-1 text-blue-600 text-xs">⏳</span>
              )}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="Document name"
                disabled={isUploading('supporting_document')}
                className="flex-1 px-2 py-1 border rounded text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <input
                type="file"
                accept="image/*"
                disabled={isUploading('supporting_document') || !docName}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && docName) {
                    handleUpload('supporting_document', file, docName);
                    setDocName('');
                    e.target.value = '';
                  }
                }}
                className="px-2 py-1 border rounded text-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {dependant.personalPassportPicture && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <span>📷 Personal Passport Picture</span>
            <div className="flex gap-2">
              <a href={dependant.personalPassportPicture.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View
              </a>
              {!applicationClosed && (
                <button
                  onClick={() => onDeleteDocument(dependant._id, dependant.personalPassportPicture._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
        {dependant.internationalPassport && (
          <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <span>🛂 International Passport</span>
            <div className="flex gap-2">
              <a href={dependant.internationalPassport.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View
              </a>
              {!applicationClosed && (
                <button
                  onClick={() => onDeleteDocument(dependant._id, dependant.internationalPassport._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
        {dependant.supportingDocuments && dependant.supportingDocuments.length > 0 && (
          dependant.supportingDocuments.map((doc: any) => (
            <div key={doc._id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
              <span>📄 {doc.name}</span>
              <div className="flex gap-2">
                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View
                </a>
                {!applicationClosed && (
                  <button
                    onClick={() => onDeleteDocument(dependant._id, doc._id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        {(!dependant.personalPassportPicture && !dependant.internationalPassport && (!dependant.supportingDocuments || dependant.supportingDocuments.length === 0)) && (
          <p className="text-gray-500 text-sm">No documents uploaded</p>
        )}
      </div>
    </div>
  );
}
