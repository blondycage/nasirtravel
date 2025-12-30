import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getValidToken, handleUnauthorizedResponse } from '@/lib/utils/clientAuth';

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

    // Check role if required
    if (requiredRole) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.role !== requiredRole) {
            router.push('/unauthorized');
            return;
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          router.push(redirectTo);
          return;
        }
      }
    }

    setIsAuthenticated(true);
    setIsLoading(false);
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
