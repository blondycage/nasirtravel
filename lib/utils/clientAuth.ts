/**
 * Client-side authentication utilities
 * Handles token validation and automatic redirect on expiration
 */

export interface DecodedToken {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (client-side)
 * Only use this to check expiration, never for security decisions
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

/**
 * Get token from localStorage and validate it
 * Returns null if token is missing or expired
 * Automatically redirects to login if expired
 */
export const getValidToken = (redirectPath: string = '/login'): string | null => {
  if (typeof window === 'undefined') {
    return null; // SSR safety
  }

  const token = localStorage.getItem('token');

  if (!token) {
    window.location.href = redirectPath;
    return null;
  }

  if (isTokenExpired(token)) {
    // Clear expired token
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Redirect to login
    window.location.href = redirectPath;
    return null;
  }

  return token;
};

/**
 * Check token validity and redirect if needed
 * Use this in useEffect hooks
 */
export const checkAuthAndRedirect = (redirectPath: string = '/login'): boolean => {
  const token = getValidToken(redirectPath);
  return token !== null;
};

/**
 * Handle API response for 401 errors (unauthorized/expired token)
 */
export const handleUnauthorizedResponse = (status: number, redirectPath: string = '/login'): void => {
  if (status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = redirectPath;
  }
};
