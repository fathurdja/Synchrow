"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Amount, formatIDR } from "@/components/ui/amount";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Banknote,
  FileSpreadsheet,
  Play,
  Eye,
  EyeOff,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  CreditCard,
  Percent,
  X,
  Search,
  ChevronRight,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface PayrollRecord {
  id: number;
  period: string;
  basic_salary: number;
  total_allowance: number;
  gross_salary: number;
  tax_amount: number;
  bpjs_amount: number;
  net_salary: number;
  status?: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    department?: string;
  };
}

export default function PayrollPage() {
  const { hasRole } = useAuthStore();
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-10");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalMasked, setGlobalMasked] = useState(true);

  const fetchPayrolls = async (period: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/payroll?period=${period}`);
      setPayrolls(response.data || []);
    } catch (error) {
      console.error("Gagal memuat payroll:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls(selectedPeriod);
  }, [selectedPeriod]);

  const handleGenerateConfirm = async () => {
    setShowConfirmModal(false);
    setIsGenerating(true);
    try {
      await api.post("/payroll/generate", { period: selectedPeriod });
      alert(`Antrian proses payroll periode ${selectedPeriod} telah berhasil dijalankan.`);
      setTimeout(() => fetchPayrolls(selectedPeriod), 3000);
    } catch (error: any) {
      console.error("Gagal menjalankan payroll:", error);
      alert(error.response?.data?.message || "Gagal memproses payroll.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get("/payroll/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payroll_Rekap_${selectedPeriod}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengekspor payroll:", error);
      alert("Gagal mengunduh file Excel payroll.");
    }
  };

  // Aggregated totals
  const totalGross = payrolls.reduce(
    (sum, p) => sum + Number(p.gross_salary || Number(p.basic_salary) + Number(p.total_allowance)),
    0
  );
  const totalTax = payrolls.reduce((sum, p) => sum + Number(p.tax_amount), 0);
  const totalBpjs = payrolls.reduce((sum, p) => sum + Number(p.bpjs_amount), 0);
  const totalDeductions = totalTax + totalBpjs;
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.net_salary), 0);

  // Filtered rows
  const filteredPayrolls = payrolls.filter((p) => {
    return (
      !searchQuery ||
      p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user?.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <ProtectedRoute allowedRoles={["super_admin", "finance"]}>
      <div className="space-y-6">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Payroll Engine</h1>
            <p className="text-sm text-ink-muted mt-0.5">
              Pemrosesan gaji bulanan, penghitungan pajak PPh 21, dan integrasi iuran BPJS.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-surface border border-line rounded-[var(--radius-control)] px-3 py-1.5 text-xs">
              <Calendar size={14} className="text-accent" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent font-semibold text-ink focus:outline-none cursor-pointer"
              >
                <option value="2026-10">Oktober 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-08">Agustus 2026</option>
                <option value="2026-07">Juli 2026</option>
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className="border-line hover:border-accent text-ink hover:text-accent rounded-[var(--radius-control)] h-9 text-xs gap-1.5"
            >
              <FileSpreadsheet size={15} />
              Ekspor Excel
            </Button>

            <Button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
              {isGenerating ? "Memproses Antrian..." : "Generate Payroll"}
            </Button>
          </div>
        </div>

        {/* ─── Banner Informasi Permanen PPh 21 (Design brief §8.6) ─── */}
        <div className="p-4 bg-warning-soft/70 border border-warning/30 rounded-[var(--radius-card)] flex items-start gap-3 text-xs text-warning">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Pemberitahuan Regulasi Perpajakan:</span>
            <p className="leading-relaxed">
              Perhitungan PPh 21 saat ini memakai tarif tunggal. Tarif progresif penuh belum aktif. Pastikan rekonsiliasi manual sebelum transfer final ke bank rekanan.
            </p>
          </div>
        </div>

        {/* ─── KPI Cards: Total Bruto, Potongan, Bersih (Amount Masking default per §8.6) ─── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Bruto */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Total Bruto (Penghasilan Kotor)</span>
              <span className="w-2 h-2 rounded-full bg-accent" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-ink tabular-nums">
                <Amount value={totalGross} masked={globalMasked} />
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">Gaji pokok + semua tunjangan karyawan</p>
          </div>

          {/* Total Potongan */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Total Potongan (PPh 21 + BPJS)</span>
              <span className="w-2 h-2 rounded-full bg-danger" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-danger tabular-nums">
                <Amount value={totalDeductions} masked={globalMasked} />
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">Iuran BPJS Kesehatan/TK & estimasi pajak</p>
          </div>

          {/* Total Bersih */}
          <div className="bg-surface border border-line rounded-[var(--radius-card)] p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-ink-muted">
              <span>Total Bersih (Disalurkan)</span>
              <button
                type="button"
                onClick={() => setGlobalMasked(!globalMasked)}
                className="flex items-center gap-1 text-[11px] font-semibold text-accent hover:underline cursor-pointer"
              >
                {globalMasked ? <Eye size={13} /> : <EyeOff size={13} />}
                <span>{globalMasked ? "Tampilkan Nominal" : "Samarkan"}</span>
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-accent tabular-nums">
                <Amount value={totalNet} masked={globalMasked} />
              </span>
            </div>
            <p className="text-[11px] text-ink-muted">Total anggaran transfer ke {payrolls.length} karyawan</p>
          </div>
        </div>

        {/* ─── Queue Status Bar ─── */}
        <div className="p-3.5 bg-surface border border-line rounded-[var(--radius-control)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse-slow" />
            <span className="text-ink font-semibold">
              Status Pemrosesan Batch: {isGenerating ? "Sedang Memproses Antrian (Worker Aktif)..." : "Selesai Direkonsiliasi"}
            </span>
          </div>
          <span className="text-ink-muted tabular-nums">
            {payrolls.length} data karyawan siap ditinjau untuk periode {selectedPeriod}
          </span>
        </div>

        {/* ─── Table ─── */}
        <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden">
          <div className="p-4 border-b border-line bg-canvas/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari karyawan atau divisi..."
                className="w-full pl-9 pr-3.5 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <span className="text-xs text-ink-muted font-medium">
              Menampilkan {filteredPayrolls.length} dari {payrolls.length} Karyawan
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas/20">
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Karyawan</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Departemen</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">Gaji Bruto</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">BPJS</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">PPh 21</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">Gaji Bersih</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-center">Status</th>
                  <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={8} className="py-4 px-5">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredPayrolls.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <EmptyState
                        icon={<Banknote size={24} />}
                        title={`Belum ada data payroll untuk periode ${selectedPeriod}.`}
                        action={
                          <Button
                            onClick={() => setShowConfirmModal(true)}
                            className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] text-xs h-8"
                          >
                            Generate Payroll Sekarang
                          </Button>
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredPayrolls.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedPayroll(row)}
                      className="hover:bg-canvas/40 transition-colors cursor-pointer group"
                    >
                      {/* Karyawan */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {row.user?.avatar ? (
                            <img
                              src={row.user.avatar}
                              alt={row.user.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-line"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs ring-1 ring-line">
                              {row.user?.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-ink group-hover:text-accent transition-colors leading-tight">
                              {row.user?.name || "Karyawan"}
                            </p>
                            <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                              {row.user?.email || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Departemen */}
                      <td className="py-3.5 px-5 text-xs text-ink-muted">
                        {row.user?.department || "Operasional"}
                      </td>

                      {/* Bruto (Rata Kanan) */}
                      <td className="py-3.5 px-5 text-xs text-ink font-medium tabular-nums text-right">
                        <Amount value={Number(row.gross_salary || Number(row.basic_salary) + Number(row.total_allowance))} masked={globalMasked} />
                      </td>

                      {/* BPJS (Rata Kanan) */}
                      <td className="py-3.5 px-5 text-xs text-danger tabular-nums text-right">
                        <Amount value={Number(row.bpjs_amount)} masked={globalMasked} />
                      </td>

                      {/* PPh 21 (Rata Kanan) */}
                      <td className="py-3.5 px-5 text-xs text-danger tabular-nums text-right">
                        <Amount value={Number(row.tax_amount)} masked={globalMasked} />
                      </td>

                      {/* Bersih (Rata Kanan) */}
                      <td className="py-3.5 px-5 text-xs font-bold text-accent tabular-nums text-right">
                        <Amount value={Number(row.net_salary)} masked={globalMasked} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center">
                        <StatusBadge status={row.status || "Completed"} />
                      </td>

                      {/* Tombol Rincian */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPayroll(row);
                          }}
                          className="p-1.5 text-ink-muted hover:text-accent hover:bg-accent-soft rounded-[var(--radius-control)]"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Dialog Konfirmasi Generate Payroll Spesifik per brief §8.6 ─── */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center">
                  <Play size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">Konfirmasi Proses Payroll</h3>
                  <p className="text-xs text-ink-muted">Tindakan ini akan memicu kalkulasi background queue.</p>
                </div>
              </div>

              <div className="p-3.5 bg-canvas rounded-[var(--radius-control)] border border-line text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Periode Pembayaran:</span>
                  <span className="font-bold text-ink">{selectedPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Jumlah Data Terkalkulasi:</span>
                  <span className="font-bold text-ink">{payrolls.length} Karyawan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Mekanisme Pengerjaan:</span>
                  <span className="font-semibold text-accent">Queue Background Worker</span>
                </div>
              </div>

              <p className="text-xs text-ink-muted leading-relaxed">
                Apakah Anda ingin menjalankan rekonsiliasi dan generate payroll untuk periode{" "}
                <strong>{selectedPeriod}</strong> sekarang?
              </p>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-[var(--radius-control)] h-9 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="button"
                  onClick={handleGenerateConfirm}
                  className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold"
                >
                  Generate Payroll {selectedPeriod}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Sheet / Modal Rincian Komponen per Karyawan (§8.6) ─── */}
        {selectedPayroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-lg w-full p-6 shadow-xl space-y-5 animate-scale-up">
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-sm">
                    {selectedPayroll.user?.name?.charAt(0) || "K"}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">{selectedPayroll.user?.name}</h3>
                    <p className="text-xs text-ink-muted">
                      {selectedPayroll.user?.department || "Operasional"} · Periode {selectedPayroll.period}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPayroll(null)}
                  className="p-1.5 text-ink-muted hover:text-ink rounded-[var(--radius-control)] hover:bg-canvas transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rincian Komponen */}
              <div className="space-y-4 text-xs">
                {/* Komponen Penerimaan */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} className="text-success" />
                    Komponen Penerimaan (Bruto)
                  </h4>
                  <div className="bg-canvas rounded-[var(--radius-control)] p-3 space-y-2 divide-y divide-line/60">
                    <div className="flex justify-between items-center pb-1.5">
                      <span className="text-ink-muted">Gaji Pokok Dasar</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {formatIDR(Number(selectedPayroll.basic_salary))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 pb-1.5">
                      <span className="text-ink-muted">Tunjangan Operasional & Transport</span>
                      <span className="font-semibold text-ink tabular-nums">
                        +{formatIDR(Number(selectedPayroll.total_allowance))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 font-bold">
                      <span className="text-ink">Total Bruto</span>
                      <span className="text-ink tabular-nums">
                        {formatIDR(Number(selectedPayroll.gross_salary || Number(selectedPayroll.basic_salary) + Number(selectedPayroll.total_allowance)))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Komponen Potongan */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
                    <Percent size={14} className="text-danger" />
                    Komponen Potongan Wajib
                  </h4>
                  <div className="bg-canvas rounded-[var(--radius-control)] p-3 space-y-2 divide-y divide-line/60">
                    <div className="flex justify-between items-center pb-1.5">
                      <span className="text-ink-muted">BPJS Kesehatan (1% Karyawan)</span>
                      <span className="font-medium text-danger tabular-nums">
                        -{formatIDR(Number(selectedPayroll.bpjs_amount) * 0.4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 pb-1.5">
                      <span className="text-ink-muted">BPJS Ketenagakerjaan (JHT + JP)</span>
                      <span className="font-medium text-danger tabular-nums">
                        -{formatIDR(Number(selectedPayroll.bpjs_amount) * 0.6)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 pb-1.5">
                      <span className="text-ink-muted">Pajak Penghasilan (PPh 21 Tarif Tunggal)</span>
                      <span className="font-medium text-danger tabular-nums">
                        -{formatIDR(Number(selectedPayroll.tax_amount))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-1.5 font-bold text-danger">
                      <span>Total Potongan</span>
                      <span className="tabular-nums">
                        -{formatIDR(Number(selectedPayroll.bpjs_amount) + Number(selectedPayroll.tax_amount))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gaji Bersih */}
                <div className="p-3.5 bg-accent-soft rounded-[var(--radius-control)] border border-accent/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                      Gaji Bersih (Take Home Pay)
                    </span>
                    <span className="text-[11px] text-ink-muted">Nilai bersih yang ditransfer</span>
                  </div>
                  <span className="text-lg font-bold text-accent tabular-nums">
                    {formatIDR(Number(selectedPayroll.net_salary))}
                  </span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPayroll(null)}
                  className="h-9 text-xs rounded-[var(--radius-control)]"
                >
                  Tutup Rincian
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
