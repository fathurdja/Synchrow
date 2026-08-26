"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setAuth, fetchProfile } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      if (token) {
        // Temporarily set token and placeholder user to let fetchProfile use the new token
        setAuth(token, { id: 0, name: '', email: '' }, [], []);
        
        // Fetch actual profile and roles from backend
        await fetchProfile();
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // No token found, redirect back to login
        router.push('/login');
      }
    };

    handleCallback();
  }, [token, router, setAuth, fetchProfile]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-600 font-medium animate-pulse">Authenticating with Google...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>}>
      <CallbackHandler />
    </Suspense>
  );
}
