'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  tourId: string;
  tourTitle: string;
  pricePerPerson: number;
}

export default function BookingForm({ tourId, tourTitle, pricePerPerson }: BookingFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    numberOfTravelers: 1,
    bookingDate: '',
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalAmount = formData.numberOfTravelers * pricePerPerson;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          ...formData,
          totalAmount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      // Redirect to payment page
      router.push(`/payment/${data.booking._id || data.data?._id}`);
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
      [name]: name === 'numberOfTravelers' ? parseInt(value) || 1 : value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Book {tourTitle}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium mb-1">
            Full Name *
          </label>
          <input
            type="text"
            id="customerName"
            name="customerName"
            required
            value={formData.customerName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium mb-1">
            Email *
          </label>
          <input
            type="email"
            id="customerEmail"
            name="customerEmail"
            required
            value={formData.customerEmail}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium mb-1">
            Phone Number *
          </label>
          <input
            type="tel"
            id="customerPhone"
            name="customerPhone"
            required
            value={formData.customerPhone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="numberOfTravelers" className="block text-sm font-medium mb-1">
            Number of Travelers *
          </label>
          <input
            type="number"
            id="numberOfTravelers"
            name="numberOfTravelers"
            required
            min="1"
            value={formData.numberOfTravelers}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="bookingDate" className="block text-sm font-medium mb-1">
            Preferred Date *
          </label>
          <input
            type="date"
            id="bookingDate"
            name="bookingDate"
            required
            value={formData.bookingDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium mb-1">
            Special Requests (Optional)
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={4}
            value={formData.specialRequests}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">Total Amount:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${totalAmount.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            ${pricePerPerson.toLocaleString()} × {formData.numberOfTravelers} traveler(s)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}
