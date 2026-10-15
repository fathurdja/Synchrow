"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { KpiCard } from "@/components/ui/kpi-card";
import { SkeletonCard, Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarDays,
  Camera,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Receipt,
  FileText,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Gagal memuat statistik dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const isManager = hasRole(["super_admin", "hr_admin", "dept_manager"]);
  const isFinance = hasRole(["finance", "super_admin"]);

  // Greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 18) return "Selamat sore";
    return "Selamat malam";
  };

  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* ─── Header: Ucapan & Tanggal ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            {getGreeting()}, {user?.name || "Karyawan"}
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Pusat operasional dan ringkasan aktivitas hari ini.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto bg-surface border border-line px-3.5 py-1.5 rounded-[var(--radius-control)] text-xs font-semibold text-ink">
          <span className="w-2 h-2 rounded-full bg-pulse animate-pulse-slow shrink-0" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* ─── KPI Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : isManager ? (
          <>
            <KpiCard
              label="Total Karyawan"
              value={stats?.admin?.total_employees || 0}
              sub="Karyawan aktif terdaftar"
              icon={<Users size={20} />}
              href="/employees"
            />
            <KpiCard
              label="Hadir Hari Ini"
              value={stats?.admin?.today_attendance || 0}
              sub="Telah melakukan check-in"
              icon={<CheckCircle2 size={20} />}
              href="/attendance-log"
            />
            <KpiCard
              label="Terlambat Hari Ini"
              value={stats?.admin?.today_late || 0}
              sub="Check-in setelah jam kantor"
              icon={<Clock size={20} />}
              href="/attendance-log"
            />
            <KpiCard
              label="Cuti Menunggu"
              value={stats?.admin?.pending_leaves || stats?.personal?.active_leaves || 0}
              sub="Perlu persetujuan Anda"
              icon={<CalendarDays size={20} />}
              href="/leaves"
            />
          </>
        ) : (
          <>
            <KpiCard
              label="Kehadiran Bulan Ini"
              value={`${stats?.personal?.present_this_month || 0} Hari`}
              sub={`Dari ${stats?.personal?.total_working_days || 22} hari kerja`}
              icon={<CheckCircle2 size={20} />}
              href="/attendance"
            />
            <KpiCard
              label="Keterlambatan"
              value={`${stats?.personal?.late_this_month || 0} Kali`}
              sub="Bulan kalender berjalan"
              icon={<Clock size={20} />}
              href="/attendance"
            />
            <KpiCard
              label="Pengajuan Cuti Aktif"
              value={stats?.personal?.active_leaves || 0}
              sub="Sedang dalam proses tinjauan"
              icon={<CalendarDays size={20} />}
              href="/leave"
            />
            <KpiCard
              label="Slip Gaji Terakhir"
              value="Tersedia"
              sub="Bulan sebelumnya selesai"
              icon={<Receipt size={20} />}
              href="/my-payslips"
            />
          </>
        )}
      </div>

      {/* ─── Bento Grid: Perlu Tindakan & Aktivitas Cerdas ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kolom Kiri (2 Kolom): Perlu Tindakan & Tren Kehadiran */}
        <div className="lg:col-span-2 space-y-5">
          {/* Blok "Perlu Tindakan" */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <h2 className="text-sm font-bold text-ink">Perlu Tindakan Sekarang</h2>
              </div>
              <span className="text-xs text-ink-muted">Prioritas Harian</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Quick Action: Absensi */}
              <div className="p-4 rounded-[var(--radius-control)] bg-canvas border border-line flex flex-col justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                    <Camera size={16} className="text-accent" />
                    <span>Absensi Biometrik Wajah</span>
                  </div>
                  <p className="text-xs text-ink-muted">
                    Pastikan posisi wajah tegak dan pencahayaan memadai sebelum check-in.
                  </p>
                </div>
                <Link href="/attendance">
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5">
                    <Camera size={14} />
                    Buka Kamera Absen
                  </Button>
                </Link>
              </div>

              {/* Quick Action: Cuti / Tinjauan */}
              {isManager ? (
                <div className="p-4 rounded-[var(--radius-control)] bg-canvas border border-line flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <CalendarDays size={16} className="text-warning" />
                      <span>Antrian Persetujuan Cuti</span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Ada pengajuan cuti tim yang menunggu verifikasi berjenjang.
                    </p>
                  </div>
                  <Link href="/leaves">
                    <Button variant="outline" size="sm" className="w-full border-line hover:border-accent text-ink hover:text-accent rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5">
                      Tinjau Permohonan Cuti
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-4 rounded-[var(--radius-control)] bg-canvas border border-line flex flex-col justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-ink">
                      <CalendarDays size={16} className="text-accent" />
                      <span>Ajukan Cuti Baru</span>
                    </div>
                    <p className="text-xs text-ink-muted">
                      Rencanakan cuti tahunan, sakit, atau urusan keluarga dengan mudah.
                    </p>
                  </div>
                  <Link href="/leave">
                    <Button variant="outline" size="sm" className="w-full border-line hover:border-accent text-ink hover:text-accent rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5">
                      Formulir Cuti
                      <ArrowRight size={14} />
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Status Cuti Terkini jika ada */}
            {!isManager && stats?.personal?.recent_leave_status && (
              <div className="p-3.5 bg-accent-soft/40 border border-accent/20 rounded-[var(--radius-control)] flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-ink">
                    Status Pengajuan: {stats.personal.recent_leave_status.type}
                  </span>
                  <p className="text-[11px] text-ink-muted">
                    {new Date(stats.personal.recent_leave_status.start_date).toLocaleDateString("id-ID")} - {new Date(stats.personal.recent_leave_status.end_date).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <StatusBadge status={stats.personal.recent_leave_status.status} />
              </div>
            )}
          </div>

          {/* Tren Kehadiran Mingguan */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-accent" />
                <h2 className="text-sm font-bold text-ink">Tren Kehadiran Tim (Minggu Ini)</h2>
              </div>
              <span className="text-xs text-ink-muted font-medium">Senin - Jumat</span>
            </div>

            {/* Visualisasi Batang Sederhana & Bersih */}
            <div className="grid grid-cols-5 gap-3 pt-2">
              {[
                { day: "Sen", percent: 96, label: "96%" },
                { day: "Sel", percent: 92, label: "92%" },
                { day: "Rab", percent: 98, label: "98%" },
                { day: "Kam", percent: 94, label: "94%" },
                { day: "Jum", percent: 88, label: "88%" },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <span className="text-xs font-semibold text-ink tabular-nums">{item.label}</span>
                  <div className="w-full h-24 bg-canvas rounded-[var(--radius-control)] p-1 flex items-end">
                    <div
                      className="w-full bg-accent rounded-[calc(var(--radius-control)-2px)] transition-all duration-300 hover:bg-accent/80"
                      style={{ height: `${item.percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-ink-muted font-medium">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Kolom Kanan (1 Kolom): Panel Aktivitas & Smart Insights */}
        <div className="space-y-5">
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent" />
                <h2 className="text-sm font-bold text-ink">Aktivitas Terkini</h2>
              </div>
              <span className="w-2 h-2 rounded-full bg-pulse animate-pulse-slow" />
            </div>

            <div className="space-y-3">
              {stats?.personal?.recent_activity?.length > 0 ? (
                stats.personal.recent_activity.slice(0, 5).map((act: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-[var(--radius-control)] hover:bg-canvas transition-colors">
                    <div className="w-7 h-7 rounded-full bg-accent-soft text-accent flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink">Check-in Tercatat</p>
                      <p className="text-[11px] text-ink-muted">
                        {new Date(act.date).toLocaleDateString("id-ID")} · {act.check_in || "08.00"}
                      </p>
                    </div>
                    <StatusBadge status={act.status || "Hadir"} />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-ink-muted">
                  Belum ada log kehadiran terbaru hari ini.
                </div>
              )}
            </div>

            {/* Smart Insights Operational Notice per brief §8.2 */}
            <div className="pt-3 border-t border-line space-y-2">
              <div className="p-3 bg-canvas border border-line rounded-[var(--radius-control)] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  <span>Insight Operasional</span>
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Semua perhitungan absensi dan rekonsiliasi data payroll disinkronkan secara berkala melalui queue worker.
                </p>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-4">
            <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Tautan Cepat</h3>
            <div className="flex flex-col gap-1 text-xs font-medium text-ink">
              <Link href="/my-payslips" className="flex items-center justify-between p-2 rounded-[var(--radius-control)] hover:bg-canvas hover:text-accent transition-colors">
                <span>Unduh Slip Gaji</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </Link>
              <Link href="/profile" className="flex items-center justify-between p-2 rounded-[var(--radius-control)] hover:bg-canvas hover:text-accent transition-colors">
                <span>Pembaruan Wajah Biometrik</span>
                <ExternalLink size={14} className="text-ink-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
