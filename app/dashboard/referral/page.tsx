'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Gift, TrendingUp, Clock, DollarSign, Share2 } from 'lucide-react';

interface Stats {
  totalReferrals: number;
  pending: number;
  confirmed: number;
  paid: number;
  totalEarned: number;
  pendingEarnings: number;
  referralBalance: number;
}

interface ReferralRecord {
  _id: string;
  referred: { name: string; email: string };
  tour: { title: string; category: string };
  rewardAmount: number;
  rewardType: string;
  rewardValue: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  createdAt: string;
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Paid Out', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
};

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<ReferralRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [codeRes, statsRes, historyRes] = await Promise.all([
        fetch('/api/referral/my-code', { headers }),
        fetch('/api/referral/stats', { headers }),
        fetch('/api/referral/history', { headers }),
      ]);

      if (codeRes.ok) {
        const { data } = await codeRes.json();
        setReferralCode(data.referralCode);
        setReferralLink(data.referralLink);
      }
      if (statsRes.ok) {
        const { data } = await statsRes.json();
        setStats(data);
      }
      if (historyRes.ok) {
        const { data } = await historyRes.json();
        setHistory(data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `✈️ Book your next trip with NaasirTravel! Use my referral link and discover amazing Umrah, Hajj & worldwide tours:\n${referralLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E40AF]" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Refer & Earn</h1>
        <p className="text-gray-500 text-sm mt-1">
          Share your unique link. Earn a reward every time someone books using it.
        </p>
      </div>

      {/* Referral Link Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden shadow-sm"
        style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1E40AF 60%, #1d4ed8 100%)' }}
      >
        <div className="p-6 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Gift className="w-5 h-5 text-orange-300" />
            <span className="font-semibold">Your Referral Link</span>
          </div>
          <p className="text-blue-200 text-sm mb-4">
            Share this link — earn a reward when someone books a qualifying package.
          </p>

          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 mb-4 font-mono text-sm break-all border border-white/20">
            {referralLink}
          </div>

          <div className="flex gap-3 flex-wrap">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#1E40AF] rounded-lg font-medium text-sm hover:bg-blue-50 transition"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 transition"
            >
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </button>
          </div>
        </div>

        <div className="bg-black/20 px-6 py-3 flex items-center gap-2">
          <span className="text-blue-200 text-xs">Your code:</span>
          <span className="text-white font-mono font-bold text-sm">{referralCode}</span>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Total Referrals', value: stats.totalReferrals, color: 'text-blue-600' },
            { icon: DollarSign, label: 'Total Earned', value: `CA$${stats.totalEarned.toFixed(2)}`, color: 'text-green-600' },
            { icon: Clock, label: 'Pending Earnings', value: `CA$${stats.pendingEarnings.toFixed(2)}`, color: 'text-yellow-600' },
            { icon: Gift, label: 'Balance', value: `CA$${stats.referralBalance.toFixed(2)}`, color: 'text-purple-600' },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold text-gray-900">{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-3">How it works</h3>
        <ol className="space-y-2 text-sm text-gray-600">
          {[
            'Share your unique referral link with friends and family.',
            'They click your link and book any qualifying package on our site.',
            'Once their payment is confirmed, a reward is added to your account.',
            'Our team confirms the referral and processes your payout.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-[#F97316] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="text-xs text-gray-400 mt-3">
          Rewards vary per package. Referral links are valid for 30 days. Self-referrals are not eligible.
        </p>
      </div>

      {/* History */}
      <div>
        <h2 className="font-semibold text-gray-800 mb-3">Referral History</h2>
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Gift className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No referrals yet — share your link to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Referred User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Package</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Reward</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.map(r => (
                  <tr key={r._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{r.referred?.name || '—'}</p>
                      <p className="text-gray-400 text-xs">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">
                      {r.tour?.title || '—'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">
                      CA${r.rewardAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[r.status]?.color}`}>
                        {STATUS_CONFIG[r.status]?.label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
