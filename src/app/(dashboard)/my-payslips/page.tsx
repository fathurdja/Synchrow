"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import { StatusBadge } from "@/components/ui/status-badge";
import { Amount, formatIDR } from "@/components/ui/amount";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Receipt,
  FileDown,
  Eye,
  Calendar,
  Building2,
  UserCheck,
  CheckCircle2,
  X,
  CreditCard,
  ShieldCheck,
  Percent,
} from "lucide-react";

interface Payslip {
  id: number;
  period: string;
  basic_salary: number;
  total_allowance: number;
  gross_salary: number;
  tax_amount: number;
  bpjs_amount: number;
  net_salary: number;
  status?: string;
  created_at?: string;
}

export default function MyPayslipsPage() {
  const { user } = useAuthStore();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);
  const [downloadingPeriod, setDownloadingPeriod] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPayslips();
  }, []);

  const fetchMyPayslips = async () => {
    try {
      const response = await api.get("/my-payslips");
      setPayslips(response.data || []);
    } catch (error) {
      console.error("Gagal mengambil data slip gaji:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async (period: string) => {
    setDownloadingPeriod(period);
    try {
      const response = await api.get(`/ess/payslip/${period}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Slip_Gaji_${user?.name?.replace(/\s+/g, "_") || "Karyawan"}_${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Gagal mengunduh slip gaji:", error);
      alert("Gagal mengunduh slip gaji. Pastikan koneksi stabil.");
    } finally {
      setDownloadingPeriod(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">Slip Gaji Saya</h1>
            <p className="text-sm text-ink-muted mt-1">
              Riwayat penerimaan penghasilan bulanan dan dokumen slip resmi.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-muted bg-surface border border-line px-3 py-1.5 rounded-[var(--radius-control)]">
            <ShieldCheck size={14} className="text-accent" />
            <span>Nominal disamarkan demi keamanan visual</span>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-surface rounded-[var(--radius-card)] border border-line overflow-hidden shadow-none">
          <div className="px-6 py-4 border-b border-line bg-canvas/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-accent" />
              <h2 className="text-sm font-semibold text-ink">Daftar Periode Penggajian</h2>
            </div>
            <span className="text-xs text-ink-muted">{payslips.length} Periode Tercatat</span>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-line rounded-[var(--radius-control)]">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-9 w-28 rounded-[var(--radius-control)]" />
                  </div>
                ))}
              </div>
            ) : payslips.length === 0 ? (
              <EmptyState
                icon={<Receipt size={24} />}
                title="Belum ada slip gaji yang diterbitkan untuk akun Anda."
              />
            ) : (
              <div className="divide-y divide-line">
                {payslips.map((slip) => (
                  <div
                    key={slip.id}
                    className="p-5 hover:bg-canvas/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-11 h-11 rounded-[var(--radius-control)] bg-accent-soft flex items-center justify-center text-accent shrink-0">
                        <Receipt size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="text-base font-semibold text-ink">Periode {slip.period}</h3>
                          <StatusBadge status={slip.status || "Dibayar"} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-ink-muted mt-1">
                          <span>
                            Gaji Bersih:{" "}
                            <strong className="text-ink font-semibold">
                              <Amount value={Number(slip.net_salary)} showToggle />
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSlip(slip)}
                        className="border-line hover:border-accent text-ink hover:text-accent rounded-[var(--radius-control)] gap-1.5 text-xs font-medium h-9"
                      >
                        <Eye size={14} />
                        Rincian
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        disabled={downloadingPeriod === slip.period}
                        onClick={() => handleDownloadPdf(slip.period)}
                        className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] gap-1.5 text-xs font-medium h-9"
                      >
                        <FileDown size={14} />
                        {downloadingPeriod === slip.period ? "Mengunduh..." : "Unduh PDF"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Rincian Slip Gaji */}
        {selectedSlip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
            <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-xl w-full p-6 shadow-xl space-y-5 animate-scale-up">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[var(--radius-control)] bg-accent-soft text-accent flex items-center justify-center">
                    <Receipt size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">Rincian Slip Gaji</h3>
                    <p className="text-xs text-ink-muted">
                      Periode {selectedSlip.period} · {user?.name || "Karyawan"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSlip(null)}
                  className="p-1.5 text-ink-muted hover:text-ink hover:bg-canvas rounded-[var(--radius-control)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Company & Employee Identity */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-canvas rounded-[var(--radius-card)] text-xs">
                <div>
                  <span className="text-ink-muted block mb-0.5">Nama Karyawan</span>
                  <span className="font-semibold text-ink">{user?.name || "-"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">Email Akun</span>
                  <span className="font-semibold text-ink truncate block">{user?.email || "-"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">Departemen</span>
                  <span className="font-semibold text-ink">{user?.department || "Operasional"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">Status Pembayaran</span>
                  <StatusBadge status={selectedSlip.status || "Dibayar"} />
                </div>
              </div>

              {/* Rincian Penghasilan & Potongan */}
              <div className="space-y-4">
                {/* Penerimaan */}
                <div>
                  <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-success" />
                    Penerimaan (Penghasilan Bruto)
                  </h4>
                  <div className="bg-surface border border-line rounded-[var(--radius-control)] divide-y divide-line text-sm">
                    <div className="px-3.5 py-2.5 flex justify-between items-center">
                      <span className="text-ink-muted">Gaji Pokok</span>
                      <span className="font-semibold text-ink tabular-nums">
                        {formatIDR(Number(selectedSlip.basic_salary))}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between items-center">
                      <span className="text-ink-muted">Tunjangan Tetap & Variabel</span>
                      <span className="font-semibold text-ink tabular-nums">
                        +{formatIDR(Number(selectedSlip.total_allowance))}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between items-center bg-canvas/50">
                      <span className="font-medium text-ink">Total Bruto</span>
                      <span className="font-bold text-ink tabular-nums">
                        {formatIDR(Number(selectedSlip.gross_salary || Number(selectedSlip.basic_salary) + Number(selectedSlip.total_allowance)))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Potongan */}
                <div>
                  <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Percent size={14} className="text-danger" />
                    Potongan Resmi
                  </h4>
                  <div className="bg-surface border border-line rounded-[var(--radius-control)] divide-y divide-line text-sm">
                    <div className="px-3.5 py-2.5 flex justify-between items-center">
                      <span className="text-ink-muted">BPJS (Kesehatan + Ketenagakerjaan)</span>
                      <span className="font-semibold text-danger tabular-nums">
                        -{formatIDR(Number(selectedSlip.bpjs_amount))}
                      </span>
                    </div>
                    <div className="px-3.5 py-2.5 flex justify-between items-center">
                      <span className="text-ink-muted">Pajak Penghasilan (PPh 21)</span>
                      <span className="font-semibold text-danger tabular-nums">
                        -{formatIDR(Number(selectedSlip.tax_amount))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gaji Bersih / Take Home Pay */}
                <div className="p-4 bg-accent-soft rounded-[var(--radius-card)] border border-accent/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider block">
                      Gaji Bersih (Take Home Pay)
                    </span>
                    <span className="text-[11px] text-ink-muted">Ditransfer ke rekening terdaftar</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-accent tabular-nums">
                      {formatIDR(Number(selectedSlip.net_salary))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex justify-end gap-2.5 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-[var(--radius-control)] h-9 text-xs"
                >
                  Tutup
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDownloadPdf(selectedSlip.period)}
                  disabled={downloadingPeriod === selectedSlip.period}
                  className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs gap-1.5"
                >
                  <FileDown size={14} />
                  {downloadingPeriod === selectedSlip.period ? "Mengunduh..." : "Unduh Dokumen PDF"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
