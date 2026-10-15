"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CalendarOff,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react";

export default function LeavePage() {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [type, setType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [successNotice, setSuccessNotice] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get("/leaves");
      setLeaves(response.data || []);
    } catch (err) {
      console.error("Gagal memuat riwayat cuti:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate day difference
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysCount = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert("Harap lengkapi semua field yang wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/leaves", {
        type,
        start_date: startDate,
        end_date: endDate,
        reason,
      });

      setSuccessNotice(true);
      setStartDate("");
      setEndDate("");
      setReason("");
      setShowForm(false);
      fetchMyLeaves();

      setTimeout(() => setSuccessNotice(false), 5000);
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.error || "Gagal mengajukan cuti.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Ajukan Permohonan Cuti</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Pengajuan waktu istirahat dan peninjauan status persetujuan berjenjang.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5 self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          {showForm ? "Tutup Formulir" : "Buat Pengajuan Cuti"}
        </Button>
      </div>

      {successNotice && (
        <div className="p-4 bg-success-soft border border-success/20 rounded-[var(--radius-card)] text-xs text-success flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Pengajuan cuti berhasil dikirim! Menunggu verifikasi dari Manager dan HR.</span>
        </div>
      )}

      {/* ─── Saldo Cuti & Linimasa Persetujuan (Slot Backlog per brief §8.5) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Saldo Cuti */}
        <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Sisa Cuti Tahunan</span>
            <span className="px-2 py-0.5 rounded-full bg-accent-soft text-accent font-semibold text-[10px]">
              Tahun 2026
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink tabular-nums">12</span>
            <span className="text-xs text-ink-muted">Hari Tersedia</span>
          </div>
          <p className="text-[11px] text-ink-muted">Dari total kuota 12 hari kalender kerja</p>
        </div>

        <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>Hak Cuti Sakit</span>
            <span className="px-2 py-0.5 rounded-full bg-success-soft text-success font-semibold text-[10px]">
              Kesehatan
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink tabular-nums">14</span>
            <span className="text-xs text-ink-muted">Hari Tersedia</span>
          </div>
          <p className="text-[11px] text-ink-muted">Wajib melampirkan surat dokter resmi</p>
        </div>

        {/* Linimasa Persetujuan Visual (§8.5) */}
        <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-3">
          <span className="text-xs font-bold text-ink uppercase tracking-wider block">
            Alur Persetujuan
          </span>
          <div className="flex items-center justify-between text-[11px] font-medium text-ink-muted">
            <div className="flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Diajukan</span>
            </div>
            <ArrowRight size={12} className="text-line" />
            <div className="flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-canvas border border-line text-ink flex items-center justify-center text-[10px] font-bold">2</span>
              <span>Manager</span>
            </div>
            <ArrowRight size={12} className="text-line" />
            <div className="flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-canvas border border-line text-ink flex items-center justify-center text-[10px] font-bold">3</span>
              <span>HR Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Form Pengajuan (Satu Kolom per §8.5) ─── */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-line rounded-[var(--radius-card)] p-6 space-y-5 animate-fade-in shadow-xs"
        >
          <div className="border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">Formulir Pengajuan Cuti Baru</h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Isi rincian permohonan dengan jelas untuk mempercepat proses persetujuan.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            {/* Tipe Cuti */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Jenis Cuti *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Cuti Tahunan">Cuti Tahunan</option>
                <option value="Cuti Sakit">Cuti Sakit (Wajib Surat Dokter)</option>
                <option value="Cuti Khusus / Pernikahan">Cuti Khusus / Pernikahan</option>
                <option value="Cuti Bersalin">Cuti Bersalin / Melahirkan</option>
                <option value="Izin Tidak Masuk">Izin Keperluan Mendesak</option>
              </select>
            </div>

            {/* Rentang Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Tanggal Mulai *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Tanggal Selesai *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            {/* Durasi Terkalkulasi */}
            {daysCount > 0 && (
              <div className="p-3 bg-accent-soft/40 border border-accent/20 rounded-[var(--radius-control)] flex items-center justify-between text-xs">
                <span className="text-ink font-medium">Estimasi Durasi Cuti:</span>
                <span className="font-bold text-accent tabular-nums">{daysCount} Hari Kalender</span>
              </div>
            )}

            {/* Alasan */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Alasan Pengajuan Cuti *
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan kebutuhan cuti Anda secara singkat dan jelas..."
                className="w-full px-3.5 py-2.5 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Lampiran Dokumen Opsional */}
            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Lampiran Pendukung (Opsional, PDF/JPG)
              </label>
              <div className="p-4 border border-dashed border-line rounded-[var(--radius-control)] bg-canvas flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent transition-colors">
                <Upload size={20} className="text-ink-muted mb-1" />
                <span className="text-xs font-medium text-ink">Klik atau tarik file ke sini</span>
                <span className="text-[10px] text-ink-muted mt-0.5">Maksimal ukuran file 5 MB</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-line">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-[var(--radius-control)] h-9 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5"
              >
                <Send size={14} />
                {isSubmitting ? "Mengirim..." : "Ajukan Permohonan Cuti"}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ─── Riwayat Pengajuan Cuti Pribadi ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-line bg-canvas/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-accent" />
            <h2 className="text-xs font-bold text-ink uppercase tracking-wider">
              Riwayat Pengajuan Cuti Anda
            </h2>
          </div>
          <span className="text-xs text-ink-muted">{leaves.length} Pengajuan</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas/20">
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Jenis Cuti</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Rentang Tanggal</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Alasan</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Tanggal Diajukan</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="py-4 px-5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12">
                    <EmptyState
                      icon={<CalendarOff size={24} />}
                      title="Belum ada riwayat pengajuan cuti."
                      action={
                        <Button
                          onClick={() => setShowForm(true)}
                          className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] text-xs h-8"
                        >
                          Ajukan Cuti Sekarang
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                leaves.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-ink">{item.type}</td>
                    <td className="py-3.5 px-5 text-xs text-ink tabular-nums">
                      {item.start_date} s/d {item.end_date}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-ink-muted max-w-xs truncate">
                      {item.reason}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-ink-muted">
                      {new Date(item.created_at || Date.now()).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={item.status || "Pending"} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
