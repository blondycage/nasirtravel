'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  ChevronsLeft,
  ChevronsRight,
  FileCheck2,
  Globe2,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Plane,
  Star,
  Users,
  X,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/admin', icon: BarChart3 },
  { label: 'Bookings', href: '/admin/bookings', icon: CalendarClock },
  { label: 'Quotations', href: '/admin/bookings?filter=quotes', icon: FileCheck2 },
  { label: 'Packages', href: '/admin/tours', icon: Plane },
  { label: 'Applications', href: '/admin/applications', icon: BookOpen },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Hajj Interest', href: '/admin/hajj-interest', icon: MessageSquareText },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentSearch, setCurrentSearch] = useState('');

  useEffect(() => {
    setSidebarOpen(false);
    setCurrentSearch(window.location.search);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const renderSidebar = (isMobile = false) => (
    <aside className={`flex h-full flex-col bg-slate-950 text-white transition-all duration-200 ${!isMobile && sidebarCollapsed ? 'w-20' : 'w-72'}`}>
      <div className={`flex h-16 items-center border-b border-white/10 px-4 ${!isMobile && sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <Link
          href="/admin"
          className={`min-w-0 items-center gap-3 ${!isMobile && sidebarCollapsed ? 'hidden' : 'flex'}`}
          title="Naasir Travel Admin"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600">
            <Globe2 className="h-5 w-5" />
          </div>
          <div className={`min-w-0 ${!isMobile && sidebarCollapsed ? 'hidden' : ''}`}>
            <p className="text-sm font-semibold leading-tight">Naasir Travel</p>
            <p className="text-xs text-slate-400">Admin Console</p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => setSidebarCollapsed((current) => !current)}
          className="hidden rounded-md p-2 text-slate-300 hover:bg-white/10 lg:inline-flex"
          aria-label={sidebarCollapsed ? 'Expand admin navigation' : 'Collapse admin navigation'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronsRight className="h-5 w-5" /> : <ChevronsLeft className="h-5 w-5" />}
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded-md p-2 text-slate-300 hover:bg-white/10 lg:hidden"
          aria-label="Close admin navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const itemBaseHref = item.href.split('?')[0];
          const itemSearch = item.href.includes('?') ? `?${item.href.split('?')[1]}` : '';
          const isQuotesRoute = pathname === '/admin/bookings' && currentSearch.includes('filter=quotes');
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : item.href.includes('filter=quotes')
                ? isQuotesRoute
                : item.href === '/admin/bookings'
                  ? pathname.startsWith('/admin/bookings') && !isQuotesRoute
                  : pathname.startsWith(itemBaseHref);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                setCurrentSearch(itemSearch);
                setSidebarOpen(false);
              }}
              className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${!isMobile && sidebarCollapsed ? 'justify-center' : 'gap-3'} ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
              title={item.label}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className={!isMobile && sidebarCollapsed ? 'sr-only' : ''}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          className={`mb-2 flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white ${!isMobile && sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          title="View Website"
        >
          <Home className="h-4 w-4 shrink-0" />
          <span className={!isMobile && sidebarCollapsed ? 'sr-only' : ''}>View Website</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-red-200 hover:bg-red-500/15 hover:text-red-100 ${!isMobile && sidebarCollapsed ? 'justify-center' : 'gap-3'}`}
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className={!isMobile && sidebarCollapsed ? 'sr-only' : ''}>Logout</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">{renderSidebar(false)}</div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin navigation overlay"
            className="absolute inset-0 bg-slate-950/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative h-full translate-x-0 shadow-2xl transition-transform">{renderSidebar(true)}</div>
        </div>
      )}

      <div className={`transition-all duration-200 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              aria-label="Open admin navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-slate-900">Admin Console</p>
              <p className="hidden text-xs text-slate-500 sm:block">Bookings, quotations, packages, and applications</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/bookings?filter=quotes"
              onClick={() => setCurrentSearch('?filter=quotes')}
              className="hidden rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:inline-flex"
            >
              Manage Quotes
            </Link>
            <Link
              href="/admin/bookings"
              onClick={() => setCurrentSearch('')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Bookings
            </Link>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
