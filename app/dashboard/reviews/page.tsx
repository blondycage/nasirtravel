'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Review {
  _id: string;
  tour: {
    _id: string;
    title: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/reviews/my-reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review._id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleUpdate = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        throw new Error('Failed to update review');
      }

      setEditingId(null);
      fetchReviews();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
        <p className="text-gray-600">Manage your tour reviews and feedback</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-gray-900">{reviews.length}</div>
          <div className="text-sm text-gray-600">Total Reviews</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-green-600">
            {reviews.filter(r => r.status === 'approved').length}
          </div>
          <div className="text-sm text-gray-600">Approved</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold text-yellow-600">
            {reviews.filter(r => r.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-600 mb-6">
            Share your experience by reviewing the tours you've taken
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {review.tour?.title || 'Unknown Tour'}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({review.rating}/5)</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Posted on {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(review.status)}`}>
                  {review.status}
                </span>
              </div>

              {editingId === review._id ? (
                <div className="space-y-4 border-t pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={editForm.rating}
                        onChange={(e) => setEditForm({ ...editForm, rating: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < editForm.rating ? 'text-yellow-400 text-xl' : 'text-gray-300 text-xl'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comment
                    </label>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(review._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(review)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
