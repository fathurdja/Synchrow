"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

export default function DashboardPage() {
  const { user, hasRole } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const isManager = hasRole(['super_admin', 'hr_admin', 'dept_manager']);

  if (isLoading) return <div className="p-8 text-slate-500">Loading dashboard...</div>;

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight leading-tight">Welcome, {user?.name}</h2>
          <p className="text-sm text-slate-500 mt-1">Today&apos;s overview and actionable items.</p>
        </div>
        <p className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded uppercase tracking-wider self-start sm:self-auto">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isManager ? (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Employees</p>
                <span className="material-symbols-outlined text-brand-primary text-xl">group</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{stats?.admin?.total_employees || 0}</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Today Attendance</p>
                <span className="material-symbols-outlined text-emerald-500 text-xl">how_to_reg</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{stats?.admin?.today_attendance || 0}</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Present (Month)</p>
                <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{stats?.personal?.present_this_month || 0}</p>
                <span className="text-sm text-slate-400">/ {stats?.personal?.total_working_days || 22}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Late (Month)</p>
                <span className="material-symbols-outlined text-amber-500 text-xl">schedule</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{stats?.personal?.late_this_month || 0}</p>
              </div>
            </div>
          </>
        )}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Leaves</p>
            <span className="material-symbols-outlined text-brand-secondary text-xl">event_available</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">{stats?.personal?.active_leaves || 0}</p>
          </div>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Attendance Overview</h3>
            <select className="border border-slate-200 rounded-lg text-sm px-3 py-1.5 text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          {/* Mock Chart */}
          <div className="flex-1 relative min-h-[240px] flex items-end justify-around px-4 gap-4 pb-8">
            {/* Y Axis */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[11px] text-slate-400 py-2">
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            {[95, 92, 98, 90, 85].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full max-w-[48px] rounded-t-md bg-indigo-600/90 hover:bg-indigo-600 transition-colors relative group cursor-pointer" style={{ height: `${val}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{val}%</div>
                </div>
                <span className="text-xs text-slate-500 font-medium">{["Mon", "Tue", "Wed", "Thu", "Fri"][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Recent Attendance</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {stats?.personal?.recent_activity?.length > 0 ? (
              stats.personal.recent_activity.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full ${item.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center shrink-0`}>
                    <span className="material-symbols-outlined text-[16px]">
                      {item.status === 'Present' ? 'login' : 'schedule'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-slate-700">
                      <span className="font-semibold text-slate-900">Checked in</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(item.date).toLocaleDateString()} • {item.check_in || '-'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No recent attendance found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leave Status (Employee view) */}
      {!isManager && stats?.personal?.recent_leave_status && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-brand-primary">notifications_active</span>
            <h3 className="text-lg font-semibold text-slate-900">Leave Request Status</h3>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-800">{stats.personal.recent_leave_status.type}</p>
              <p className="text-sm text-slate-500 mt-1">
                {new Date(stats.personal.recent_leave_status.start_date).toLocaleDateString()} - {new Date(stats.personal.recent_leave_status.end_date).toLocaleDateString()}
              </p>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              stats.personal.recent_leave_status.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
              stats.personal.recent_leave_status.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {stats.personal.recent_leave_status.status}
            </span>
          </div>
        </div>
      )}

      {/* Removed the hardcoded table as leaves/page.tsx now handles all leave requests for managers */}
    </div>
  );
}
