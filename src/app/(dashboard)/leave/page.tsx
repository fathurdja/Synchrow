"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function LeavePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">My Leave</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your time off and view leave history.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2" onClick={() => setShowModal(true)}>
          <span className="material-symbols-outlined text-[20px]">add</span>
          Request Leave
        </Button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Cards */}
        <div className="space-y-6 lg:col-span-1">
          {/* Annual Leave Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="flex justify-between items-start mb-4 relative">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <span className="material-symbols-outlined">beach_access</span>
              </div>
              <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider">Available</span>
            </div>
            <h3 className="text-sm text-slate-500 mb-1">Annual Leave</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900 tabular-nums">14</span>
              <span className="text-sm text-slate-400">Days</span>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "70%" }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">6 days used</p>
          </div>

          {/* Sick Leave Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
            <div className="flex justify-between items-start mb-4 relative">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <span className="material-symbols-outlined">medical_services</span>
              </div>
              <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider">Available</span>
            </div>
            <h3 className="text-sm text-slate-500 mb-1">Sick Leave</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-slate-900 tabular-nums">5</span>
              <span className="text-sm text-slate-400">Days</span>
            </div>
            <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "50%" }}></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-right">5 days used</p>
          </div>
        </div>

        {/* Calendar (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Schedule</h3>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_left</span></button>
              <span className="text-sm font-semibold text-slate-900 px-3">October 2023</span>
              <button className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors"><span className="material-symbols-outlined text-[20px]">chevron_right</span></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200">
            {/* Days Header */}
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
              <div key={d} className="bg-slate-50 py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
            {/* Row 1 */}
            {[1,2,3,4,5,6,7].map(d => (
              <div key={d} className={`bg-white min-h-[72px] p-2 flex flex-col ${d===1||d===7 ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="text-xs font-medium">{d}</span>
              </div>
            ))}
            {/* Row 2 */}
            {[8,9,10,11,12,13,14].map(d => (
              <div key={d} className={`bg-white min-h-[72px] p-2 flex flex-col relative ${d===8||d===14 ? 'text-slate-300' : 'text-slate-700'}`}>
                <span className="text-xs font-medium">{d}</span>
                {d === 9 && <div className="mt-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] px-1.5 py-0.5 rounded truncate">Annual (Pending)</div>}
                {d === 12 && <div className="mt-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] px-1.5 py-0.5 rounded truncate">Sick Leave</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-200 border border-indigo-300"></div><span className="text-xs text-slate-500">Approved</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300"></div><span className="text-xs text-slate-500">Pending</span></div>
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-semibold text-slate-900">Leave History</h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline flex items-center gap-1">View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Leave Type","Duration","Days","Applied On","Status","Action"].map((h, i) => (
                  <th key={h} className={`py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i===5 ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { type: "Annual Leave", icon: "beach_access", color: "indigo", duration: "Oct 9 - Oct 10, 2023", days: 2, applied: "Oct 1, 2023", status: "Pending", statusColor: "amber" },
                { type: "Sick Leave", icon: "medical_services", color: "emerald", duration: "Sep 15, 2023", days: 1, applied: "Sep 15, 2023", status: "Approved", statusColor: "emerald" },
                { type: "Annual Leave", icon: "beach_access", color: "indigo", duration: "Aug 2 - Aug 5, 2023", days: 4, applied: "Jul 10, 2023", status: "Rejected", statusColor: "rose" },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${row.color}-50 flex items-center justify-center text-${row.color}-600`}>
                        <span className="material-symbols-outlined text-[18px]">{row.icon}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900">{row.type}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-500">{row.duration}</td>
                  <td className="py-3 px-6 text-sm text-slate-500">{row.days}</td>
                  <td className="py-3 px-6 text-sm text-slate-500">{row.applied}</td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-${row.statusColor}-50 text-${row.statusColor}-600 border border-${row.statusColor}-200 uppercase tracking-wider`}>{row.status}</span>
                  </td>
                  <td className="py-3 px-6 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="relative bg-white rounded-xl overflow-hidden shadow-xl max-w-lg w-full border border-slate-200 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-900">Request Leave</h3>
                <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowModal(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Leave Type *</label>
                  <select className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2.5 bg-white">
                    <option>Select leave type</option>
                    <option>Annual Leave (Balance: 14)</option>
                    <option>Sick Leave (Balance: 5)</option>
                    <option>Unpaid Leave</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date *</label>
                    <input className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2.5" type="date" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date *</label>
                    <input className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2.5" type="date" />
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 flex items-center justify-between border border-indigo-100">
                  <span className="text-sm font-medium text-indigo-800">Total Duration</span>
                  <span className="text-lg font-bold text-indigo-700">0 Days</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Reason for Leave *</label>
                  <textarea className="block w-full rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-3 py-2.5" placeholder="Please provide brief details..." rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Attachment (Optional)</label>
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors bg-slate-50 cursor-pointer">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-slate-400 text-[32px]">cloud_upload</span>
                      <div className="flex text-sm text-slate-500 justify-center mt-1">
                        <span className="text-indigo-600 font-medium hover:text-indigo-500">Upload a file</span>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm">Submit Request</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
