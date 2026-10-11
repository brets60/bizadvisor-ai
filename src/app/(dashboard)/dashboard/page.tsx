import React from "react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Bot,
  Lightbulb,
  FileText,
  Calculator,
  Megaphone,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  FolderOpen,
} from "lucide-react";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  // Genuine database records
  const [
    recentConversations,
    savedIdeas,
    activePlans,
    pendingActionItems,
    recentCalcs,
    allActionItems,
  ] = await Promise.all([
    db.conversation.findMany({
      where: { user_id: user.id },
      orderBy: { updated_at: "desc" },
      take: 4,
      include: { _count: { select: { messages: true } } },
    }),
    db.businessIdea.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 3,
    }),
    db.businessPlan.findMany({
      where: { user_id: user.id },
      orderBy: { updated_at: "desc" },
      take: 3,
    }),
    db.actionPlan.findMany({
      where: { user_id: user.id, status: { in: ["pending", "in_progress"] } },
      orderBy: { created_at: "desc" },
      take: 4,
    }),
    db.financialCalculation.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
      take: 3,
    }),
    db.actionPlan.findMany({
      where: { user_id: user.id },
    }),
  ]);

  const totalTasks = allActionItems.length;
  const completedTasks = allActionItems.filter((i) => i.status === "completed").length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const currency = user.preferred_currency || "PHP";
  const bp = user.business_profile;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-navy-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-brand-200 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-300" />
              <span>Personalized Advisory Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome, {user.full_name}!
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              {bp?.business_name ? `${bp.business_name} • ` : ""}
              {bp?.industry || "Entrepreneurship"} • {bp?.business_stage || "Planning Stage"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/advisor"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Ask Advisor</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Business Profile Summary Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Your Active Business Profile Context
          </div>
          <Link href="/settings" className="text-xs text-brand-600 hover:underline font-medium">
            Edit Profile & Preferences &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Stage:</span>
            <span className="font-semibold text-slate-800 capitalize">
              {bp?.business_stage?.replace("_", " ") || "Planning"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Starting Budget:</span>
            <span className="font-semibold text-slate-800">{bp?.budget_range || "Flexible"}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Target Audience:</span>
            <span className="font-semibold text-slate-800 truncate block">
              {bp?.target_market || "Broad local market"}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Location / Currency:</span>
            <span className="font-semibold text-slate-800">
              {user.country} ({currency})
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 mb-3">Quick Workspace Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "AI Advisor", desc: "Interactive guidance", href: "/advisor", icon: Bot, color: "text-blue-600 bg-blue-50" },
            { label: "Business Ideas", desc: "Generate & shortlist", href: "/ideas", icon: Lightbulb, color: "text-amber-600 bg-amber-50" },
            { label: "Business Plan", desc: "14-section plan", href: "/plans", icon: FileText, color: "text-indigo-600 bg-indigo-50" },
            { label: "Financial Tools", desc: "Calculators & models", href: "/financial", icon: Calculator, color: "text-emerald-600 bg-emerald-50" },
            { label: "Marketing", desc: "Strategy & posts", href: "/marketing", icon: Megaphone, color: "text-rose-600 bg-rose-50" },
            { label: "Growth Planner", desc: "Track milestones", href: "/growth", icon: TrendingUp, color: "text-cyan-600 bg-cyan-50" },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                    {action.label}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">{action.desc}</div>
                </div>
                <div className="mt-3 text-right">
                  <span className="text-[10px] text-brand-600 font-semibold group-hover:underline">Open &rarr;</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Real Data & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Action Items & Productivity */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Pending Execution Milestones</h3>
              </div>
              <Link href="/growth" className="text-xs text-brand-600 hover:underline font-medium">
                View All Tasks ({totalTasks}) &rarr;
              </Link>
            </div>

            {totalTasks > 0 ? (
              <div>
                <div className="mb-4 p-3 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                  <div className="text-slate-600">
                    Execution Progress: <span className="font-bold text-slate-900">{completedTasks} of {totalTasks} Completed</span>
                  </div>
                  <div className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {completionPercentage}% Done
                  </div>
                </div>

                <div className="space-y-2.5">
                  {pendingActionItems.length > 0 ? (
                    pendingActionItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-slate-800">{item.title}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">
                              Metric: {item.success_metric}
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full capitalize font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500">
                      All action items are completed! Great work.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <p className="text-xs text-slate-600 font-medium">No active milestones yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Use the Growth Planner to let BizAdvisor create high-impact execution targets.
                </p>
                <Link
                  href="/growth"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-600 font-semibold hover:underline"
                >
                  Create Growth Milestones &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Active Business Plans & Ideas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Business Plans */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Business Plans</span>
                </h4>
                <Link href="/plans" className="text-xs text-brand-600 hover:underline">
                  New Plan +
                </Link>
              </div>

              {activePlans.length > 0 ? (
                <div className="space-y-2">
                  {activePlans.map((p) => (
                    <Link
                      key={p.id}
                      href={`/plans?id=${p.id}`}
                      className="block p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs transition-colors"
                    >
                      <div className="font-semibold text-slate-800 truncate">{p.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        v{p.version} • Updated {formatDate(p.updated_at)}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No plans created yet.{" "}
                  <Link href="/plans" className="text-brand-600 font-medium block mt-1 hover:underline">
                    Generate 14-Section Plan
                  </Link>
                </div>
              )}
            </div>

            {/* Business Ideas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>Saved Ideas</span>
                </h4>
                <Link href="/ideas" className="text-xs text-brand-600 hover:underline">
                  Generate Ideas &rarr;
                </Link>
              </div>

              {savedIdeas.length > 0 ? (
                <div className="space-y-2">
                  {savedIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      className="p-2.5 rounded-lg border border-slate-100 text-xs"
                    >
                      <div className="font-semibold text-slate-800 truncate">{idea.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{idea.concept}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                  No ideas saved yet.{" "}
                  <Link href="/ideas" className="text-brand-600 font-medium block mt-1 hover:underline">
                    Explore Tailored Ideas
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Recent Conversations & Guidance */}
        <div className="space-y-6">
          {/* Recent Advisor Chats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-brand-600" />
                <span>Recent Advisory Chats</span>
              </h3>
              <Link href="/advisor" className="text-xs text-brand-600 hover:underline">
                New Chat +
              </Link>
            </div>

            {recentConversations.length > 0 ? (
              <div className="space-y-2">
                {recentConversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/advisor?c=${c.id}`}
                    className="block p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs transition-colors"
                  >
                    <div className="font-semibold text-slate-800 truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex justify-between">
                      <span>{c._count.messages} messages</span>
                      <span>{formatDate(c.updated_at)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No chats yet.
              </div>
            )}
          </div>

          {/* Sample Questions & Advisory Guidance for New Users */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
              <HelpCircle className="w-4 h-4 text-brand-600" />
              <span>Recommended Advisory Questions</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Click any question to launch an instant tailored advisory session:
            </p>
            <div className="space-y-1.5">
              {[
                `What high-margin business can I launch with ${bp?.budget_range || "₱20,000"}?`,
                "How do I determine the right retail pricing markup?",
                "What legal permits (DTI, Barangay, BIR) do I need in the Philippines?",
                "How can I test customer demand before buying inventory?",
              ].map((q, idx) => (
                <Link
                  key={idx}
                  href={`/advisor?prompt=${encodeURIComponent(q)}`}
                  className="block p-2 rounded-lg bg-white border border-slate-200/80 hover:border-brand-400 text-slate-700 hover:text-brand-700 text-xs transition-colors"
                >
                  &ldquo;{q}&rdquo;
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
