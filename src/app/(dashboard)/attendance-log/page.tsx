"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function AttendanceLogPage() {
  const { hasRole } = useAuthStore();
  const router = useRouter();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Protect this page: only managers/admins can view
  useEffect(() => {
    if (!hasRole(['super_admin', 'hr_admin', 'dept_manager'])) {
      router.push('/dashboard');
      return;
    }
    fetchAttendances();
  }, [hasRole, router]);

  const fetchAttendances = async () => {
    try {
      // ?all=1 fetches all users' attendances for managers
      const response = await api.get('/attendances?all=1');
      setAttendances(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasRole(['super_admin', 'hr_admin', 'dept_manager'])) {
    return null; // Will redirect
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Employee Attendance Log</h2>
        <p className="text-sm text-slate-500 mt-1">Monitor real-time check-in and check-out logs for all employees.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check In</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Check Out</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Location</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">Loading records...</td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">No attendance records found. (Start checking in!)</td>
                </tr>
              ) : (
                attendances.map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {att.user?.avatar ? (
                          <img className="w-8 h-8 rounded-full object-cover" alt={att.user?.name} src={att.user?.avatar} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                            {att.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-900">{att.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {new Date(att.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{att.check_in || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className="font-medium text-slate-800">{att.check_out || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {att.location || 'Office'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        att.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                        att.status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                        'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
