'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileCheck2, Search } from 'lucide-react';

interface Booking {
  _id: string;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
  numberOfTravelers?: number;
  pricingStatus?: 'unpriced' | 'quote_requested' | 'quoted' | 'accepted' | 'payment_pending' | 'paid' | 'expired';
  paymentStatus: string;
  bookingStatus: string;
  totalAmount: number;
  quotedTotalAmount?: number;
  documents: any[];
}

type BookingFilter = 'all' | 'quotes' | 'sent' | 'payment' | 'paid';

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<BookingFilter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('filter') === 'quotes') {
      setFilter('quotes');
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/admin/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings || data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPricingBadge = (status?: string) => {
    const colors: any = {
      unpriced: 'bg-slate-100 text-slate-700',
      quote_requested: 'bg-amber-100 text-amber-800',
      quoted: 'bg-blue-100 text-blue-800',
      accepted: 'bg-indigo-100 text-indigo-800',
      payment_pending: 'bg-purple-100 text-purple-800',
      paid: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
    };
    return colors[status || 'unpriced'] || colors.unpriced;
  };

  const matchesFilter = (booking: Booking) => {
    if (filter === 'all') return true;
    if (filter === 'quotes') return ['unpriced', 'quote_requested'].includes(booking.pricingStatus || 'unpriced');
    if (filter === 'sent') return ['quoted', 'accepted'].includes(booking.pricingStatus || '');
    if (filter === 'payment') return booking.pricingStatus === 'payment_pending' || booking.paymentStatus === 'pending';
    if (filter === 'paid') return booking.paymentStatus === 'paid';
    return true;
  };

  const matchesSearch = (booking: Booking) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [booking.customerName, booking.customerEmail, booking._id]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  };

  const filteredBookings = bookings.filter((booking) => matchesFilter(booking) && matchesSearch(booking));
  const quoteQueueCount = bookings.filter((booking) =>
    ['unpriced', 'quote_requested'].includes(booking.pricingStatus || 'unpriced')
  ).length;

  const filterTabs: Array<{ value: BookingFilter; label: string; count: number }> = [
    { value: 'all', label: 'All', count: bookings.length },
    { value: 'quotes', label: 'Needs Quote', count: quoteQueueCount },
    { value: 'sent', label: 'Quote Sent', count: bookings.filter((b) => ['quoted', 'accepted'].includes(b.pricingStatus || '')).length },
    { value: 'payment', label: 'Pending Payment', count: bookings.filter((b) => b.pricingStatus === 'payment_pending' || b.paymentStatus === 'pending').length },
    { value: 'paid', label: 'Paid', count: bookings.filter((b) => b.paymentStatus === 'paid').length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Booking Operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Bookings & Quotations</h1>
          <p className="mt-2 text-sm text-slate-600">
            Filter requests by quote state, open customer bookings, and send final pricing quickly.
          </p>
        </div>
        <Link
          href="/admin/bookings?filter=quotes"
          onClick={() => setFilter('quotes')}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <FileCheck2 className="h-4 w-4" />
          Quotation Queue ({quoteQueueCount})
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  filter === tab.value
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
                <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${filter === tab.value ? 'bg-white/20' : 'bg-white'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
          <div className="relative w-full xl:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, booking ID"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      <div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No bookings found for this view.</p>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[1050px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Booking Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quote
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Documents
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-xs text-gray-500">{booking.numberOfTravelers || 0} traveler(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{booking.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        CA${(booking.quotedTotalAmount || booking.totalAmount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPricingBadge(booking.pricingStatus)}`}>
                        {(booking.pricingStatus || 'unpriced').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.paymentStatus)}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(booking.bookingStatus)}`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {booking.documents?.length || 0} docs
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/bookings/${booking._id}`}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
                      >
                        Manage
                      </Link>
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
