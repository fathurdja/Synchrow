"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";
import {
  LayoutDashboard,
  Camera,
  History,
  CalendarOff,
  ClipboardList,
  Receipt,
  Banknote,
  Users,
  User,
  Settings,
  Search,
  Bell,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/attendance", label: "Absensi", icon: Camera },
  { href: "/attendance-log", label: "Log absensi", icon: History },
  { href: "/leave", label: "Ajukan cuti", icon: CalendarOff },
  { href: "/leaves", label: "Manajemen cuti", icon: ClipboardList },
  { href: "/my-payslips", label: "Slip gaji saya", icon: Receipt },
  { href: "/payroll", label: "Payroll", icon: Banknote },
  { href: "/employees", label: "Karyawan", icon: Users },
  { href: "/profile", label: "Profil", icon: User },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasRole, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Design brief §6.2 — menu visibility per role
  const isVisible = (href: string) => {
    switch (href) {
      case "/payroll":
        return hasRole(["finance", "super_admin"]);
      case "/attendance-log":
        return hasRole(["hr_admin", "super_admin", "dept_manager"]);
      case "/employees":
        return hasRole(["hr_admin", "super_admin"]);
      case "/leaves":
        return hasRole(["hr_admin", "super_admin", "dept_manager"]);
      case "/settings":
        return hasRole(["hr_admin", "super_admin", "finance"]);
      default:
        return true;
    }
  };

  const sidebarW = collapsed ? "w-[72px]" : "w-[248px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-canvas">
        {/* ─── Sidebar ─── */}
        <nav
          className={`hidden md:flex flex-col fixed left-0 top-0 h-full ${sidebarW} bg-surface border-r border-line z-50 transition-all duration-200 ease-out`}
        >
          {/* Logo */}
          <div className="px-4 py-5 flex items-center gap-3 border-b border-line h-16">
            <div className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-control)] overflow-hidden border border-line bg-surface shrink-0">
              <Image
                src="/logo.png"
                alt="Synchrow"
                width={36}
                height={36}
                className="w-full h-full object-cover scale-[1.5]"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold text-ink tracking-tight leading-none">Synchrow</h1>
                <p className="text-[10px] font-semibold text-ink-muted uppercase tracking-[0.06em] mt-0.5">Enterprise HRIS</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-0.5 px-2 py-3 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              if (!isVisible(item.href)) return null;

              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-control)] text-sm font-medium transition-all duration-150 ease-out ${
                    isActive
                      ? "text-accent bg-accent-soft font-semibold"
                      : "text-ink-muted hover:bg-canvas hover:text-ink"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.75} className="shrink-0" />
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mx-2 mb-2 p-2 rounded-[var(--radius-control)] text-ink-muted hover:bg-canvas hover:text-ink transition-colors flex items-center justify-center"
          >
            {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>

          {/* User profile */}
          <div className="px-3 py-3 border-t border-line flex items-center justify-between group">
            <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${collapsed ? "justify-center" : ""}`}>
              {user?.avatar ? (
                <img
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-line shrink-0"
                  alt={user?.name || "Avatar"}
                  src={user.avatar}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold text-xs ring-2 ring-line shrink-0">
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{user?.name || "..."}</p>
                  <p className="text-[11px] text-ink-muted truncate">{user?.email || "..."}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`p-1.5 text-ink-muted hover:text-danger rounded-[var(--radius-control)] hover:bg-danger-soft transition-colors ${collapsed ? "hidden" : "opacity-0 group-hover:opacity-100"}`}
            >
              <LogOut size={16} />
            </button>
          </div>
        </nav>

        {/* ─── Top Header ─── */}
        <header
          className={`fixed top-0 right-0 ${collapsed ? "w-[calc(100%-72px)]" : "w-full md:w-[calc(100%-248px)]"} h-16 bg-surface border-b border-line flex justify-between items-center px-4 md:px-6 z-40 transition-all duration-200 ease-out`}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 md:hidden">
            <span className="text-base font-bold text-ink">Synchrow</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md relative">
            <Search size={16} className="absolute left-3 text-ink-muted" />
            <input
              className="w-full pl-9 pr-4 py-2 bg-canvas border border-line rounded-[var(--radius-control)] text-sm placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              placeholder="Cari karyawan, dokumen..."
              type="text"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            <button className="relative p-2 text-ink-muted hover:text-accent hover:bg-accent-soft rounded-[var(--radius-control)] transition-all">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pulse rounded-full ring-2 ring-surface animate-pulse-slow" />
            </button>
            <button className="p-2 text-ink-muted hover:text-accent hover:bg-accent-soft rounded-[var(--radius-control)] transition-all hidden sm:flex">
              <HelpCircle size={20} />
            </button>
          </div>
        </header>

        {/* ─── Main content ─── */}
        <main
          className={`${collapsed ? "md:ml-[72px]" : "md:ml-[248px]"} pt-16 min-h-screen transition-all duration-200 ease-out`}
        >
          <div className="p-4 md:p-6 max-w-[1440px]">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
