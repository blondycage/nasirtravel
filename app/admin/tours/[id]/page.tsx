'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import TourForm from '@/components/TourForm';

export default function EditTourPage() {
  const params = useParams();
  const router = useRouter();
  const tourId = params.id as string;
  const [tourData, setTourData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTour = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch(`/api/admin/tours/${tourId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch tour');
        }

        const data = await response.json();
        setTourData(data.tour);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tourId) {
      fetchTour();
    }
  }, [tourId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading tour...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/tours" className="text-blue-600 hover:text-blue-700">
            Back to Tours
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/tours" className="text-blue-600 hover:text-blue-700">
              ← Back to Tours
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Tour</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <TourForm tourId={tourId} initialData={tourData} />
        </div>
      </main>
    </div>
  );
}
