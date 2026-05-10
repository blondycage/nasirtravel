'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, RefreshCw, ArrowLeft, Wrench } from 'lucide-react';

interface Summary {
  bookingsWithReferralCode: number;
  referralRecordsCreated: number;
  orphanCount: number;
  mismatchCount: number;
  unlinkCount: number;
  matchRate: string;
}

interface OrphanBooking {
  _id: string;
  customerName: string;
  referralCode: string;
  totalAmount: number;
  bookingDate: string;
  paymentStatus: string;
  bookingStatus: string;
  tour?: { title: string };
}

interface MismatchReferral {
  _id: string;
  status: string;
  rewardAmount: number;
  referralCode: string;
  referrer: { name: string; email: string };
  booking: {
    _id: string;
    customerName: string;
    totalAmount: number;
    paymentStatus: string;
    bookingStatus: string;
  };
}

interface UnlinkedBooking {
  _id: string;
  customerName: string;
  referralCode: string;
  totalAmount: number;
}

interface ReconcileData {
  summary: Summary;
  orphans: OrphanBooking[];
  mismatches: MismatchReferral[];
  unlinked: UnlinkedBooking[];
}

const STATUS_COLOR: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-red-100 text-red-700',
};

export default function ReconcilePage() {
  const [data, setData] = useState<ReconcileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState<string | null>(null);
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/referrals/reconcile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load reconciliation data');
      const json = await res.json();
      setData(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fixOrphan = async (bookingId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setFixing(bookingId);
    try {
      const res = await fetch('/api/admin/referrals/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setFixedIds(prev => new Set([...prev, bookingId]));
    } catch (e: any) {
      alert(`Fix failed: ${e.message}`);
    } finally {
      setFixing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-[#1E40AF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const { summary, orphans, mismatches, unlinked } = data;
  const isClean = summary.orphanCount === 0 && summary.mismatchCount === 0 && summary.unlinkCount === 0;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/referrals"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Referrals
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Reconciliation</h1>
          <p className="text-gray-500 text-sm mt-1">
            Audit referral records against bookings to detect and fix discrepancies
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div className={`rounded-xl p-5 border ${isClean ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center gap-2 mb-4">
          {isClean
            ? <CheckCircle className="w-5 h-5 text-green-600" />
            : <AlertTriangle className="w-5 h-5 text-amber-600" />}
          <span className={`font-semibold ${isClean ? 'text-green-800' : 'text-amber-800'}`}>
            {isClean ? 'All records reconciled — no issues found' : 'Issues detected — review required'}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Bookings with referral code</p>
            <p className="font-bold text-gray-900 text-lg">{summary.bookingsWithReferralCode}</p>
          </div>
          <div>
            <p className="text-gray-500">Referral records created</p>
            <p className="font-bold text-gray-900 text-lg">{summary.referralRecordsCreated}</p>
          </div>
          <div>
            <p className="text-gray-500">Match rate</p>
            <p className={`font-bold text-lg ${summary.matchRate === '100.0%' ? 'text-green-600' : 'text-amber-600'}`}>
              {summary.matchRate}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Orphaned codes</p>
            <p className={`font-bold text-lg ${summary.orphanCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {summary.orphanCount}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Status mismatches</p>
            <p className={`font-bold text-lg ${summary.mismatchCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {summary.mismatchCount}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Missing back-links</p>
            <p className={`font-bold text-lg ${summary.unlinkCount > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {summary.unlinkCount}
            </p>
          </div>
        </div>
      </div>

      {/* Orphans */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-1">
          Orphaned Referral Codes
          <span className="ml-2 text-xs font-normal text-gray-400">
            — bookings that used a code but have no Referral record
          </span>
        </h2>

        {orphans.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">None — all clear ✓</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Package</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Code Used</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Booking</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orphans.map(b => {
                  const isFixed = fixedIds.has(b._id);
                  return (
                    <tr key={b._id} className={isFixed ? 'bg-green-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 font-medium text-gray-800">{b.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{(b as any).tour?.title || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{b.referralCode}</td>
                      <td className="px-4 py-3 font-semibold">CA${b.totalAmount?.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[b.bookingStatus] || ''}`}>
                          {b.bookingStatus}
                        </span>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[b.paymentStatus] || ''}`}>
                          {b.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isFixed ? (
                          <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Fixed
                          </span>
                        ) : (
                          <button
                            onClick={() => fixOrphan(b._id)}
                            disabled={fixing === b._id || b.paymentStatus !== 'paid'}
                            title={b.paymentStatus !== 'paid' ? 'Only fix paid bookings' : ''}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#1E40AF] text-white rounded-lg hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Wrench className="w-3 h-3" />
                            {fixing === b._id ? 'Fixing…' : 'Create Referral'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Mismatches */}
      <section>
        <h2 className="font-semibold text-gray-800 mb-1">
          Status Mismatches
          <span className="ml-2 text-xs font-normal text-gray-400">
            — active referral rewards on cancelled or refunded bookings
          </span>
        </h2>

        {mismatches.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">None — all clear ✓</p>
        ) : (
          <div className="bg-white rounded-xl border border-red-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-red-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Referrer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Referral Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Booking Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Reward</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-50">
                {mismatches.map(r => (
                  <tr key={r._id} className="hover:bg-red-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.referrer?.name}</p>
                      <p className="text-gray-400 text-xs">{r.referrer?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {(r.booking as any)?.customerName || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[(r.booking as any)?.bookingStatus] || ''}`}>
                        {(r.booking as any)?.bookingStatus}
                      </span>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[(r.booking as any)?.paymentStatus] || ''}`}>
                        {(r.booking as any)?.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      CA${r.rewardAmount?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href="/admin/referrals"
                        className="text-xs text-[#1E40AF] hover:underline"
                      >
                        Review in Referrals →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Unlinked back-pointers */}
      {unlinked.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-800 mb-1">
            Missing Back-Links
            <span className="ml-2 text-xs font-normal text-gray-400">
              — bookings with a Referral record but no back-pointer (pre-feature data)
            </span>
          </h2>
          <div className="bg-white rounded-xl border border-amber-100 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-amber-50 border-b border-amber-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Code</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {unlinked.map(b => (
                  <tr key={b._id}>
                    <td className="px-4 py-3 text-gray-800">{b.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs">{b.referralCode}</td>
                    <td className="px-4 py-3">CA${b.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      Referral record exists — back-pointer missing. Cosmetic only, data is intact.
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
