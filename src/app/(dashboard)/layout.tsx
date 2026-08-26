"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/attendance", label: "Attendance", icon: "calendar_today" },
  { href: "/leave", label: "Leave", icon: "event_busy" },
  { href: "/payroll", label: "Payroll", icon: "payments" },
  { href: "/employees", label: "Employees", icon: "groups" },
  { href: "/settings", label: "Settings", icon: "settings" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasRole, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-brand-accent/20">
        {/* Side Nav */}
        <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-[280px] bg-white border-r border-slate-200 z-50">
        {/* Logo */}
        <div className="px-6 py-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-12 h-12 flex items-center justify-center rounded-lg overflow-hidden border border-brand-accent/50 bg-white shadow-sm">
            <Image src="/logo.png" alt="Synchrow Logo" width={48} height={48} className="w-full h-full object-cover scale-[1.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-primary tracking-tight">Synchrow</h1>
            <p className="text-xs font-semibold text-brand-secondary uppercase tracking-[0.08em]">Enterprise HRIS</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col gap-1 px-3 py-4 flex-1">
          {navItems.map((item) => {
            // Hide payroll and employees if not finance, hr_admin, or super_admin
            if (item.href === '/payroll' && !hasRole(['finance', 'super_admin'])) {
              return null;
            }
            if (item.href === '/employees' && !hasRole(['hr_admin', 'super_admin', 'dept_manager'])) {
              return null;
            }

            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out ${
                  isActive
                    ? "text-brand-secondary bg-brand-accent/30 font-semibold"
                    : "text-slate-500 hover:bg-brand-accent/10 hover:text-brand-primary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* User Profile at bottom */}
        <div className="px-4 py-4 border-t border-slate-100 flex items-center justify-between group cursor-pointer">
          <div className="flex items-center gap-3 px-2 flex-1 min-w-0">
            {user?.avatar ? (
              <img
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                alt={user?.name || "User Avatar"}
                src={user.avatar}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-brand-accent/30 text-brand-secondary flex items-center justify-center font-bold text-xs ring-2 ring-slate-100">
                {user?.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-primary truncate">{user?.name || "Loading..."}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || "..."}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100">
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </nav>

      {/* Top Nav */}
      <header className="fixed top-0 right-0 w-full md:w-[calc(100%-280px)] h-16 bg-white border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-40">
        {/* Mobile hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          <button className="p-1 text-slate-600 hover:text-slate-900">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="text-lg font-bold text-slate-900">Synchrow</span>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md relative">
          <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[20px]">search</span>
          <input
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            placeholder="Search employees, documents..."
            type="text"
          />
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button className="relative p-2 text-slate-400 hover:text-brand-secondary hover:bg-brand-accent/10 rounded-lg transition-all">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-highlight rounded-full ring-2 ring-white"></span>
          </button>
          <button className="p-2 text-slate-400 hover:text-brand-secondary hover:bg-brand-accent/10 rounded-lg transition-all hidden sm:flex">
            <span className="material-symbols-outlined text-[22px]">help_outline</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-slate-100 cursor-pointer ml-1 bg-brand-accent/30 flex items-center justify-center text-brand-secondary font-bold text-xs">
            {user?.avatar ? (
              <img
                alt="User Profile"
                className="w-full h-full object-cover"
                src={user.avatar}
              />
            ) : (
              user?.name?.charAt(0) || "U"
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="md:ml-[280px] pt-16 min-h-screen">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
    </ProtectedRoute>
  );
}
