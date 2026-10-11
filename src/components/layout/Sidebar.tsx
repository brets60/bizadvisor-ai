"use client";

import React from "react";
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

export function Sidebar({ user }: { user: any }) {
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-screen flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm shadow-brand-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">BizAdvisor</span>
              <span className="text-brand-500 font-bold ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* User Quick Info */}
        <div className="p-4 mx-3 my-3 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="text-xs font-medium text-slate-900 truncate">
            {user?.businessProfile?.business_name || user?.fullName || "Your Business"}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{user?.currency || "PHP"} (Asia/Manila)</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
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
                  item.highlight && !isActive && "text-brand-600"
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

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
