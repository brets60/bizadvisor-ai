"use client";

import React from "react";
import Link from "next/link";
import { User, Sparkles } from "lucide-react";

export function Header({ user }: { user: any }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-800">
          BizAdvisor AI Workstation
        </h1>
        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          {user?.currency || "PHP"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/advisor"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-full border border-brand-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Ask AI Advisor</span>
        </Link>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
            <User className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="font-semibold text-slate-800 leading-tight">
              {user?.fullName || "User"}
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">
              {user?.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
