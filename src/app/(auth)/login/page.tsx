"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, user, roles, permissions } = response.data;
      
      setAuth(token, user, roles, permissions);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to sign in. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api') + '/auth/google';
  };
  return (
    <div className="min-h-screen bg-brand-accent/20 flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-primary p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-highlight/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-14 h-14 flex items-center justify-center rounded-xl overflow-hidden border border-brand-accent/20 bg-white shadow-lg shadow-brand-secondary/20">
              <Image src="/logo.png" alt="Synchrow Logo" width={56} height={56} className="w-full h-full object-cover scale-[1.5]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Synchrow</h1>
              <p className="text-xs font-semibold text-brand-accent uppercase tracking-[0.08em]">Enterprise HRIS</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Your Complete<br />HR Management<br />Solution
          </h2>
          <p className="text-lg text-slate-300 max-w-md leading-relaxed">
            Streamline attendance, payroll, leave management, and employee self-service — all in one powerful platform.
          </p>
          <div className="flex gap-8 mt-10">
            {[
              { value: "1,200+", label: "Employees" },
              { value: "98%", label: "On-time Rate" },
              { value: "24/7", label: "Self-Service" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-slate-500">© 2026 Synchrow. All rights reserved.</p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden border border-brand-accent/50 bg-white shadow-sm">
              <Image src="/logo.png" alt="Synchrow Logo" width={48} height={48} className="w-full h-full object-cover scale-[1.5]" />
            </div>
            <h1 className="text-2xl font-bold text-brand-primary">Synchrow</h1>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold text-brand-primary tracking-tight">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-2">Sign in to your account to continue</p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 gap-3 text-sm font-medium border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-xl shadow-sm"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">or</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">Password</label>
                  <a href="#" className="text-xs text-brand-secondary font-medium hover:text-brand-primary">Forgot password?</a>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:border-transparent transition-all"
                />
              </div>

              {/* Sign In */}
              <Button disabled={isLoading} type="submit" className="w-full h-12 bg-brand-secondary hover:bg-brand-primary text-white rounded-xl shadow-sm shadow-brand-secondary/20 text-sm font-semibold disabled:opacity-70">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-slate-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
