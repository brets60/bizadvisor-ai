"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Download,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function DownloadPage() {
  const [copied, setCopied] = useState(false);
  const directLink = "https://bizadvisor-ai-dun.vercel.app/BizAdvisor-AI.apk";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      {/* Top Navbar */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-sm shadow-brand-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="flex items-center">
            <span className="font-extrabold text-slate-900 tracking-tight text-lg">BizAdvisor</span>
            <span className="text-brand-500 font-bold ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-50 border border-brand-200">
              AI
            </span>
          </div>
        </Link>

        <Link
          href="/login"
          className="text-xs font-semibold text-slate-600 hover:text-brand-600 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors"
        >
          Open Web App &rarr;
        </Link>
      </header>

      {/* Main Download Card */}
      <main className="max-w-xl w-full mx-auto my-auto space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-brand-50/60 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-emerald-50/60 blur-2xl pointer-events-none" />

          {/* App Icon Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-lg shadow-brand-500/25 mx-auto mb-5">
            <Smartphone className="w-10 h-10" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Android APK • Version 1.0.0</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Download BizAdvisor AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Your pocket business advisor powered by Google Gemini. Business planning, financial formulas, and growth strategies — directly on your phone.
          </p>

          {/* Download Details */}
          <div className="grid grid-cols-3 gap-2 my-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">File Size</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">5.4 MB</div>
            </div>
            <div className="border-x border-slate-200/60">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Compatibility</div>
              <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">Android 8.0+</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cloud Sync</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-600 mt-0.5">24/7 Live</div>
            </div>
          </div>

          {/* Primary Download Button */}
          <a
            href="/BizAdvisor-AI.apk"
            download="BizAdvisor-AI.apk"
            className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-brand-500/30 transition-all cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download APK Directly</span>
          </a>

          {/* Copy Direct Link Button */}
          <div className="mt-3">
            <button
              onClick={handleCopyLink}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Direct Link Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Direct Download Link</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[11px] text-slate-400 mt-3 truncate font-mono">
            {directLink}
          </div>
        </div>

        {/* 3-Step Installation Guide */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-3">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-600" />
            <span>Quick 3-Step Phone Installation</span>
          </h2>

          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                1
              </span>
              <div>
                <strong className="text-slate-800">Download the APK file</strong>
                <p className="text-slate-500 mt-0.5">
                  Tap the blue <strong>Download APK Directly</strong> button above on your phone.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                2
              </span>
              <div>
                <strong className="text-slate-800">Confirm download</strong>
                <p className="text-slate-500 mt-0.5">
                  If your browser shows a safety prompt, tap <strong>&ldquo;Download anyway&rdquo;</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                3
              </span>
              <div>
                <strong className="text-slate-800">Tap to Install & Launch</strong>
                <p className="text-slate-500 mt-0.5">
                  Tap the download completed notification and select <strong>Install</strong>. Open the app and log in!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto pt-6 text-center text-xs text-slate-400">
        BizAdvisor AI • 24/7 Cloud Powered Platform • All rights reserved.
      </footer>
    </div>
  );
}
