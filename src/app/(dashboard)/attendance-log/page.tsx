"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  Building,
  Eye,
  X,
  MapPin,
  Clock,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  location?: string;
  status: string;
  photo?: string;
  user?: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
    department?: string;
  };
}

export default function AttendanceLogPage() {
  const { hasRole, user } = useAuthStore();
  const router = useRouter();

  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

  const isDeptManager = hasRole(["dept_manager"]) && !hasRole(["super_admin", "hr_admin"]);

  useEffect(() => {
    if (!hasRole(["super_admin", "hr_admin", "dept_manager"])) {
      router.push("/dashboard");
      return;
    }
    fetchAttendances();
  }, [hasRole, router]);

  const fetchAttendances = async () => {
    try {
      const response = await api.get("/attendances?all=1");
      setAttendances(response.data || []);
    } catch (err) {
      console.error("Gagal memuat log absensi:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter records
  const filteredRecords = attendances.filter((att) => {
    const matchesSearch =
      !searchQuery ||
      att.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      att.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      att.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Log Absensi Karyawan</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {isDeptManager
              ? "Memantau waktu kehadiran anggota tim di departemen Anda."
              : "Pemantauan kehadiran seluruh departemen perusahaan secara real-time."}
          </p>
        </div>

        {/* Tombol Ekspor dengan label nonaktif + tooltip Segera Hadir (Brief §8.4) */}
        <div className="relative group self-start sm:self-auto">
          <Button
            type="button"
            variant="outline"
            disabled
            className="border-line text-ink-muted rounded-[var(--radius-control)] h-9 text-xs gap-1.5 opacity-60 cursor-not-allowed"
          >
            <Download size={14} />
            Ekspor Laporan (Excel/PDF)
          </Button>
          <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block bg-ink text-white text-[11px] px-2.5 py-1 rounded shadow-md whitespace-nowrap z-20">
            Segera hadir pada pembaruan laporan absensi
          </div>
        </div>
      </div>

      {/* ─── Filter & Toolbar ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama atau email karyawan..."
            className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
          />
        </div>

        {/* Departemen Filter (Terkunci untuk Dept Manager per brief §8.4 & §9) */}
        {isDeptManager ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs font-semibold text-ink">
            <Building size={14} className="text-accent" />
            <span>Departemen: {user?.department || "Departemen Anda"}</span>
          </div>
        ) : (
          <select className="px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">Semua Departemen</option>
            <option value="eng">Engineering & Product</option>
            <option value="ops">Operasional</option>
            <option value="hr">Human Resources</option>
            <option value="fin">Keuangan & Pajak</option>
          </select>
        )}

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">Semua Status</option>
          <option value="present">Hadir</option>
          <option value="late">Terlambat</option>
          <option value="alpha">Alpha</option>
          <option value="leave">Cuti</option>
        </select>
      </div>

      {/* ─── Data Table ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas/30">
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Karyawan</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Departemen</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Tanggal</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Check-in</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Check-out</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Lokasi</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Status</th>
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
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <EmptyState
                      icon={<History size={24} />}
                      title="Tidak ada catatan absensi yang sesuai filter."
                    />
                  </td>
                </tr>
              ) : (
                filteredRecords.map((att) => (
                  <tr
                    key={att.id}
                    onClick={() => setSelectedRecord(att)}
                    className="hover:bg-canvas/40 transition-colors cursor-pointer group"
                  >
                    {/* Karyawan (Avatar & Nama) */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {att.user?.avatar ? (
                          <img
                            src={att.user.avatar}
                            alt={att.user.name}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-line"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs ring-1 ring-line">
                            {att.user?.name?.charAt(0) || "?"}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-ink group-hover:text-accent transition-colors leading-tight">
                            {att.user?.name || "Karyawan"}
                          </p>
                          <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                            {att.user?.email || "-"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Departemen */}
                    <td className="py-3.5 px-5 text-xs text-ink-muted">
                      {att.user?.department || "Operasional"}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3.5 px-5 text-xs text-ink tabular-nums">
                      {new Date(att.date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Check-in */}
                    <td className="py-3.5 px-5 text-xs font-semibold text-ink tabular-nums">
                      {att.check_in || "-"}
                    </td>

                    {/* Check-out */}
                    <td className="py-3.5 px-5 text-xs font-semibold text-ink tabular-nums">
                      {att.check_out || "-"}
                    </td>

                    {/* Lokasi */}
                    <td className="py-3.5 px-5 text-xs text-ink-muted">
                      {att.location || "Kantor Pusat"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <StatusBadge status={att.status || "Hadir"} />
                    </td>

                    {/* Aksi */}
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(att);
                        }}
                        className="p-1.5 rounded-[var(--radius-control)] text-ink-muted hover:text-accent hover:bg-accent-soft transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Detail Sheet / Modal per brief §8.4 ─── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-md w-full p-6 shadow-xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-sm">
                  {selectedRecord.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedRecord.user?.name}</h3>
                  <p className="text-xs text-ink-muted">
                    {selectedRecord.user?.department || "Operasional"} · {selectedRecord.user?.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-[var(--radius-control)] hover:bg-canvas transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rincian Waktu & Lokasi */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Tanggal Presensi</span>
                <span className="font-semibold text-ink">
                  {new Date(selectedRecord.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-canvas rounded-[var(--radius-control)]">
                  <span className="text-ink-muted block mb-1">Waktu Masuk</span>
                  <span className="font-bold text-ink tabular-nums text-sm">
                    {selectedRecord.check_in || "-"}
                  </span>
                </div>
                <div className="p-3 bg-canvas rounded-[var(--radius-control)]">
                  <span className="text-ink-muted block mb-1">Waktu Pulang</span>
                  <span className="font-bold text-ink tabular-nums text-sm">
                    {selectedRecord.check_out || "-"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Status Kehadiran</span>
                <StatusBadge status={selectedRecord.status || "Hadir"} />
              </div>

              <div className="flex items-center justify-between p-3 bg-canvas rounded-[var(--radius-control)]">
                <span className="text-ink-muted">Verifikasi Lokasi</span>
                <span className="font-semibold text-ink">
                  {selectedRecord.location || "Kantor Pusat (HQ)"}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs"
              >
                Tutup Rincian
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
