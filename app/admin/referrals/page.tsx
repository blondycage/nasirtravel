'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Referral {
  _id: string;
  referrer: { name: string; email: string };
  referred: { name: string; email: string };
  tour: { title: string; category: string };
  booking: { totalAmount: number; bookingDate: string };
  referralCode: string;
  rewardType: string;
  rewardValue: number;
  rewardAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: string;
}

interface Totals {
  totalRewards: number;
  paidOut: number;
  pending: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid Out', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

const NEXT_ACTION: Record<string, { label: string; next: string; color: string } | null> = {
  pending: { label: 'Confirm', next: 'confirmed', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  confirmed: { label: 'Mark Paid', next: 'paid', color: 'bg-green-600 hover:bg-green-700 text-white' },
  paid: null,
  cancelled: null,
};

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/referrals?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.data);
        setTotals(data.totals);
      }
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchReferrals(); }, [fetchReferrals]);

  const updateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchReferrals();
    } finally {
      setUpdating(null);
    }
  };

  const cancelReferral = async (id: string, currentStatus: string) => {
    if (!['pending', 'confirmed'].includes(currentStatus)) return;
    if (!confirm('Cancel this referral? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setUpdating(id);
    try {
      await fetch(`/api/admin/referrals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      fetchReferrals();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track and manage all referral rewards</p>
        </div>
        <Link
          href="/admin/referrals/reconcile"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
        >
          Reconcile & Audit →
        </Link>
      </div>

      {/* Summary Cards */}
      {totals && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Total Rewards Owed</p>
            <p className="text-2xl font-bold text-gray-900">CA${totals.totalRewards.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Paid Out</p>
            <p className="text-2xl font-bold text-green-600">CA${totals.paidOut.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500">Awaiting Payout</p>
            <p className="text-2xl font-bold text-yellow-600">CA${totals.pending.toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'confirmed', 'paid', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
              statusFilter === s
                ? 'bg-[#1E40AF] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E40AF]" />
          </div>
        ) : referrals.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No referrals found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Referrer</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Referred</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Package</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Reward</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {referrals.map(r => {
                const action = NEXT_ACTION[r.status];
                return (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.referrer?.name}</p>
                      <p className="text-gray-400 text-xs">{r.referrer?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{r.referred?.name}</p>
                      <p className="text-gray-400 text-xs">{r.referred?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {r.tour?.title}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">CA${r.rewardAmount.toFixed(2)}</p>
                      <p className="text-gray-400 text-xs">
                        {r.rewardType === 'fixed' ? `$${r.rewardValue} flat` : `${r.rewardValue}%`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[r.status]?.color}`}>
                        {STATUS_CONFIG[r.status]?.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {action && (
                          <button
                            onClick={() => updateStatus(r._id, action.next)}
                            disabled={updating === r._id}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-50 ${action.color}`}
                          >
                            {updating === r._id ? '...' : action.label}
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(r.status) && (
                          <button
                            onClick={() => cancelReferral(r._id, r.status)}
                            disabled={updating === r._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
