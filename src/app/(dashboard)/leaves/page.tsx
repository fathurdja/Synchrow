"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function LeavesPage() {
  const { hasRole, user } = useAuthStore();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const isManager = hasRole(['super_admin', 'hr_admin', 'dept_manager']);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const endpoint = isManager ? '/leaves?all=1' : '/leaves';
      const response = await api.get(endpoint);
      setLeaves(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'Approved' | 'Rejected') => {
    if (!confirm(`Are you sure you want to ${status.toLowerCase()} this leave request?`)) return;
    
    try {
      await api.post(`/leaves/${id}/status`, { status });
      // update local
      setLeaves(leaves.map(l => l.id === id ? { ...l, status } : l));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Leaves Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            {isManager ? "Review and manage employee leave requests." : "Track and submit your time off requests."}
          </p>
        </div>
        {!isManager && (
          <Button className="bg-brand-secondary hover:bg-brand-primary shadow-sm gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span>
            Request Leave
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {isManager && <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employee</th>}
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                {isManager && <th className="py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={isManager ? 6 : 4} className="py-8 text-center text-sm text-slate-500">Loading leave requests...</td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 6 : 4} className="py-8 text-center text-sm text-slate-500">No leave requests found.</td>
                </tr>
              ) : leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/50">
                  {isManager && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {leave.user?.avatar ? (
                          <img className="w-8 h-8 rounded-full object-cover" alt={leave.user.name} src={leave.user.avatar} />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                            {leave.user?.name?.charAt(0) || '?'}
                          </div>
                        )}
                        <span className="text-sm font-semibold text-slate-900">{leave.user?.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {leave.type}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                    {leave.reason}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                      leave.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                      'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  {isManager && (
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleUpdateStatus(leave.id, 'Approved')} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[18px]">check</span>
                          </button>
                          <button onClick={() => handleUpdateStatus(leave.id, 'Rejected')} className="text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 p-1.5 rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-[18px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Resolved</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
