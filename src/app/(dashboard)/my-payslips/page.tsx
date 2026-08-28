"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function MyPayslipsPage() {
  const { user } = useAuthStore();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyPayslips = async () => {
      try {
        const response = await api.get(`/my-payslips`);
        setPayslips(response.data);
      } catch (error) {
        console.error("Failed to fetch my payslips", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPayslips();
  }, []);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
  };

  const handleDownloadPdf = async (period: string) => {
    try {
      const response = await api.get(`/ess/payslip/${period}`, { responseType: 'blob' });
      // In a real scenario with dompdf, this returns a PDF blob.
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${period}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Failed to download payslip", error);
      alert('Failed to download payslip.');
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">My Payslips</h2>
          <p className="text-sm text-slate-500 mt-1">View and download your monthly salary slips.</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">Payslip History</h3>
          </div>
          <div className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-slate-500">Loading your payslips...</div>
            ) : payslips.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">No payslips available yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payslips.map((slip) => (
                  <div key={slip.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <span className="material-symbols-outlined">receipt_long</span>
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-slate-900">Periode {slip.period}</h4>
                        <p className="text-sm text-slate-500">Gaji Bersih: <span className="font-bold text-slate-700">{formatIDR(slip.net_salary)}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                      <div className="text-xs text-slate-400 hidden md:block text-right">
                        <div>Basic: {formatIDR(slip.basic_salary)}</div>
                        <div>Allowances: +{formatIDR(slip.total_allowance)}</div>
                      </div>
                      
                      <Button 
                        onClick={() => handleDownloadPdf(slip.period)}
                        variant="outline" 
                        className="w-full sm:w-auto border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                        Download PDF
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
