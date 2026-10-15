"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  X,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  FileText,
  Clock,
} from "lucide-react";

interface LeaveItem {
  id: number;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: string;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
    department?: string;
  };
}

export default function LeavesManagementPage() {
  const { hasRole, user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Pending" | "Approved" | "Rejected" | "All">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeave, setSelectedLeave] = useState<LeaveItem | null>(null);

  // Reject modal state
  const [rejectingLeave, setRejectingLeave] = useState<LeaveItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  const isManager = hasRole(["super_admin", "hr_admin", "dept_manager"]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const endpoint = isManager ? "/leaves?all=1" : "/leaves";
      const response = await api.get(endpoint);
      setLeaves(response.data || []);
    } catch (err) {
      console.error("Gagal memuat manajemen cuti:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm("Konfirmasi persetujuan permohonan cuti ini?")) return;

    setIsActionLoading(true);
    try {
      await api.post(`/leaves/${id}/status`, { status: "Approved" });
      setLeaves(leaves.map((l) => (l.id === id ? { ...l, status: "Approved" } : l)));
      if (selectedLeave?.id === id) {
        setSelectedLeave({ ...selectedLeave, status: "Approved" });
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menyetujui cuti.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingLeave) return;
    if (!rejectReason.trim()) {
      alert("Harap cantumkan alasan penolakan secara jelas.");
      return;
    }

    setIsActionLoading(true);
    try {
      await api.post(`/leaves/${rejectingLeave.id}/status`, {
        status: "Rejected",
        rejection_reason: rejectReason,
      });

      setLeaves(leaves.map((l) => (l.id === rejectingLeave.id ? { ...l, status: "Rejected" } : l)));
      if (selectedLeave?.id === rejectingLeave.id) {
        setSelectedLeave({ ...selectedLeave, status: "Rejected" });
      }
      setRejectingLeave(null);
      setRejectReason("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal menolak cuti.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // Tab counts
  const pendingCount = leaves.filter((l) => l.status === "Pending" || l.status === "Menunggu").length;
  const approvedCount = leaves.filter((l) => l.status === "Approved" || l.status === "Disetujui").length;
  const rejectedCount = leaves.filter((l) => l.status === "Rejected" || l.status === "Ditolak").length;

  // Filtered leaves
  const filteredLeaves = leaves.filter((leave) => {
    const matchesTab =
      activeTab === "All"
        ? true
        : activeTab === "Pending"
        ? leave.status === "Pending" || leave.status === "Menunggu"
        : activeTab === "Approved"
        ? leave.status === "Approved" || leave.status === "Disetujui"
        : leave.status === "Rejected" || leave.status === "Ditolak";

    const matchesSearch =
      !searchQuery ||
      leave.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Manajemen Cuti Karyawan</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Tinjau, setujui, atau tolak permohonan istirahat kerja bawahan dan divisi.
          </p>
        </div>
      </div>

      {/* ─── Tabs & Search Toolbar (Design brief §8.5) ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-canvas rounded-[var(--radius-control)] w-fit overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("Pending")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-control)-2px)] text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "Pending"
                ? "bg-surface text-accent shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Menunggu</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 bg-warning-soft text-warning rounded-full text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Approved")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-control)-2px)] text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "Approved"
                ? "bg-surface text-accent shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Disetujui</span>
            <span className="text-ink-muted text-[10px]">({approvedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("Rejected")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-control)-2px)] text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === "Rejected"
                ? "bg-surface text-accent shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            <span>Ditolak</span>
            <span className="text-ink-muted text-[10px]">({rejectedCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("All")}
            className={`px-3 py-1.5 rounded-[calc(var(--radius-control)-2px)] text-xs font-semibold transition-all ${
              activeTab === "All"
                ? "bg-surface text-accent shadow-xs"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Semua ({leaves.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari karyawan atau jenis cuti..."
            className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas/30">
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Karyawan</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Jenis Cuti</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Rentang Tanggal</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Alasan Pengajuan</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Status</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<ClipboardList size={24} />}
                      title={`Tidak ada permohonan cuti dalam tab ${activeTab}.`}
                    />
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const isPending = leave.status === "Pending" || leave.status === "Menunggu";

                  return (
                    <tr
                      key={leave.id}
                      onClick={() => setSelectedLeave(leave)}
                      className="hover:bg-canvas/40 transition-colors cursor-pointer group"
                    >
                      {/* Karyawan */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {leave.user?.avatar ? (
                            <img
                              src={leave.user.avatar}
                              alt={leave.user.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-line"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs ring-1 ring-line">
                              {leave.user?.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-ink group-hover:text-accent transition-colors leading-tight">
                              {leave.user?.name || "Karyawan"}
                            </p>
                            <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                              {leave.user?.department || "Operasional"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Jenis Cuti */}
                      <td className="py-3.5 px-5 font-medium text-ink text-xs">{leave.type}</td>

                      {/* Rentang Tanggal */}
                      <td className="py-3.5 px-5 text-xs text-ink tabular-nums">
                        {leave.start_date} s/d {leave.end_date}
                      </td>

                      {/* Alasan */}
                      <td className="py-3.5 px-5 text-xs text-ink-muted max-w-xs truncate">
                        {leave.reason}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={leave.status} />
                      </td>

                      {/* Tombol Tindakan Cepat per brief §8.5 */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRejectingLeave(leave);
                                setRejectReason("");
                              }}
                              className="h-8 px-2.5 text-xs border-danger/30 text-danger hover:bg-danger-soft hover:text-danger rounded-[var(--radius-control)]"
                            >
                              Tolak
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleApprove(leave.id)}
                              className="h-8 px-2.5 text-xs bg-success hover:bg-success/90 text-white rounded-[var(--radius-control)]"
                            >
                              Setujui
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedLeave(leave)}
                            className="p-1.5 text-ink-muted hover:text-accent hover:bg-accent-soft rounded-[var(--radius-control)]"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Sheet / Modal Cuti ─── */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-md w-full p-6 shadow-xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-sm">
                  {selectedLeave.user?.name?.charAt(0) || "K"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedLeave.user?.name}</h3>
                  <p className="text-xs text-ink-muted">
                    {selectedLeave.user?.department || "Operasional"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeave(null)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-[var(--radius-control)] hover:bg-canvas transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Jenis Cuti</span>
                <span className="font-bold text-ink">{selectedLeave.type}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Rentang Tanggal</span>
                <span className="font-semibold text-ink tabular-nums">
                  {selectedLeave.start_date} s/d {selectedLeave.end_date}
                </span>
              </div>

              <div className="p-3 bg-canvas rounded-[var(--radius-control)] space-y-1">
                <span className="text-ink-muted block">Alasan Pengajuan:</span>
                <p className="text-ink leading-relaxed font-medium">{selectedLeave.reason}</p>
              </div>

              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Status Saat Ini</span>
                <StatusBadge status={selectedLeave.status} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-line">
              {selectedLeave.status === "Pending" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setRejectingLeave(selectedLeave);
                      setRejectReason("");
                      setSelectedLeave(null);
                    }}
                    className="h-9 text-xs border-danger/30 text-danger hover:bg-danger-soft rounded-[var(--radius-control)]"
                  >
                    Tolak Cuti
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleApprove(selectedLeave.id)}
                    className="h-9 text-xs bg-success hover:bg-success/90 text-white rounded-[var(--radius-control)]"
                  >
                    Setujui Cuti
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedLeave(null)}
                  className="h-9 text-xs rounded-[var(--radius-control)]"
                >
                  Tutup
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Penolakan Cuti Wajib Alasan per brief §8.5 ─── */}
      {rejectingLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleRejectConfirm}
            className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-md w-full p-6 shadow-xl space-y-4 animate-scale-up"
          >
            <div className="flex items-start justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle size={18} />
                <h3 className="text-base font-bold text-ink">Tolak Permohonan Cuti</h3>
              </div>
              <button
                type="button"
                onClick={() => setRejectingLeave(null)}
                className="p-1 text-ink-muted hover:text-ink rounded-[var(--radius-control)]"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-ink-muted">
              Menolak pengajuan <strong>{rejectingLeave.type}</strong> dari{" "}
              <strong>{rejectingLeave.user?.name}</strong>. Wajib mencantumkan alasan penolakan agar karyawan dapat memahami keputusan.
            </p>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">
                Alasan Penolakan *
              </label>
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Beban kerja tim sedang tinggi / bentrok dengan jadwal rilis produk..."
                className="w-full px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectingLeave(null)}
                className="h-9 text-xs rounded-[var(--radius-control)]"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isActionLoading}
                className="h-9 text-xs bg-danger hover:bg-danger/90 text-white rounded-[var(--radius-control)]"
              >
                {isActionLoading ? "Memproses..." : "Konfirmasi Tolak"}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
