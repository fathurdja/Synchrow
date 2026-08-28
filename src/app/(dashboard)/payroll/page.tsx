"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PayrollPage() {
  const { hasRole } = useAuthStore();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-08");

  const fetchPayrolls = async (period: string) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/payroll?period=${period}`);
      setPayrolls(response.data);
    } catch (error) {
      console.error("Failed to fetch payrolls", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls(selectedPeriod);
  }, [selectedPeriod]);

  const handleRunPayroll = async () => {
    setIsGenerating(true);
    try {
      await api.post('/payroll/generate', { period: selectedPeriod });
      alert('Payroll generation has been dispatched to background queue.');
      setTimeout(() => fetchPayrolls(selectedPeriod), 3000);
    } catch (error: any) {
      console.error("Failed to generate payroll", error);
      alert(error.response?.data?.message || 'Failed to generate payroll.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/payroll/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_export_${selectedPeriod}.xlsx`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Failed to export", error);
      alert('Export failed. Check console.');
    }
  };

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
  };

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'finance']}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Payroll Engine</h2>
            <p className="text-sm text-slate-500 mt-1">Manage salary processing, tax configurations, and payslip generation.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 text-sm" onClick={handleExport}>
              <span className="material-symbols-outlined text-[18px]">download</span> Export Excel
            </Button>
            <Button 
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2 text-sm"
              onClick={handleRunPayroll}
              disabled={isGenerating}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isGenerating ? 'hourglass_empty' : 'play_arrow'}
              </span> 
              {isGenerating ? 'Processing...' : 'Run Payroll'}
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Payrolls", value: payrolls.length.toString(), sub: `Period: ${selectedPeriod}`, icon: "account_balance", color: "indigo" },
            { label: "Avg. Net Salary", value: formatIDR(payrolls.reduce((sum, p) => sum + Number(p.net_salary), 0) / (payrolls.length || 1)), sub: "Per employee", icon: "trending_up", color: "emerald" },
            { label: "Tax Deductions", value: formatIDR(payrolls.reduce((sum, p) => sum + Number(p.tax_amount), 0)), sub: "Total PPh 21", icon: "receipt_long", color: "amber" },
            { label: "BPJS Total", value: formatIDR(payrolls.reduce((sum, p) => sum + Number(p.bpjs_amount), 0)), sub: "JHT + JKK + JKM + JP + Kes", icon: "health_and_safety", color: "rose" },
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
            <h3 className="text-lg font-semibold text-slate-900">Payroll Records</h3>
            <div className="flex gap-2">
              <select 
                className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="2026-08">August 2026</option>
                <option value="2026-09">September 2026</option>
                <option value="2026-10">October 2026</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["Employee","Basic Salary","Allowances","Deductions","Tax (PPh21)","BPJS","Net Salary"].map((h, i) => (
                    <th key={h} className={`py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i >= 1 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-500">Loading payroll data...</td>
                  </tr>
                ) : payrolls.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-slate-500">No payroll records found for this period. Click "Run Payroll" to generate.</td>
                  </tr>
                ) : payrolls.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{row.user?.name}</p>
                        <p className="text-xs text-slate-400">{row.user?.position || "Employee"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 text-right tabular-nums">{formatIDR(row.basic_salary)}</td>
                    <td className="px-6 py-4 text-sm text-emerald-600 text-right tabular-nums">+{formatIDR(row.total_allowance)}</td>
                    <td className="px-6 py-4 text-sm text-rose-500 text-right tabular-nums">-{formatIDR(row.total_deduction)}</td>
                    <td className="px-6 py-4 text-sm text-amber-500 text-right tabular-nums">-{formatIDR(row.tax_amount)}</td>
                    <td className="px-6 py-4 text-sm text-rose-600 text-right tabular-nums">-{formatIDR(row.bpjs_amount)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right tabular-nums">{formatIDR(row.net_salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
