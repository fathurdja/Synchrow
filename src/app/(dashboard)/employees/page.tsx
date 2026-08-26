"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export default function EmployeesPage() {
  const { hasRole } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data.users);
        setRoles(response.data.available_roles);
      } catch (err) {
        console.error("Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!confirm("Are you sure you want to change this user's role?")) return;
    
    try {
      await api.post(`/users/${userId}/role`, { role: newRole });
      // Update local state
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { ...u, roles: [{ name: newRole }] };
        }
        return u;
      }));
      alert("Role updated successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-[30px] font-semibold text-slate-900 tracking-tight">Employees</h2>
          <p className="text-sm text-slate-500 mt-1">Manage employee records and organizational structure.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-sm gap-2">
          <span className="material-symbols-outlined text-[20px]">person_add</span>
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
          <input className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Search by name, NIP, or role..." />
        </div>
        <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Divisions</option>
          <option>Product & Engineering</option>
          <option>Operations</option>
          <option>Human Resources</option>
        </select>
        <select className="border border-slate-200 rounded-lg text-sm px-3 py-2 text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option>All Status</option>
          <option>Active</option>
          <option>On Leave</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Employee","Role","Division","Status","Actions"].map((h, i) => (
                  <th key={h} className={`py-3 px-6 text-[11px] font-semibold text-slate-400 uppercase tracking-wider ${i===4?'text-right':''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-slate-500">Loading employees...</td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img className="w-9 h-9 rounded-full object-cover" alt={user.name} src={user.avatar} />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                      )}
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">{user.name}</span>
                        <span className="text-xs text-slate-500">{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-slate-700">{user.position || "Staff"}</span>
                      {hasRole('super_admin') ? (
                        <select 
                          className="text-xs bg-slate-50 border border-slate-200 rounded px-1 py-0.5 outline-none cursor-pointer hover:bg-slate-100"
                          value={user.roles?.[0]?.name || 'employee'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        >
                          {roles.map(r => (
                            <option key={r.id} value={r.name}>{r.name.replace('_', ' ')}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs capitalize">{user.roles?.[0]?.name.replace('_', ' ') || 'employee'}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.department?.name || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      user.employment_status === "Active" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                      user.employment_status === "On Leave" ? "bg-amber-50 text-amber-600 border border-amber-200" :
                      "bg-slate-50 text-slate-500 border border-slate-200"
                    }`}>{user.employment_status || "Active"}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-400">Showing {users.length} employees</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-8 text-xs" disabled>Previous</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs bg-indigo-50 text-indigo-600 border-indigo-200">1</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">2</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">3</Button>
            <Button variant="outline" size="sm" className="h-8 text-xs">Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
