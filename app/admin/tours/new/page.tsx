'use client';

import TourForm from '@/components/TourForm';

export default function NewTourPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Tour</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <TourForm />
      </div>
    </div>
  );
}
