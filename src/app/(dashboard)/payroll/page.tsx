"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function PayrollPage() {
  const { hasRole } = useAuthStore();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const response = await api.get('/payslips?all=true');
        setPayslips(response.data);
      } catch (error) {
        console.error("Failed to fetch payslips");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayslips();
  }, []);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Payroll</h2>
          <p className="text-sm text-slate-500 mt-1">Manage salary processing, tax configurations, and payslip generation.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 text-sm">
            <span className="material-symbols-outlined text-[18px]">download</span> Export
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2 text-sm">
            <span className="material-symbols-outlined text-[18px]">play_arrow</span> Run Payroll
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Payroll", value: "Rp 2.4B", sub: "October 2023", icon: "account_balance", color: "indigo" },
          { label: "Avg. Net Salary", value: "Rp 8.5M", sub: "Per employee", icon: "trending_up", color: "emerald" },
          { label: "Tax Deductions", value: "Rp 320M", sub: "PPh 21", icon: "receipt_long", color: "amber" },
          { label: "BPJS Total", value: "Rp 180M", sub: "JHT + JKK + JKM + JP", icon: "health_and_safety", color: "rose" },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.label}</p>
              <div className={`w-8 h-8 rounded-lg bg-${card.color}-50 flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-${card.color}-600 text-[18px]`}>{card.icon}</span>
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-slate-900">{card.value}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">Payroll Records — October 2023</h3>
          <div className="flex gap-2">
            <select className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>October 2023</option>
              <option>September 2023</option>
              <option>August 2023</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Employee","Basic Salary","Allowances","Deductions","Net Salary","Status"].map((h, i) => (
                  <th key={h} className={`py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i >= 1 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">Loading payroll data...</td>
                </tr>
              ) : payslips.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{row.user?.name}</p>
                      <p className="text-xs text-slate-400">{row.user?.position || "Employee"}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-right tabular-nums">{formatIDR(row.basic_salary)}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-right tabular-nums">+{formatIDR(row.allowances)}</td>
                  <td className="px-6 py-4 text-sm text-rose-500 text-right tabular-nums">-{formatIDR(row.deductions)}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right tabular-nums">{formatIDR(row.net_salary)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      row.status === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
