'use client';

import { useRouter } from 'next/navigation';
import UserForm from '@/components/admin/UserForm';

export default function AdminCreateUserPage() {
  const router = useRouter();

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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New User</h1>
      <div className="max-w-2xl">
        <UserForm
          mode="create"
          onSubmit={handleCreateUser}
          onCancel={() => router.push('/admin/users')}
        />
      </div>
    </div>
  );
}
