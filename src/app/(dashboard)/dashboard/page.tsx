import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight leading-tight">Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">Today&apos;s overview and actionable items.</p>
        </div>
        <p className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded uppercase tracking-wider self-start sm:self-auto">Tuesday, Oct 24, 2023</p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Employees */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Employees</p>
            <span className="material-symbols-outlined text-slate-300 text-xl">group</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">1,248</p>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 2.4%
            </span>
          </div>
        </div>
        {/* On-time Today */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">On-time Today</p>
            <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">1,102</p>
            <span className="text-sm text-slate-400">92%</span>
          </div>
        </div>
        {/* Late */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Late Today</p>
            <span className="material-symbols-outlined text-amber-500 text-xl">schedule</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">45</p>
            <span className="text-xs font-semibold text-rose-500 flex items-center">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 5
            </span>
          </div>
        </div>
        {/* On Leave */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">On Leave</p>
            <span className="material-symbols-outlined text-slate-300 text-xl">event_available</span>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">101</p>
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
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <button className="text-indigo-600 text-xs font-semibold hover:underline">View All</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {[
              { name: "Sarah Jenkins", action: "checked in", time: "08:55 AM • Head Office", icon: "login", color: "emerald" },
              { name: "Michael Chen", action: "late check-in", time: "09:15 AM • Branch A", icon: "schedule", color: "amber" },
              { name: "David Ross", action: "checked in", time: "08:42 AM • Head Office", icon: "login", color: "emerald" },
              { name: "Elena Rostova", action: "checked out", time: "Yesterday 18:05 PM", icon: "logout", color: "slate" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`w-8 h-8 rounded-full bg-${item.color}-50 text-${item.color}-600 flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">{item.name}</span> {item.action}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Leave Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900">Pending Leave Requests</h3>
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">3 Pending</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Jessica Alba", role: "UX Designer", type: "Annual Leave", duration: "Oct 26 - Oct 28 (3 days)", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCm7M5XYMWpKWnGQZkEmdE3kxlRwYYcq0Aq-DhQTKW9RIHVQxvk-YXc7sfXgTeYDC5-P43DsHUne1Y8Uy_hjwC0r6QucHgI8wPpme21aqHXWPsRu1lAvV1g5RyRoRnGUSP_eNcXRugEenszkjxfKtFpMSXVJPfoDqADtdEKTglPAYrKaveLY89O9V2F9d52i2bCXpb9tpGnvCuUwmiNslDopZ3pmnqO1Ek8qBi7tybqw5PXKFDHn_BHVg" },
                { name: "Tom Riddle", role: "Backend Dev", type: "Sick Leave", duration: "Oct 24 (1 day)", initials: "TR" },
              ].map((row, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {row.avatar ? (
                        <img className="w-8 h-8 rounded-full object-cover" alt={row.name} src={row.avatar} />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{row.initials}</div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{row.name}</p>
                        <p className="text-xs text-slate-400">{row.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{row.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{row.duration}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200 uppercase tracking-wider">Pending</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 text-xs h-8">Approve</Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">Reject</Button>
                    </div>
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
