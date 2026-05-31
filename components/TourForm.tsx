'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RichTextEditor from './RichTextEditor';

interface TourFormProps {
  tourId?: string;
  initialData?: any;
}

export default function TourForm({ tourId, initialData }: TourFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    packageType: 'standard' as 'umrah' | 'standard',
    image: '',
    departure: '',
    accommodation: '',
    dates: '',
    price: '',
    description: '',
    status: 'draft',
    inclusions: [] as string[],
    exclusions: [] as string[],
    itinerary: [] as Array<{ day: number; title: string; description: string }>
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [inclusionInput, setInclusionInput] = useState('');
  const [exclusionInput, setExclusionInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category: initialData.category || '',
        packageType: initialData.packageType || 'standard',
        image: initialData.image || '',
        departure: initialData.departure || '',
        accommodation: initialData.accommodation || '',
        dates: initialData.dates || '',
        price: initialData.price || '',
        description: initialData.description || '',
        status: initialData.status || 'draft',
        inclusions: initialData.inclusions || [],
        exclusions: initialData.exclusions || [],
        itinerary: initialData.itinerary || []
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const url = tourId ? `/api/admin/tours/${tourId}` : '/api/admin/tours';
      const method = tourId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save tour');
      }

      router.push('/admin/tours');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addItem = (field: 'inclusions' | 'exclusions', value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setFormData(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
  };

  const removeItem = (field: 'inclusions' | 'exclusions', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setFormData(prev => ({
        ...prev,
        image: data.data.url
      }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: '', description: '' }
      ]
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  const updateItineraryDay = (index: number, field: 'title' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Tour Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <input
            type="text"
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Umrah/Hajj, Adventure, Cultural"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="packageType" className="block text-sm font-medium text-gray-700 mb-1">
            Package Type *
          </label>
          <select
            id="packageType"
            name="packageType"
            required
            value={formData.packageType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">Standard Package</option>
            <option value="umrah">Umrah Package</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Determines which application form fields will be required for bookings
          </p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Price (CAD)
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="e.g., CA$4,585 - CA$5,135 (Leave empty for enquiry-only packages)"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            If left empty, users will see an &quot;Enquire&quot; button instead of payment
          </p>
        </div>

        <div>
          <label htmlFor="dates" className="block text-sm font-medium text-gray-700 mb-1">
            Dates *
          </label>
          <input
            type="text"
            id="dates"
            name="dates"
            required
            value={formData.dates}
            onChange={handleChange}
            placeholder="e.g., December 18th - January 1st"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
            Departure
          </label>
          <input
            type="text"
            id="departure"
            name="departure"
            value={formData.departure}
            onChange={handleChange}
            placeholder="e.g., Vancouver"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="accommodation" className="block text-sm font-medium text-gray-700 mb-1">
            Accommodation *
          </label>
          <input
            type="text"
            id="accommodation"
            name="accommodation"
            required
            value={formData.accommodation}
            onChange={handleChange}
            placeholder="e.g., 4* Hotels"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tour Image *
          </label>
          <div className="space-y-3">
            <div className="flex gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {uploading && (
                <span className="flex items-center text-sm text-gray-600">
                  Uploading...
                </span>
              )}
            </div>
            <input
              type="url"
              id="image"
              name="image"
              required
              value={formData.image}
              onChange={handleChange}
              placeholder="Or paste image URL"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.image && (
              <div className="mt-2">
                <img src={formData.image} alt="Preview" className="h-32 w-auto rounded border" />
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <RichTextEditor
            initialContent={formData.description}
            onChange={(html) => setFormData(prev => ({ ...prev, description: html }))}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status *
          </label>
          <select
            id="status"
            name="status"
            required
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Inclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Inclusions</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={inclusionInput}
            onChange={(e) => setInclusionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('inclusions', inclusionInput);
                setInclusionInput('');
              }
            }}
            placeholder="e.g. Roundtrip Airfare"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => { addItem('inclusions', inclusionInput); setInclusionInput(''); }}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
          >
            + Add
          </button>
        </div>
        {formData.inclusions.length > 0 && (
          <ul className="space-y-2">
            {formData.inclusions.map((item, i) => (
              <li key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span> {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem('inclusions', i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none ml-3"
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {formData.inclusions.length === 0 && (
          <p className="text-sm text-gray-400 italic">No inclusions added yet.</p>
        )}
      </div>

      {/* Exclusions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Exclusions</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={exclusionInput}
            onChange={(e) => setExclusionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addItem('exclusions', exclusionInput);
                setExclusionInput('');
              }
            }}
            placeholder="e.g. Travel Insurance"
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => { addItem('exclusions', exclusionInput); setExclusionInput(''); }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
          >
            + Add
          </button>
        </div>
        {formData.exclusions.length > 0 && (
          <ul className="space-y-2">
            {formData.exclusions.map((item, i) => (
              <li key={i} className="flex items-center justify-between bg-red-50 border border-red-200 rounded px-3 py-2">
                <span className="text-sm text-gray-800 flex items-center gap-2">
                  <span className="text-red-500 font-bold">✗</span> {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem('exclusions', i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none ml-3"
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        {formData.exclusions.length === 0 && (
          <p className="text-sm text-gray-400 italic">No exclusions added yet.</p>
        )}
      </div>

      {/* Itinerary */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Itinerary</label>
          <button
            type="button"
            onClick={addItineraryDay}
            className="bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700"
          >
            + Add Day
          </button>
        </div>
        <div className="space-y-4">
          {formData.itinerary.map((day, index) => (
            <div key={index} className="border border-gray-300 rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-medium">Day {day.day}</p>
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                value={day.title}
                onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                placeholder="Day title"
                className="w-full px-3 py-2 border border-gray-300 rounded mb-2"
              />
              <textarea
                value={day.description}
                onChange={(e) => updateItineraryDay(index, 'description', e.target.value)}
                placeholder="Day description"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : tourId ? 'Update Tour' : 'Create Tour'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
