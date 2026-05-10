'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const STORAGE_KEY = 'nt_ref';
const EXPIRY_DAYS = 30;

export default function ReferralCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (!ref) return;

    const code = ref.trim().toUpperCase();
    // Format: NAAS- + 3 letters + 5 alphanumeric (base-36)
    if (!/^NAAS-[A-Z]{3}[A-Z0-9]{5}$/.test(code)) return;

    const expiry = Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code, expiry }));
  }, [searchParams]);

  return null;
}

export function getReferralCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const { code, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return code;
  } catch {
    return null;
  }
}

export function clearReferralCode() {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}
