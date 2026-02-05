'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import UserForm from '@/components/admin/UserForm';

export default function AdminCreateUserPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleCreateUser = async (data: any) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create user');
    }

    // Success - redirect to users list
    router.push('/admin/users');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="text-blue-600 hover:text-blue-700">
              ← Back to Users
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <UserForm
          mode="create"
          onSubmit={handleCreateUser}
          onCancel={() => router.push('/admin/users')}
        />
      </main>
    </div>
  );
}
