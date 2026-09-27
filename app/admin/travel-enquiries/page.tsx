'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { authFetch, useAuth } from '@/hooks/useAuth';

type Status = 'new' | 'contacted' | 'quoted' | 'closed';
type Enquiry = {
  _id: string; reference: string; name: string; email: string; phone: string; services: string[];
  packageTitleSnapshot?: string; status: Status; createdAt: string;
};

const statusClass: Record<Status, string> = {
  new: 'bg-blue-100 text-blue-800', contacted: 'bg-amber-100 text-amber-800',
  quoted: 'bg-emerald-100 text-emerald-800', closed: 'bg-slate-200 text-slate-700',
};
const label = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function TravelEnquiriesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth({ requiredRole: 'admin' });
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    authFetch('/api/admin/travel-enquiries').then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load enquiries');
      setEnquiries(data.enquiries || []);
    }).catch((fetchError) => setError(fetchError.message)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const filtered = useMemo(() => enquiries.filter((enquiry) => {
    const matchesStatus = status === 'all' || enquiry.status === status;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [enquiry.reference, enquiry.name, enquiry.email, enquiry.phone, enquiry.packageTitleSnapshot, ...enquiry.services]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  }), [enquiries, search, status]);

  if (authLoading || loading) return <div className="flex min-h-[420px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;
  return (
    <div className="space-y-6">
      <div><p className="text-sm font-semibold uppercase text-blue-700">Sales Intake</p><h1 className="mt-1 text-3xl font-bold text-slate-950">Travel Enquiries</h1><p className="mt-2 text-sm text-slate-600">Review guest requests and track each follow-up through quotation.</p></div>
      {error && <div className="border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      <div className="flex flex-col gap-3 border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">{(['all', 'new', 'contacted', 'quoted', 'closed'] as const).map((value) => <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-md px-3 py-2 text-sm font-semibold ${status === value ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>{label(value)}</button>)}</div>
        <div className="relative sm:w-80"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contact, package, reference" className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm" /></div>
      </div>
      <div className="overflow-x-auto border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[960px] w-full divide-y divide-slate-200">
          <thead className="bg-slate-50"><tr>{['Reference', 'Contact', 'Services', 'Package', 'Status', 'Submitted', ''].map((heading) => <th key={heading} className="px-5 py-3 text-left text-xs font-semibold uppercase text-slate-500">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-200">{filtered.map((enquiry) => <tr key={enquiry._id} className="hover:bg-slate-50"><td className="px-5 py-4 font-mono text-sm font-semibold">{enquiry.reference}</td><td className="px-5 py-4"><p className="font-semibold text-slate-900">{enquiry.name}</p><p className="text-sm text-slate-500">{enquiry.email}</p></td><td className="px-5 py-4 text-sm text-slate-600">{enquiry.services.map(label).join(', ')}</td><td className="max-w-56 px-5 py-4 text-sm text-slate-600">{enquiry.packageTitleSnapshot || 'Custom / none'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[enquiry.status]}`}>{label(enquiry.status)}</span></td><td className="px-5 py-4 text-sm text-slate-600">{new Date(enquiry.createdAt).toLocaleDateString()}</td><td className="px-5 py-4 text-right"><Link href={`/admin/travel-enquiries/${enquiry._id}`} className="font-semibold text-blue-700 hover:text-blue-900">Review</Link></td></tr>)}</tbody>
        </table>
        {!filtered.length && <p className="p-10 text-center text-slate-500">No enquiries found.</p>}
      </div>
    </div>
  );
}
