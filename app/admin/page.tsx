'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarClock,
  FileCheck2,
  MessageSquareText,
  Package,
  Plane,
  Star,
  Users,
} from 'lucide-react';

interface Stats {
  totalBookings: number;
  pendingBookings: number;
  totalTours: number;
  totalUsers: number;
  totalReviews: number;
  totalHajjInterests: number;
}

const statCards = [
  {
    label: 'Total Bookings',
    key: 'totalBookings',
    icon: CalendarClock,
    href: '/admin/bookings',
    tone: 'bg-blue-50 text-blue-700 ring-blue-100',
  },
  {
    label: 'Pending Bookings',
    key: 'pendingBookings',
    icon: FileCheck2,
    href: '/admin/bookings?filter=quotes',
    tone: 'bg-amber-50 text-amber-700 ring-amber-100',
  },
  {
    label: 'Packages',
    key: 'totalTours',
    icon: Plane,
    href: '/admin/tours',
    tone: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
  },
  {
    label: 'Users',
    key: 'totalUsers',
    icon: Users,
    href: '/admin/users',
    tone: 'bg-violet-50 text-violet-700 ring-violet-100',
  },
  {
    label: 'Reviews',
    key: 'totalReviews',
    icon: Star,
    href: '/admin/reviews',
    tone: 'bg-yellow-50 text-yellow-700 ring-yellow-100',
  },
  {
    label: 'Hajj Interest',
    key: 'totalHajjInterests',
    icon: MessageSquareText,
    href: '/admin/hajj-interest',
    tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  },
];

const operations = [
  {
    title: 'Quotation Queue',
    description: 'Review quote requests, set adult/child/infant pricing, and send customers to payment.',
    href: '/admin/bookings?filter=quotes',
    icon: FileCheck2,
    cta: 'Manage quotations',
  },
  {
    title: 'Booking Operations',
    description: 'Track booking status, traveler documents, applications, payments, and dependants.',
    href: '/admin/bookings',
    icon: CalendarClock,
    cta: 'Open bookings',
  },
  {
    title: 'Package Inventory',
    description: 'Create and edit packages, publish availability, pricing guidance, and categories.',
    href: '/admin/tours',
    icon: Package,
    cta: 'Manage packages',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-sm text-slate-600">Loading admin overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Operations Overview</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Monitor booking activity, handle quote requests, and jump directly into the workflows that need attention.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/bookings?filter=quotes"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FileCheck2 className="h-4 w-4" />
            Quotation Queue
          </Link>
          <Link
            href="/admin/tours/new"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Plane className="h-4 w-4" />
            New Package
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key as keyof Stats] || 0;

          return (
            <Link
              href={card.href}
              key={card.key}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
                </div>
                <div className={`rounded-lg p-3 ring-1 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-700 opacity-0 transition group-hover:opacity-100">
                Open
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {operations.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-950">{item.title}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                {item.cta}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Recommended Daily Flow</h2>
            <p className="mt-1 text-sm text-slate-600">Start with quote requests, then paid bookings, then applications.</p>
          </div>
          <Link
            href="/admin/bookings?filter=quotes"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Start with quotations
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
