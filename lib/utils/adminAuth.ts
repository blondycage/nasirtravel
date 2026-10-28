import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromHeader, verifyToken } from '@/lib/utils/auth';

export function requireAdmin(request: NextRequest) {
  const token = getTokenFromHeader(request.headers.get('authorization'));
  const decoded = token ? verifyToken(token) as { role?: string } | null : null;
  if (!decoded) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (decoded.role !== 'admin') return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  return null;
}
