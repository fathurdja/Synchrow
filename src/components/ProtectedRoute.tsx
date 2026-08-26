"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isLoading, fetchProfile, hasRole } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // If not authenticated and not currently loading, check with backend via token
    if (!isAuthenticated && !isLoading) {
      fetchProfile().then(() => {
        // We use the getter inside store, so we check state again
        const state = useAuthStore.getState();
        if (!state.isAuthenticated) {
          router.push('/login');
        } else if (allowedRoles && !state.hasRole(allowedRoles)) {
          // If authenticated but doesn't have required role
          router.push('/dashboard');
        }
      });
    } else if (isAuthenticated && allowedRoles && !hasRole(allowedRoles)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router, fetchProfile, allowedRoles, hasRole]);

  // Prevent hydration mismatch by returning a neutral loading state during SSR
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show a loading spinner while checking auth status
  if (isLoading || (!isAuthenticated && !useAuthStore.getState().token)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated but doesn't have role (while redirecting)
  if (allowedRoles && !hasRole(allowedRoles)) {
    return null; 
  }

  return <>{children}</>;
}
