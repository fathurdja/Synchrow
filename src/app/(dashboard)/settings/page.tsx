"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function SettingsPage() {
  const { user, roles } = useAuthStore();
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Employee Profile</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and documents.</p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Profile Card */}
        <div className="col-span-1 md:col-span-4 flex flex-col gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center h-fit">
            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 ring-4 ring-indigo-50 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-3xl">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1">{user?.name || "Employee Name"}</h3>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full capitalize">
              {roles && roles.length > 0 ? roles[0].replace('_', ' ') : "Employee"}
            </span>

            <div className="w-full mt-6 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="material-symbols-outlined text-slate-400">badge</span>
                <span>NIP: NX-2026-000</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <span className="material-symbols-outlined text-slate-400">mail</span>
                <span className="truncate">{user?.email || "email@example.com"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Actions</h4>
            <div className="flex flex-col gap-3">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2 justify-center">
                <span className="material-symbols-outlined text-[18px]">edit</span> Update Profile
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-center">
                <span className="material-symbols-outlined text-[18px]">folder</span> My Documents
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Details */}
        <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
          {/* Employment Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">work</span>
              Employment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
              {[
                { label: "Division", value: "Product & Engineering" },
                { label: "Department", value: "User Experience" },
                { label: "Join Date", value: "August 15, 2021" },
                { label: "Employment Type", value: "Full-Time Permanent" },
                { label: "Direct Manager", value: "David Chen" },
                { label: "Work Location", value: "HQ - New York (Hybrid)" },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-sm text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Payslips */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">request_quote</span>
                Monthly Payslips
              </h4>
              <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {["Period","Status","Date Issued","Action"].map((h, i) => (
                      <th key={h} className={`py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i===3?'text-right':''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { period: "October 2023", date: "Oct 31, 2023" },
                    { period: "September 2023", date: "Sep 30, 2023" },
                    { period: "August 2023", date: "Aug 31, 2023" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-6 text-sm font-medium text-slate-900">{row.period}</td>
                      <td className="py-3 px-6">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">Paid</span>
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-500">{row.date}</td>
                      <td className="py-3 px-6 text-right">
                        <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                          <span className="material-symbols-outlined text-[16px]">download</span> PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
