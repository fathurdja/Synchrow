"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { ShieldCheck, Sparkles, CheckCircle, ArrowRight, AlertCircle } from "lucide-react";

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
      const backendError = err.response?.data?.error;
      if (backendError && backendError.includes("Google")) {
        setError(backendError);
      } else {
        setError("Email atau kata sandi tidak cocok. Periksa lagi atau masuk dengan Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api") + "/auth/google";
  };

  return (
    <div className="min-h-screen bg-canvas flex items-stretch">
      {/* Kolom Kiri: Form Login */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 md:p-16 lg:max-w-[560px] bg-surface border-r border-line">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-control)] border border-line bg-surface flex items-center justify-center overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Synchrow Logo"
              width={40}
              height={40}
              className="w-full h-full object-cover scale-[1.5]"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-ink tracking-tight leading-none">Synchrow</h1>
            <p className="text-[11px] font-semibold text-ink-muted uppercase tracking-[0.06em] mt-0.5">
              Enterprise HRIS
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="my-auto py-8 max-w-sm w-full mx-auto space-y-6">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-ink tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-sm text-ink-muted leading-relaxed">
              Pusat kendali operasional HR, absensi presisi, dan payroll otomatis.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-danger-soft border border-danger/20 rounded-[var(--radius-control)] text-xs text-danger flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {/* Design brief §8.1: Tombol Masuk dengan Google (Primer) */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] font-semibold text-sm flex items-center justify-center gap-2.5 shadow-none transition-all"
            >
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Masuk dengan Google
            </Button>

            {/* Pemisah "atau" */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-line"></div>
              <span className="text-xs text-ink-muted uppercase font-medium tracking-wider">
                atau gunakan akun email
              </span>
              <div className="flex-1 h-px bg-line"></div>
            </div>

            {/* Form Email & Password */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Email Perusahaan
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@perusahaan.com"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[var(--radius-control)] text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-ink">Kata Sandi</label>
                  <span className="text-xs text-ink-muted cursor-pointer hover:text-accent">
                    Lupa sandi?
                  </span>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[var(--radius-control)] text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="outline"
                className="w-full h-10 border-line hover:border-accent text-ink hover:text-accent rounded-[var(--radius-control)] font-semibold text-sm transition-all"
              >
                {isLoading ? "Memproses..." : "Masuk ke Synchrow"}
              </Button>
            </form>
          </div>

          <div className="p-3 bg-canvas border border-line rounded-[var(--radius-control)] text-[11px] text-ink-muted leading-relaxed">
            <span className="font-semibold text-ink">Catatan akses:</span> Karyawan baru perlu didaftarkan terlebih dahulu oleh HR Admin sebelum dapat login melalui Google.
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-ink-muted text-center lg:text-left">
          © 2026 Synchrow Enterprise HRIS · Hak Cipta Dilindungi
        </div>
      </div>

      {/* Kolom Kanan: Panel Brand & Nilai Produk (Desktop Only per §8.1) */}
      <div className="hidden lg:flex flex-1 bg-accent p-12 lg:p-16 flex-col justify-between relative overflow-hidden text-white">
        {/* Subtle geometric circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />

        {/* Top badge */}
        <div className="relative z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 w-fit text-xs font-medium">
          <Sparkles size={14} className="text-pulse" />
          <span>Arsitektur HRIS Generasi Baru</span>
        </div>

        {/* Center message */}
        <div className="relative z-10 max-w-lg space-y-6">
          <h2 className="text-3xl font-bold tracking-tight leading-snug">
            Satu sistem terpadu untuk absensi biometrik, cuti bertingkat, dan payroll presisi.
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Synchrow menghadirkan efisiensi operasional dengan verifikasi wajah on-device, perhitungan PPh 21 dan BPJS otomatis, serta kontrol akses data berbasis peran.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-pulse">
                <CheckCircle size={16} />
                <span>Anti-Titip Absen</span>
              </div>
              <p className="text-xs text-white/70">Biometrik wajah terverifikasi secara instan di browser.</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-semibold text-pulse">
                <ShieldCheck size={16} />
                <span>Data Finansial Aman</span>
              </div>
              <p className="text-xs text-white/70">Privasi gaji terisolasi hanya untuk peran yang berhak.</p>
            </div>
          </div>
        </div>

        {/* Bottom live indicator */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/70 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pulse animate-pulse-slow" />
            <span>Sistem Operasional Aktif</span>
          </div>
          <span>Versi 1.0 Enterprise</span>
        </div>
      </div>
    </div>
  );
}
