import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeToken, getValidToken, handleUnauthorizedResponse } from '@/lib/utils/clientAuth';

interface UseAuthOptions {
  redirectTo?: string;
  requiredRole?: 'admin' | 'user';
}

/**
 * Hook to protect routes and check authentication
 * Automatically redirects to login if token is expired or missing
 */
export const useAuth = (options: UseAuthOptions = {}) => {
  const { redirectTo = '/login', requiredRole } = options;
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getValidToken(redirectTo);

    if (!token) {
      setIsLoading(false);
      return;
    }

    const decodedToken = decodeToken(token);
    const expiresInMs = decodedToken ? Math.max(0, decodedToken.exp * 1000 - Date.now()) : 0;
    const expiryTimer = window.setTimeout(() => {
      handleUnauthorizedResponse(401, redirectTo);
    }, expiresInMs);

    const verifyRole = async () => {
      if (requiredRole) {
        try {
          const response = await fetch('/api/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.status === 401) {
            handleUnauthorizedResponse(401, redirectTo);
            return;
          }

          if (!response.ok) {
            router.push(redirectTo);
            return;
          }

          const data = await response.json();
          const user = data?.user ?? data?.data;

          if (!user?.role) {
            handleUnauthorizedResponse(401, redirectTo);
            return;
          }

          if (user.role !== requiredRole) {
            router.replace('/unauthorized');
            return;
          }
        } catch (error) {
          console.error('Failed to verify role:', error);
          router.push(redirectTo);
          return;
        }
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    verifyRole();

    return () => window.clearTimeout(expiryTimer);
  }, [redirectTo, requiredRole, router]);

  return { isAuthenticated, isLoading };
};

/**
 * Custom fetch wrapper that handles token expiration
 */
export const authFetch = async (
  url: string,
  options: RequestInit = {},
  redirectTo: string = '/login'
): Promise<Response> => {
  const token = getValidToken(redirectTo);

  if (!token) {
    throw new Error('No valid token');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Handle 401 responses
  if (response.status === 401) {
    handleUnauthorizedResponse(401, redirectTo);
    throw new Error('Unauthorized');
  }

  return response;
};
