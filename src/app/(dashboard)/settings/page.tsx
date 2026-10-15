"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  Settings,
  Building,
  Percent,
  HeartPulse,
  ShieldAlert,
  Save,
  CheckCircle2,
  Clock,
  Layers,
  Info,
} from "lucide-react";

export default function SettingsPage() {
  const { hasRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"general" | "departments" | "tax" | "bpjs" | "roles">("general");
  const [savedNotice, setSavedNotice] = useState(false);

  // Role permissions check per brief §8.9: Tab Pajak/BPJS hanya untuk Finance / Super Admin
  const canAccessFinancialSettings = hasRole(["finance", "super_admin"]);

  // Form states
  const [companyName, setCompanyName] = useState("PT Synchrow Teknologi Indonesia");
  const [workStartTime, setWorkStartTime] = useState("08:30");
  const [workEndTime, setWorkEndTime] = useState("17:30");
  const [timeZone, setTimeZone] = useState("Asia/Jakarta (WIB)");

  // Tax states
  const [taxMethod, setTaxMethod] = useState("single_rate");
  const [singleTaxRate, setSingleTaxRate] = useState("5");
  const [effectiveDate, setEffectiveDate] = useState("2026-11-01");

  // BPJS states
  const [bpjsKesEmployer, setBpjsKesEmployer] = useState("4.0");
  const [bpjsKesEmployee, setBpjsKesEmployee] = useState("1.0");
  const [bpjsJhtEmployer, setBpjsJhtEmployer] = useState("3.7");
  const [bpjsJhtEmployee, setBpjsJhtEmployee] = useState("2.0");
  const [bpjsJpEmployer, setBpjsJpEmployer] = useState("2.0");
  const [bpjsJpEmployee, setBpjsJpEmployee] = useState("1.0");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-line">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Pengaturan Sistem</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Konfigurasi parameter operasional, tarif regulasi pajak, dan skema iuran BPJS.
          </p>
        </div>
      </div>

      {savedNotice && (
        <div className="p-4 bg-success-soft border border-success/20 rounded-[var(--radius-card)] text-xs text-success flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>Pengaturan dan tanggal efektif berhasil disimpan ke dalam sistem.</span>
        </div>
      )}

      {/* ─── Navigation Tabs (Design brief §8.9) ─── */}
      <div className="flex items-center gap-1.5 p-1 bg-surface border border-line rounded-[var(--radius-card)] w-fit overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-3.5 py-2 rounded-[var(--radius-control)] text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "general"
              ? "bg-accent-soft text-accent"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Settings size={15} />
          <span>Umum</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("departments")}
          className={`px-3.5 py-2 rounded-[var(--radius-control)] text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "departments"
              ? "bg-accent-soft text-accent"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Building size={15} />
          <span>Departemen</span>
        </button>

        {canAccessFinancialSettings && (
          <>
            <button
              type="button"
              onClick={() => setActiveTab("tax")}
              className={`px-3.5 py-2 rounded-[var(--radius-control)] text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "tax"
                  ? "bg-accent-soft text-accent"
                  : "text-ink-muted hover:text-ink hover:bg-canvas"
              }`}
            >
              <Percent size={15} />
              <span>Pajak (PPh 21)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bpjs")}
              className={`px-3.5 py-2 rounded-[var(--radius-control)] text-xs font-semibold flex items-center gap-2 transition-all ${
                activeTab === "bpjs"
                  ? "bg-accent-soft text-accent"
                  : "text-ink-muted hover:text-ink hover:bg-canvas"
              }`}
            >
              <HeartPulse size={15} />
              <span>BPJS & Jaminan</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("roles")}
          className={`px-3.5 py-2 rounded-[var(--radius-control)] text-xs font-semibold flex items-center gap-2 transition-all ${
            activeTab === "roles"
              ? "bg-accent-soft text-accent"
              : "text-ink-muted hover:text-ink hover:bg-canvas"
          }`}
        >
          <Layers size={15} />
          <span>Role & Hak Akses</span>
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <form onSubmit={handleSave} className="bg-surface border border-line rounded-[var(--radius-card)] p-6 space-y-6">
        {/* Tab 1: Umum */}
        {activeTab === "general" && (
          <div className="space-y-5 max-w-xl">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Informasi Organisasi & Jam Kerja</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Standar jam masuk kantor dan toleransi presensi biometrik.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Nama Perusahaan / Entitas Legal</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Jam Masuk Kantor</label>
                <input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Jam Pulang Kantor</label>
                <input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1.5">Zona Waktu Sistem</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB / UTC+7)</option>
                <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA / UTC+8)</option>
                <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT / UTC+9)</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 2: Departemen */}
        {activeTab === "departments" && (
          <div className="space-y-4">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Struktur Departemen & Divisi</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Pengelompokan karyawan untuk hierarki persetujuan cuti dan log presensi.
              </p>
            </div>

            <div className="divide-y divide-line border border-line rounded-[var(--radius-control)] overflow-hidden text-xs">
              {[
                { name: "Engineering & Technology", lead: "Budi Santoso", count: "42 Karyawan" },
                { name: "Product & UI/UX Design", lead: "Maya Putri", count: "18 Karyawan" },
                { name: "Operasional & Fasilitas", lead: "Ahmad Rizky", count: "35 Karyawan" },
                { name: "Human Resources", lead: "Rina Kusuma", count: "8 Karyawan" },
                { name: "Finance & Pajak", lead: "Dewi Lestari", count: "6 Karyawan" },
              ].map((dept, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between hover:bg-canvas/40">
                  <div>
                    <p className="font-semibold text-ink">{dept.name}</p>
                    <p className="text-ink-muted mt-0.5">Kepala Dept: {dept.lead}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-canvas border border-line rounded-full font-medium text-ink-muted">
                    {dept.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pajak PPh 21 (Finance & Super Admin Only) */}
        {activeTab === "tax" && canAccessFinancialSettings && (
          <div className="space-y-5 max-w-xl">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Konfigurasi Perhitungan Pajak PPh 21</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Setiap perubahan tarif akan diberlakukan pada siklus payroll berikutnya.
              </p>
            </div>

            <div className="p-3.5 bg-warning-soft/70 border border-warning/30 rounded-[var(--radius-control)] text-xs text-warning flex items-start gap-2.5">
              <Info size={16} className="shrink-0 mt-0.5" />
              <span>
                Catatan Regulasi: Sistem saat ini menerapkan skema tarif tunggal. Formulasi tarif progresif TER (Tarif Efektif Rata-rata) PP 58/2023 tersedia di roadmap modul payroll.
              </span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-ink">Metode Pajak</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 border border-accent bg-accent-soft/30 rounded-[var(--radius-control)] cursor-pointer text-xs font-semibold text-accent">
                  <input
                    type="radio"
                    name="taxMethod"
                    checked={taxMethod === "single_rate"}
                    onChange={() => setTaxMethod("single_rate")}
                    className="accent-accent"
                  />
                  <span>Tarif Tunggal Sederhana</span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-line bg-canvas rounded-[var(--radius-control)] cursor-pointer text-xs font-medium text-ink-muted">
                  <input
                    type="radio"
                    name="taxMethod"
                    disabled
                    className="accent-accent"
                  />
                  <span>Tarif Progresif TER (Segera)</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Tarif Pajak Efektif (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={singleTaxRate}
                  onChange={(e) => setSingleTaxRate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">Tanggal Efektif Berlaku</label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: BPJS (Finance & Super Admin Only) */}
        {activeTab === "bpjs" && canAccessFinancialSettings && (
          <div className="space-y-5 max-w-xl">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Tarif Iuran BPJS Kesehatan & Ketenagakerjaan</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Proporsi potongan iuran antara tanggungan perusahaan dan pemotongan gaji karyawan.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* BPJS Kesehatan */}
              <div className="p-4 bg-canvas border border-line rounded-[var(--radius-control)] space-y-3">
                <span className="font-bold text-ink block">BPJS Kesehatan (Total 5%)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-ink-muted block mb-1">Tanggungan Perusahaan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsKesEmployer}
                      onChange={(e) => setBpjsKesEmployer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block mb-1">Potongan Karyawan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsKesEmployee}
                      onChange={(e) => setBpjsKesEmployee(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* BPJS Ketenagakerjaan JHT */}
              <div className="p-4 bg-canvas border border-line rounded-[var(--radius-control)] space-y-3">
                <span className="font-bold text-ink block">BPJS Ketenagakerjaan — Jaminan Hari Tua (JHT Total 5.7%)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-ink-muted block mb-1">Tanggungan Perusahaan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsJhtEmployer}
                      onChange={(e) => setBpjsJhtEmployer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block mb-1">Potongan Karyawan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsJhtEmployee}
                      onChange={(e) => setBpjsJhtEmployee(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                </div>
              </div>

              {/* BPJS Jaminan Pensiun */}
              <div className="p-4 bg-canvas border border-line rounded-[var(--radius-control)] space-y-3">
                <span className="font-bold text-ink block">BPJS Ketenagakerjaan — Jaminan Pensiun (JP Total 3%)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-ink-muted block mb-1">Tanggungan Perusahaan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsJpEmployer}
                      onChange={(e) => setBpjsJpEmployer(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                  <div>
                    <label className="text-ink-muted block mb-1">Potongan Karyawan (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={bpjsJpEmployee}
                      onChange={(e) => setBpjsJpEmployee(e.target.value)}
                      className="w-full px-3 py-1.5 bg-surface border border-line rounded-[var(--radius-control)] text-xs text-ink"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Role & Akses */}
        {activeTab === "roles" && (
          <div className="space-y-4 text-xs">
            <div className="border-b border-line pb-3">
              <h2 className="text-base font-bold text-ink">Matriks Wewenang & Hak Akses (Role-Based Access)</h2>
              <p className="text-ink-muted mt-0.5">
                Konfigurasi kontrol akses sesuai dengan standar keamanan data Synchrow HRIS (§6.2).
              </p>
            </div>

            <div className="border border-line rounded-[var(--radius-control)] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-canvas/50 border-b border-line">
                    <th className="py-2.5 px-4 font-semibold text-ink-muted">Modul Sistem</th>
                    <th className="py-2.5 px-4 font-semibold text-ink-muted text-center">Employee</th>
                    <th className="py-2.5 px-4 font-semibold text-ink-muted text-center">Dept. Manager</th>
                    <th className="py-2.5 px-4 font-semibold text-ink-muted text-center">HR Admin</th>
                    <th className="py-2.5 px-4 font-semibold text-ink-muted text-center">Finance</th>
                    <th className="py-2.5 px-4 font-semibold text-ink-muted text-center">Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {[
                    { module: "Dashboard & Ringkasan", emp: "✓", mgr: "✓", hr: "✓", fin: "✓", sa: "✓" },
                    { module: "Absensi Kamera Biometrik", emp: "✓", mgr: "✓", hr: "✓", fin: "–", sa: "✓" },
                    { module: "Log Presensi Departemen", emp: "–", mgr: "✓ (Dept)", hr: "✓", fin: "–", sa: "✓" },
                    { module: "Pengajuan Cuti Pribadi", emp: "✓", mgr: "✓", hr: "✓", fin: "–", sa: "✓" },
                    { module: "Manajemen Cuti Karyawan", emp: "–", mgr: "✓ (Dept)", hr: "✓", fin: "–", sa: "✓" },
                    { module: "Slip Gaji Saya", emp: "✓", mgr: "✓", hr: "✓", fin: "✓", sa: "✓" },
                    { module: "Payroll Engine & Gaji Perusahaan", emp: "–", mgr: "–", hr: "– (Terisolasi)", fin: "✓", sa: "✓" },
                    { module: "Manajemen Data Karyawan", emp: "–", mgr: "–", hr: "✓ (Tanpa Gaji)", fin: "–", sa: "✓" },
                    { module: "Konfigurasi Tarif Pajak & BPJS", emp: "–", mgr: "–", hr: "–", fin: "✓", sa: "✓" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-canvas/20">
                      <td className="py-2.5 px-4 font-medium text-ink">{row.module}</td>
                      <td className="py-2.5 px-4 text-center text-ink-muted">{row.emp}</td>
                      <td className="py-2.5 px-4 text-center text-ink-muted">{row.mgr}</td>
                      <td className="py-2.5 px-4 text-center text-ink font-semibold">{row.hr}</td>
                      <td className="py-2.5 px-4 text-center text-accent font-semibold">{row.fin}</td>
                      <td className="py-2.5 px-4 text-center text-success font-semibold">{row.sa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex justify-end pt-3 border-t border-line">
          <Button
            type="submit"
            className="bg-accent hover:bg-accent/90 text-white rounded-[var(--radius-control)] h-9 text-xs font-semibold gap-1.5"
          >
            <Save size={14} />
            Simpan Perubahan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
