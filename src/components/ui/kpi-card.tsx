"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  href?: string;
  className?: string;
}

export function KpiCard({ label, value, sub, icon, href, className = "" }: KpiCardProps) {
  const content = (
    <div className={`bg-surface border border-line rounded-[var(--radius-card)] p-5 flex flex-col justify-between group transition-colors duration-150 ${href ? "hover:border-accent/40 cursor-pointer" : ""} ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-ink-muted">{label}</p>
        <div className="w-9 h-9 rounded-[var(--radius-control)] bg-accent-soft flex items-center justify-center text-accent">
          {icon}
        </div>
      </div>
      <p className="text-[32px] leading-[38px] font-semibold text-ink tabular-nums">{value}</p>
      {sub && <p className="text-xs text-ink-muted mt-1">{sub}</p>}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}
