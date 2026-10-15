"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Users,
  Search,
  Filter,
  UserCheck,
  ScanFace,
  ShieldAlert,
  X,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Building,
  KeyRound,
  RefreshCw,
} from "lucide-react";

interface EmployeeUser {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  department?: string;
  roles?: { name: string }[];
  face_descriptor?: string | null;
  status?: string;
}

export default function EmployeesPage() {
  const { hasRole } = useAuthStore();
  const [users, setUsers] = useState<EmployeeUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedFaceStatus, setSelectedFaceStatus] = useState("all");

  // Edit / Details modal
  const [selectedUser, setSelectedUser] = useState<EmployeeUser | null>(null);
  const [newRole, setNewRole] = useState("");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.users || []);
      setRoles(response.data.available_roles || ["employee", "dept_manager", "hr_admin", "finance", "super_admin"]);
    } catch (err: any) {
      console.error("Gagal memuat daftar karyawan:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newRole) return;

    if (
      !confirm(
        `Konfirmasi perubahan peran untuk ${selectedUser.name} menjadi ${newRole.replace("_", " ").toUpperCase()}?`
      )
    )
      return;

    setIsUpdatingRole(true);
    try {
      await api.post(`/users/${selectedUser.id}/role`, { role: newRole });
      setUsers(
        users.map((u) => {
          if (u.id === selectedUser.id) {
            return { ...u, roles: [{ name: newRole }] };
          }
          return u;
        })
      );
      setSelectedUser({ ...selectedUser, roles: [{ name: newRole }] });
      alert("Peran karyawan berhasil diperbarui.");
    } catch (err: any) {
      alert(err.response?.data?.error || "Gagal memperbarui peran.");
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Filtered employees
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !searchQuery ||
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "all" || (u.department || "Operasional").toLowerCase() === selectedDept.toLowerCase();

    const currentRole = u.roles?.[0]?.name || "employee";
    const matchesRole = selectedRole === "all" || currentRole.toLowerCase() === selectedRole.toLowerCase();

    const hasFace = !!u.face_descriptor;
    const matchesFace =
      selectedFaceStatus === "all"
        ? true
        : selectedFaceStatus === "registered"
        ? hasFace
        : !hasFace;

    return matchesSearch && matchesDept && matchesRole && matchesFace;
  });

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Data Karyawan</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Manajemen personalia, struktur divisi, dan registrasi biometrik wajah karyawan.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-surface border border-line px-3 py-1.5 rounded-[var(--radius-control)] text-xs text-ink-muted">
          <ShieldAlert size={14} className="text-accent" />
          <span>Privasi aktif: Data finansial diisolasi</span>
        </div>
      </div>

      {/* ─── Filters & Search Toolbar (Design brief §8.8) ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] p-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama atau email karyawan..."
            className="w-full pl-9 pr-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        {/* Departemen Filter */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
          className="px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">Semua Departemen</option>
          <option value="engineering">Engineering</option>
          <option value="product">Product</option>
          <option value="operasional">Operasional</option>
          <option value="human resources">Human Resources</option>
          <option value="finance">Keuangan</option>
        </select>

        {/* Role Filter */}
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">Semua Peran</option>
          <option value="employee">Employee</option>
          <option value="dept_manager">Dept. Manager</option>
          <option value="hr_admin">HR Admin</option>
          <option value="finance">Finance Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>

        {/* Face Status Filter */}
        <select
          value={selectedFaceStatus}
          onChange={(e) => setSelectedFaceStatus(e.target.value)}
          className="px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
        >
          <option value="all">Semua Status Wajah</option>
          <option value="registered">Terdaftar</option>
          <option value="unregistered">Belum Terdaftar</option>
        </select>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-surface border border-line rounded-[var(--radius-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-canvas/30">
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Foto & Nama</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Departemen</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Peran / Hak Akses</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Status Biometrik Wajah</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted">Status Akun</th>
                <th className="py-3 px-5 text-xs font-semibold text-ink-muted text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-5">
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12">
                    <EmptyState
                      icon={<Users size={24} />}
                      title="Tidak ditemukan karyawan yang cocok dengan kriteria pencarian."
                    />
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleName = u.roles?.[0]?.name || "employee";
                  const isFaceRegistered = !!u.face_descriptor;

                  return (
                    <tr
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setNewRole(roleName);
                      }}
                      className="hover:bg-canvas/40 transition-colors cursor-pointer group"
                    >
                      {/* Foto & Nama */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-9 h-9 rounded-full object-cover ring-1 ring-line"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-xs ring-1 ring-line">
                              {u.name?.charAt(0) || "?"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-ink group-hover:text-accent transition-colors leading-tight">
                              {u.name}
                            </p>
                            <p className="text-[11px] text-ink-muted leading-tight mt-0.5">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Departemen */}
                      <td className="py-3.5 px-5 text-xs text-ink-muted">
                        {u.department || "Operasional"}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-5">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-canvas text-ink border border-line capitalize">
                          {roleName.replace("_", " ")}
                        </span>
                      </td>

                      {/* Status Biometrik Wajah */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status={isFaceRegistered ? "Registered" : "Not Registered"} />
                      </td>

                      {/* Status Akun */}
                      <td className="py-3.5 px-5">
                        <StatusBadge status="Active" />
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(u);
                            setNewRole(roleName);
                          }}
                          className="p-1.5 text-ink-muted hover:text-accent hover:bg-accent-soft rounded-[var(--radius-control)] transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Sheet / Modal Detail & Ubah Role Karyawan (§8.8) ─── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface border border-line rounded-[var(--radius-panel)] max-w-lg w-full p-6 shadow-xl space-y-5 animate-scale-up">
            <div className="flex items-start justify-between border-b border-line pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-base">
                  {selectedUser.name?.charAt(0) || "K"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">{selectedUser.name}</h3>
                  <p className="text-xs text-ink-muted">{selectedUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-ink-muted hover:text-ink rounded-[var(--radius-control)] hover:bg-canvas transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Informasi Detail */}
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-canvas rounded-[var(--radius-control)]">
                <div>
                  <span className="text-ink-muted block mb-0.5">Departemen:</span>
                  <span className="font-semibold text-ink">{selectedUser.department || "Operasional"}</span>
                </div>
                <div>
                  <span className="text-ink-muted block mb-0.5">Status Akun:</span>
                  <span className="font-semibold text-success">Aktif</span>
                </div>
              </div>

              {/* Status Wajah */}
              <div className="p-3 bg-canvas rounded-[var(--radius-control)] flex items-center justify-between">
                <div>
                  <span className="text-ink-muted block mb-0.5">Status Biometrik Wajah:</span>
                  <span className="font-semibold text-ink">
                    {selectedUser.face_descriptor ? "Descriptor tersimpan aman di sistem" : "Belum melakukan registrasi wajah"}
                  </span>
                </div>
                <StatusBadge status={selectedUser.face_descriptor ? "Registered" : "Not Registered"} />
              </div>

              {/* Form Ubah Role */}
              <form onSubmit={handleRoleChangeSubmit} className="pt-2 space-y-3 border-t border-line">
                <div className="flex items-center gap-2 text-ink font-semibold">
                  <KeyRound size={15} className="text-accent" />
                  <span>Kelola Peran & Hak Akses Pengguna</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-ink-muted">Pilih Peran Baru:</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    {roles.map((r: any) => {
                      const name = typeof r === "string" ? r : r.name;
                      return (
                        <option key={name} value={name}>
                          {name.replace("_", " ").toUpperCase()}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    className="h-9 text-xs rounded-[var(--radius-control)]"
                  >
                    Tutup
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdatingRole}
                    className="h-9 text-xs bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)]"
                  >
                    {isUpdatingRole ? "Menyimpan..." : "Simpan Perubahan Peran"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
