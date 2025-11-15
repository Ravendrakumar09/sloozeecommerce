'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (loading) {
      return;
    }

    if (isAuthenticated) {
      router.push(user?.role === 'manager' ? '/dashboard' : '/products');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router, loading]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
