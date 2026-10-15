"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AmountProps {
  value: number;
  masked?: boolean;
  className?: string;
  showToggle?: boolean;
}

const formatIDR = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);

export function Amount({ value, masked: initialMasked = true, className = "", showToggle = false }: AmountProps) {
  const [masked, setMasked] = useState(initialMasked);

  return (
    <span className={`inline-flex items-center gap-1.5 tabular-nums ${className}`}>
      {masked ? "Rp ••••••" : formatIDR(value)}
      {showToggle && (
        <button
          type="button"
          onClick={() => setMasked(!masked)}
          className="text-ink-muted hover:text-accent transition-colors p-0.5 rounded"
          aria-label={masked ? "Tampilkan nominal" : "Sembunyikan nominal"}
        >
          {masked ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      )}
    </span>
  );
}

export { formatIDR };
