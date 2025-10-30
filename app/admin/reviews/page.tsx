'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Review {
  _id: string;
  tour: {
    _id: string;
    title: string;
  };
  user: {
    _id: string;
    name: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

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

      const response = await fetch('/api/admin/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data.reviews);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update review status');
      }

      // Update local state
      setReviews(reviews.map(review =>
        review._id === reviewId ? { ...review, status } : review
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete review');
      }

      setReviews(reviews.filter(review => review._id !== reviewId));
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

  const filteredReviews = filter === 'all'
    ? reviews
    : reviews.filter(review => review.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-blue-600 hover:text-blue-700">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Manage Reviews</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <p className="text-3xl font-bold text-gray-700">{reviews.length}</p>
              <p className="text-sm text-gray-600">Total Reviews</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded">
              <p className="text-3xl font-bold text-yellow-600">
                {reviews.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-3xl font-bold text-green-600">
                {reviews.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-sm text-gray-600">Approved</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-3xl font-bold text-red-600">
                {reviews.filter(r => r.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded ${filter === 'approved' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded ${filter === 'rejected' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'}`}
          >
            Rejected
          </button>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{review.tour?.title || 'Unknown Tour'}</h3>
                    <p className="text-sm text-gray-600">
                      By {review.user?.name || 'Unknown User'} • {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(review.status)}`}>
                      {review.status}
                    </span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      <span className="text-sm text-gray-600 ml-1">({review.rating}/5)</span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                <div className="flex gap-2">
                  {review.status !== 'approved' && (
                    <button
                      onClick={() => handleStatusUpdate(review._id, 'approved')}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Approve
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      onClick={() => handleStatusUpdate(review._id, 'rejected')}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
