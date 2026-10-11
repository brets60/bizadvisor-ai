import React from "react";
import Link from "next/link";
import {
  Building2,
  Bot,
  Lightbulb,
  FileText,
  Calculator,
  Megaphone,
  TrendingUp,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Coins,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation Header */}
      <header className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">BizAdvisor</span>
            <span className="text-brand-600 font-bold ml-1 text-xs px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200">
              AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-sm shadow-brand-500/20"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold">
          <Coins className="w-3.5 h-3.5 text-brand-600" />
          <span>Tailored for Philippine & Global Entrepreneurs • Defaulting to PHP (₱)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Practical, AI-Powered Business Advisory for Founders Who Want Results.
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Not a generic chatbot or static dashboard. BizAdvisor AI delivers context-aware business decisions, bankable 14-section business plans, deterministic financial calculators, and structured growth sprints.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>Start Free Advisory Session</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-sm font-bold transition-all shadow-xs flex items-center justify-center"
          >
            <span>Sign In to Workstation</span>
          </Link>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No fake AI responses
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Deterministic financial formulas
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Full data privacy & export
          </span>
        </div>
      </section>

      {/* Target Audiences Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80 px-6 sm:px-12">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Who BizAdvisor AI is Built For</h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Whether you are planning your first business with ₱10,000 or scaling an operating venture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Aspiring Founders",
                desc: "Discover vetted business concepts that fit your starting capital, validate demand with low spend, and avoid costly early errors.",
                icon: Lightbulb,
              },
              {
                title: "Small Business Owners",
                desc: "Optimize profit margins, calculate true break-even unit volumes, and structure cash flow runway forecasts.",
                icon: Calculator,
              },
              {
                title: "Online Sellers & Creators",
                desc: "Generate viral social media captions, 4-week campaign schedules, and cross-channel promotion strategies for TikTok, FB, and Shopee.",
                icon: Megaphone,
              },
              {
                title: "Freelancers & Service Pros",
                desc: "Transition from unpredictable hourly rates to high-margin service packages, structured retainers, and scalable client acquisition.",
                icon: TrendingUp,
              },
            ].map((audience, idx) => {
              const Icon = audience.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 hover:border-brand-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-brand-600 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{audience.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{audience.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            A Complete Full-Stack Business Advisory Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Every feature is backed by database persistence and server-side AI integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Context-Aware AI Advisor",
              desc: "Considers your industry, stage, budget range, and region. Formulates structured 7-part answers with actionable follow-up suggestions.",
              icon: Bot,
              badge: "Core Feature",
            },
            {
              title: "14-Section Business Plan",
              desc: "Produces complete executive summaries, operational plans, revenue models, and 90-day roadmaps. Fully editable with section regeneration.",
              icon: FileText,
              badge: "Document Suite",
            },
            {
              title: "Deterministic Financial Tools",
              desc: "Startup cost calculators, margin & markup calculators, break-even unit estimators, and 6-month cash flow trajectory curves.",
              icon: Calculator,
              badge: "Math Engine",
            },
            {
              title: "Tailored Business Ideas",
              desc: "Generates viable concepts based on your available capital and skills, with side-by-side comparison for shortlisted ideas.",
              icon: Lightbulb,
              badge: "Idea Generator",
            },
            {
              title: "Go-to-Market Marketing",
              desc: "4-week execution calendars, channel allocations, and ready-to-copy social captions tailored for Philippine consumer culture.",
              icon: Megaphone,
              badge: "Marketing Suite",
            },
            {
              title: "Growth Planner & Milestones",
              desc: "Track real progress from actual database records. Set sprint milestones with priority, target dates, and measurable metrics.",
              icon: TrendingUp,
              badge: "Execution Tool",
            },
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-200">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                      {feature.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{feature.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Security & Trust Callout */}
      <section className="py-16 bg-slate-900 text-white px-6 sm:px-12">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-brand-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Commercial Grade Security & Isolation</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Your Business Data Remains Yours.</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              We enforce strict multi-tenant authorization so no other user can access your plans or ideas. You can export your full data archive or permanently delete your account at any time.
            </p>
          </div>

          <Link
            href="/register"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-md transition-colors whitespace-nowrap"
          >
            Create Private Account &rarr;
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 sm:px-12 max-w-6xl mx-auto border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>&copy; {new Date().getFullYear()} BizAdvisor AI. All rights reserved.</div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-slate-800 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-slate-800 transition-colors">
            Terms of Service
          </Link>
          <Link href="/login" className="hover:text-slate-800 transition-colors">
            Sign In
          </Link>
        </div>
      </footer>
    </div>
  );
}
