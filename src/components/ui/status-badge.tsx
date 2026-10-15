"use client";

import { CheckCircle, XCircle, Clock, Hourglass, Calendar, File, Loader, AlertTriangle, ScanFace } from "lucide-react";
import { ReactNode } from "react";

// ─── Design Brief §7.1 — Universal status dictionary ───

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusConfig {
  variant: StatusVariant;
  icon: ReactNode;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  // Attendance
  Present:   { variant: "success", icon: <CheckCircle size={14} />, label: "Hadir" },
  Hadir:     { variant: "success", icon: <CheckCircle size={14} />, label: "Hadir" },
  Late:      { variant: "warning", icon: <Clock size={14} />,       label: "Terlambat" },
  Terlambat: { variant: "warning", icon: <Clock size={14} />,       label: "Terlambat" },
  Alpha:     { variant: "danger",  icon: <XCircle size={14} />,     label: "Alpha" },
  Leave:     { variant: "info",    icon: <Calendar size={14} />,    label: "Cuti" },
  Cuti:      { variant: "info",    icon: <Calendar size={14} />,    label: "Cuti" },

  // Leave requests
  Pending:   { variant: "warning", icon: <Hourglass size={14} />,   label: "Menunggu" },
  Menunggu:  { variant: "warning", icon: <Hourglass size={14} />,   label: "Menunggu" },
  Approved:  { variant: "success", icon: <CheckCircle size={14} />, label: "Disetujui" },
  Disetujui: { variant: "success", icon: <CheckCircle size={14} />, label: "Disetujui" },
  Rejected:  { variant: "danger",  icon: <XCircle size={14} />,     label: "Ditolak" },
  Ditolak:   { variant: "danger",  icon: <XCircle size={14} />,     label: "Ditolak" },

  // Payroll
  Draft:     { variant: "neutral", icon: <File size={14} />,            label: "Draf" },
  Processing:{ variant: "info",    icon: <Loader size={14} className="animate-spin" />, label: "Diproses" },
  Completed: { variant: "success", icon: <CheckCircle size={14} />,     label: "Selesai" },
  Failed:    { variant: "danger",  icon: <AlertTriangle size={14} />,   label: "Gagal" },
  Paid:      { variant: "success", icon: <CheckCircle size={14} />,     label: "Dibayar" },

  // Face
  Registered:    { variant: "success", icon: <ScanFace size={14} />, label: "Terdaftar" },
  "Not Registered": { variant: "warning", icon: <ScanFace size={14} />, label: "Belum terdaftar" },

  // Employment
  Active:    { variant: "success", icon: <CheckCircle size={14} />, label: "Aktif" },
  "On Leave":{ variant: "warning", icon: <Calendar size={14} />,   label: "Cuti" },
  Inactive:  { variant: "neutral", icon: <XCircle size={14} />,    label: "Nonaktif" },
};

const VARIANT_CLASSES: Record<StatusVariant, string> = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger:  "bg-danger-soft text-danger border-danger/20",
  info:    "bg-info-soft text-info border-info/20",
  neutral: "bg-canvas text-ink-muted border-line",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const config = STATUS_MAP[status] || {
    variant: "neutral" as StatusVariant,
    icon: null,
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${VARIANT_CLASSES[config.variant]} ${className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
