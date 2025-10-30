'use client';

import { useState } from 'react';

interface ReviewFormProps {
  tourId: string;
  tourTitle: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ tourId, tourTitle, onSuccess }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
    reviewerName: '',
    reviewerEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tour: tourId,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setSuccess(true);
      setFormData({
        rating: 5,
        comment: '',
        reviewerName: '',
        reviewerEmail: ''
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your review has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Write a Review</h2>
      <p className="text-gray-600 mb-6">Share your experience with {tourTitle}</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reviewerName" className="block text-sm font-medium mb-1">
            Your Name *
          </label>
          <input
            type="text"
            id="reviewerName"
            name="reviewerName"
            required
            value={formData.reviewerName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="reviewerEmail" className="block text-sm font-medium mb-1">
            Your Email *
          </label>
          <input
            type="email"
            id="reviewerEmail"
            name="reviewerEmail"
            required
            value={formData.reviewerEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium mb-1">
            Rating *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              id="rating"
              name="rating"
              min="1"
              max="5"
              value={formData.rating}
              onChange={handleChange}
              className="flex-1"
            />
            <div className="flex items-center gap-1 text-2xl">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">{formData.rating} out of 5 stars</p>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-1">
            Your Review *
          </label>
          <textarea
            id="comment"
            name="comment"
            required
            rows={6}
            value={formData.comment}
            onChange={handleChange}
            placeholder="Tell us about your experience..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
