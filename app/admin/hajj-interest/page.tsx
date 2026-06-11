'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, authFetch } from '@/hooks/useAuth';

interface HajjInterestDependant {
  name: string;
  phoneNumber?: string;
  email?: string;
}

interface HajjInterestRecord {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  partySize: '1' | '2' | '3' | '4+';
  packageType: 'luxury' | 'premium' | 'standard';
  accommodationType: 'non-shifting' | 'shifting';
  roomPreference: 'quad' | 'triple' | 'double';
  departurePort: string;
  planningToGo: 'yes' | 'no';
  dependants: HajjInterestDependant[];
  createdAt: string;
}

export default function AdminHajjInterestPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth({ requiredRole: 'admin' });
  const [records, setRecords] = useState<HajjInterestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecords();
    }
  }, [isAuthenticated]);

  const fetchRecords = async () => {
    try {
      const response = await authFetch('/api/admin/hajj-interest');

      if (!response.ok) {
        throw new Error('Failed to fetch Hajj interest submissions');
      }

      const data = await response.json();
      setRecords(data.interests || []);
    } catch (error) {
      console.error('Error fetching Hajj interest submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getBadgeClass = (value: string, kind: 'package' | 'accommodation' | 'planning') => {
    if (kind === 'package') {
      if (value === 'luxury') return 'bg-amber-100 text-amber-800';
      if (value === 'premium') return 'bg-blue-100 text-blue-800';
      return 'bg-slate-100 text-slate-800';
    }

    if (kind === 'accommodation') {
      return value === 'shifting' ? 'bg-fuchsia-100 text-fuchsia-800' : 'bg-cyan-100 text-cyan-800';
    }

    if (kind === 'planning') {
      return value === 'yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800';
    }

    return 'bg-gray-100 text-gray-800';
  };

  const partySizeLabels: Record<HajjInterestRecord['partySize'], string> = {
    '1': '1 Person (Alone)',
    '2': '2 Persons (With my Spouse and/or other family member)',
    '3': '3 Persons (With my Spouse and/or Multiple Family members)',
    '4+': '4 or more Family Members',
  };

  const roomPreferenceLabels: Record<HajjInterestRecord['roomPreference'], string> = {
    quad: 'Quad Occupancy',
    triple: 'Triple Occupancy',
    double: 'Double Occupancy',
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="font-medium text-blue-600 transition hover:text-blue-800">
            ← Dashboard
          </Link>
          <span className="text-gray-300">|</span>
          <span className="font-semibold text-gray-700">Hajj Interest</span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Hajj Interest Submissions</h1>
        <p className="text-sm text-gray-600 sm:text-base">
          View preliminary Hajj registration submissions and dependant details.
        </p>
      </div>

      {records.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="mb-4 text-6xl">🕋</div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No submissions found</h3>
          <p className="text-gray-600">No Hajj interest forms have been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map(record => (
            <div key={record._id} className="rounded-lg bg-white p-6 shadow transition hover:shadow-md">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900">
                      {record.firstName} {record.lastName}
                    </h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${getBadgeClass(record.packageType, 'package')}`}>
                      {record.packageType.toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getBadgeClass(
                        record.accommodationType,
                        'accommodation'
                      )}`}
                    >
                      {record.accommodationType.toUpperCase()}
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${getBadgeClass(
                        record.planningToGo,
                        'planning'
                      )}`}
                    >
                      {record.planningToGo === 'yes' ? 'PLANNING TO GO' : 'NOT PLANNING'}
                    </span>
                  </div>

                  <div className="grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <p>
                      <strong>Email:</strong> {record.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {record.phoneNumber}
                    </p>
                    <p>
                      <strong>Party Size:</strong> {partySizeLabels[record.partySize]}
                    </p>
                    <p>
                      <strong>Room Preference:</strong> {roomPreferenceLabels[record.roomPreference]}
                    </p>
                    <p>
                      <strong>Port of Departure:</strong> {record.departurePort}
                    </p>
                    <p>
                      <strong>Submitted:</strong> {formatDate(record.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {record.dependants.length > 0 && (
                <div className="mt-5 rounded-2xl bg-gray-50 p-4">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-700">
                    Dependants
                  </h4>
                  <div className="space-y-3">
                    {record.dependants.map((dependant, index) => (
                      <div key={`${record._id}-${index}`} className="rounded-xl bg-white p-4 shadow-sm">
                        <p className="font-semibold text-gray-900">
                          {index + 1}. {dependant.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {dependant.phoneNumber ? `Phone: ${dependant.phoneNumber}` : ''}
                          {dependant.phoneNumber && dependant.email ? ' | ' : ''}
                          {dependant.email ? `Email: ${dependant.email}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
