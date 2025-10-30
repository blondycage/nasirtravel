'use client';

import Link from 'next/link';
import TourForm from '@/components/TourForm';

export default function NewTourPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/tours" className="text-blue-600 hover:text-blue-700">
              ← Back to Tours
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New Tour</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <TourForm />
        </div>
      </main>
    </div>
  );
}
