"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Lightbulb,
  FileText,
  Calculator,
  Megaphone,
  TrendingUp,
  Search,
  Bookmark,
  Settings,
  LogOut,
  Building2,
  Menu,
  X,
  User,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "AI Advisor", href: "/advisor", icon: Bot, highlight: true },
  { label: "Business Ideas", href: "/ideas", icon: Lightbulb },
  { label: "Business Plans", href: "/plans", icon: FileText },
  { label: "Financial Tools", href: "/financial", icon: Calculator },
  { label: "Marketing", href: "/marketing", icon: Megaphone },
  { label: "Growth Planner", href: "/growth", icon: TrendingUp },
  { label: "Research", href: "/research", icon: Search },
  { label: "Saved Resources", href: "/library", icon: Bookmark },
  { label: "Settings", href: "/settings", icon: Settings },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Advisor", href: "/advisor", icon: Bot, highlight: true },
  { label: "Ideas", href: "/ideas", icon: Lightbulb },
  { label: "Finance", href: "/financial", icon: Calculator },
];

export function AppShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row w-full overflow-x-hidden">
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (Visible on lg screens: >= 1024px)        */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200/80 min-h-screen flex-col justify-between select-none flex-shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm shadow-brand-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex items-center">
                <span className="font-bold text-slate-900 tracking-tight text-base">BizAdvisor</span>
                <span className="text-brand-500 font-bold ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">
                  AI
                </span>
              </div>
            </Link>
          </div>

          {/* User Quick Info */}
          <div className="p-4 mx-3 my-3 bg-slate-50/80 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-900 truncate">
              {user?.businessProfile?.business_name || user?.fullName || "Your Business"}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{user?.currency || "PHP"} • Asia/Manila</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    item.highlight && !isActive && "text-brand-600 font-medium"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 flex-shrink-0",
                      isActive ? "text-brand-600" : "text-slate-400"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.highlight && (
                    <span className="text-[10px] bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                      Core
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Desktop Logout */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 text-slate-400" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE DRAWER OVERLAY & SIDEBAR (Visible when open on <lg)*/}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeMobileMenu}
          />

          {/* Drawer Content */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
            <div className="overflow-y-auto">
              {/* Drawer Header */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                <Link href="/dashboard" onClick={closeMobileMenu} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-900 text-base">BizAdvisor</span>
                  <span className="text-brand-500 font-bold text-xs px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">
                    AI
                  </span>
                </Link>
                <button
                  onClick={closeMobileMenu}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User badge in mobile drawer */}
              <div className="p-3.5 mx-3 my-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs font-semibold text-slate-900 truncate">
                  {user?.fullName || "User"}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user?.email}
                </div>
                <div className="mt-1 text-[11px] font-medium text-brand-600">
                  {user?.currency || "PHP"} • {user?.country || "Philippines"}
                </div>
              </div>

              {/* Drawer Links */}
              <nav className="px-3 space-y-1 pb-4">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-brand-50 text-brand-700 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      <Icon className={cn("w-4 h-4", isActive ? "text-brand-600" : "text-slate-400")} />
                      <span className="flex-1">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Logout */}
            <div className="p-4 border-t border-slate-100 bg-white">
              <button
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. MAIN CONTENT WRAPPER & TOP HEADER                         */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Header */}
        <header className="h-14 sm:h-16 bg-white border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 w-full">
          {/* Left: Mobile hamburger + title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 rounded-md bg-brand-500 text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-sm tracking-tight">BizAdvisor</span>
            </Link>

            <h1 className="hidden lg:block text-sm font-semibold text-slate-800">
              BizAdvisor AI Workstation
            </h1>

            <span className="text-[11px] sm:text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-medium">
              {user?.currency || "PHP"}
            </span>
          </div>

          {/* Right: Actions & User Info */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/advisor"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 sm:px-3 py-1.5 rounded-full border border-brand-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span className="hidden xs:inline">Ask AI</span>
              <span className="xs:hidden">AI</span>
            </Link>

            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                  {user?.fullName || "User"}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content: Mobile-optimized padding with space for bottom nav */}
        {(() => {
          const isAdvisorPage = pathname === "/advisor" || pathname.startsWith("/advisor/");
          return (
            <main
              className={cn(
                "flex-1 w-full max-w-7xl mx-auto",
                isAdvisorPage
                  ? "p-0 pb-16 lg:p-6 md:p-8 lg:pb-8 flex flex-col min-h-0"
                  : "p-3 sm:p-6 md:p-8 pb-24 lg:pb-8"
              )}
            >
              {children}
            </main>
          );
        })()}
      </div>

      {/* ============================================================ */}
      {/* 4. MOBILE BOTTOM NAVIGATION BAR (Fixed on phone screens <lg)  */}
      {/* ============================================================ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around px-1 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        aria-label="Mobile Navigation"
      >
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition-colors select-none",
                isActive ? "text-brand-600 font-semibold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              <div className="relative">
                <Icon className={cn("w-5 h-5", isActive ? "text-brand-600" : "text-slate-500")} />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* More / Menu Button to open Drawer */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-slate-800 transition-colors select-none"
          aria-label="More navigation options"
        >
          <Menu className="w-5 h-5 text-slate-500" />
          <span className="text-[10px] tracking-tight mt-1">Menu</span>
        </button>
      </nav>
    </div>
  );
}
