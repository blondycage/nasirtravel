'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Users,
  FileText,
  Star,
  Gift,
  Globe,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard',    path: '/admin',              icon: LayoutDashboard },
  { label: 'Tours',        path: '/admin/tours',         icon: Map },
  { label: 'Bookings',     path: '/admin/bookings',      icon: CalendarCheck },
  { label: 'Users',        path: '/admin/users',         icon: Users },
  { label: 'Applications', path: '/admin/applications',  icon: FileText },
  { label: 'Reviews',      path: '/admin/reviews',       icon: Star },
  { label: 'Referrals',    path: '/admin/referrals',     icon: Gift },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token');
      if (!token) { router.push('/login'); return; }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { router.push('/login'); return; }
        const data = await res.json();
        if (data.data?.role !== 'admin') { router.push('/'); return; }
        setUser({ name: data.data.name, email: data.data.email });
      } catch {
        router.push('/login');
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [router]);

  const logout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Active check — exact for /admin, prefix for everything else
  const isActive = (path: string) =>
    path === '/admin' ? pathname === '/admin' : pathname.startsWith(path);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1E40AF]" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 flex flex-col transform transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #1e3a8a 0%, #1E40AF 100%)' }}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Globe className="w-5 h-5 text-orange-300" />
              <span className="text-white font-bold text-lg">NaasirTravel</span>
            </div>
            <span className="text-blue-200 text-xs">Admin Panel</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, path, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={path}
                href={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-white text-[#1E40AF] shadow-sm'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#1E40AF]' : 'text-blue-200 group-hover:text-white'}`} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="w-3.5 h-3.5 text-[#1E40AF]" />}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="mb-3 px-2">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition"
            >
              <Globe className="w-3.5 h-3.5" /> View Site
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/80 text-white text-xs font-medium hover:bg-red-500 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="flex-shrink-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-gray-400 hidden sm:block">Admin</span>
              <span className="text-gray-300 hidden sm:block">/</span>
              <span className="font-semibold text-gray-800 truncate">
                {NAV_ITEMS.find(n => isActive(n.path))?.label ?? 'Admin'}
              </span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <span className="hidden md:block text-sm text-gray-500">{user?.name}</span>
              <div className="w-8 h-8 rounded-full bg-[#1E40AF] flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
