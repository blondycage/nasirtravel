'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { authFetch, useAuth } from '@/hooks/useAuth';

type Enquiry = Record<string, any> & { _id: string; reference: string; status: string; adminNotes?: string };
const label = (value: string) => value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
const displayDate = (value?: string) => value ? new Date(value).toLocaleDateString() : 'Not specified';

export default function TravelEnquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isLoading: authLoading } = useAuth({ requiredRole: 'admin' });
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [status, setStatus] = useState('new');
  const [adminNotes, setAdminNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    authFetch(`/api/admin/travel-enquiries/${id}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load enquiry');
      setEnquiry(data.enquiry); setStatus(data.enquiry.status); setAdminNotes(data.enquiry.adminNotes || '');
    }).catch((error) => setMessage(error.message)).finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const save = async () => {
    setSaving(true); setMessage('');
    try {
      const response = await authFetch(`/api/admin/travel-enquiries/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, adminNotes }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save enquiry');
      setEnquiry(data.enquiry); setMessage('Changes saved.');
    } catch (error: any) { setMessage(error.message); } finally { setSaving(false); }
  };

  if (authLoading || loading) return <div className="flex min-h-[420px] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" /></div>;
  if (!enquiry) return <div className="space-y-4"><Link href="/admin/travel-enquiries" className="text-blue-700">Back to enquiries</Link><p className="text-red-700">{message || 'Enquiry not found.'}</p></div>;

  const rows = [
    ['Name', enquiry.name], ['Email', enquiry.email], ['Phone', enquiry.phone],
    ['Services', enquiry.services?.map(label).join(', ')], ['Purpose', label(enquiry.purpose)], ['Readiness', label(enquiry.readiness)],
    ['Route', `${enquiry.origin} to ${enquiry.destination}`], ['Departure', displayDate(enquiry.departureDate)], ['Return', displayDate(enquiry.returnDate)],
    ['Travelers', `${enquiry.travelers?.adults || 0} adults, ${enquiry.travelers?.children || 0} children, ${enquiry.travelers?.infants || 0} infants`],
    ['Budget', enquiry.budget || 'Not specified'], ['Package', enquiry.packageTitleSnapshot || 'Not selected'],
  ];

  return <div className="space-y-6"><div><Link href="/admin/travel-enquiries" className="text-sm font-semibold text-blue-700">Back to enquiries</Link><h1 className="mt-3 text-3xl font-bold text-slate-950">{enquiry.reference}</h1><p className="mt-1 text-sm text-slate-500">Submitted {new Date(enquiry.createdAt).toLocaleString()}</p></div>{message && <div className="border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}<div className="grid gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-6"><section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">Request details</h2><dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">{rows.map(([term, value]) => <div key={term}><dt className="text-xs font-semibold uppercase text-slate-500">{term}</dt><dd className="mt-1 break-words text-sm text-slate-900">{value}</dd></div>)}</dl></section>{enquiry.flightPreferences && <DetailBlock title="Flight preferences" value={enquiry.flightPreferences} />}{enquiry.hotelPreferences && <DetailBlock title="Hotel preferences" value={enquiry.hotelPreferences} />}{enquiry.customRequirements && <TextBlock title="Custom requirements" text={enquiry.customRequirements} />}{enquiry.generalNotes && <TextBlock title="General notes" text={enquiry.generalNotes} />}</div><aside className="h-fit border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-bold text-slate-950">Follow-up</h2><label className="mt-4 block text-sm font-semibold text-slate-700">Status<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5"><option value="new">New</option><option value="contacted">Contacted</option><option value="quoted">Quoted</option><option value="closed">Closed</option></select></label><label className="mt-4 block text-sm font-semibold text-slate-700">Private notes<textarea value={adminNotes} onChange={(event) => setAdminNotes(event.target.value)} rows={8} maxLength={5000} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5" /></label><button type="button" onClick={save} disabled={saving} className="mt-4 w-full rounded-md bg-blue-700 px-4 py-2.5 font-semibold text-white hover:bg-blue-800 disabled:bg-slate-400">{saving ? 'Saving...' : 'Save changes'}</button></aside></div></div>;
}

function DetailBlock({ title, value }: { title: string; value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([, item]) => item !== '' && item != null && item !== false);
  if (!entries.length) return null;
  return <section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">{title}</h2><dl className="mt-4 grid gap-4 sm:grid-cols-2">{entries.map(([key, item]) => <div key={key}><dt className="text-xs font-semibold uppercase text-slate-500">{label(key)}</dt><dd className="mt-1 whitespace-pre-wrap text-sm text-slate-900">{key.toLowerCase().includes('date') || key === 'checkIn' || key === 'checkOut' ? displayDate(String(item)) : String(item)}</dd></div>)}</dl></section>;
}
function TextBlock({ title, text }: { title: string; text: string }) { return <section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-950">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{text}</p></section>; }
