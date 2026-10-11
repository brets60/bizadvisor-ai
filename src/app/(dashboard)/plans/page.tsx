"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText,
  Sparkles,
  Download,
  Save,
  RefreshCw,
  Edit3,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

const SECTIONS = [
  { key: "executiveSummary", title: "1. Executive Summary" },
  { key: "businessDescription", title: "2. Business Description & Mission" },
  { key: "customerProblem", title: "3. Customer Problem & Market Need" },
  { key: "productsOrServices", title: "4. Products or Services Portfolio" },
  { key: "targetMarket", title: "5. Target Market & Customer Persona" },
  { key: "competitivePositioning", title: "6. Competitive Positioning & Advantage" },
  { key: "marketingStrategy", title: "7. Marketing & Customer Acquisition Strategy" },
  { key: "operationalPlan", title: "8. Operational Plan & Supply Chain" },
  { key: "startupCostEstimates", title: "9. Startup Cost Estimates (Preliminary)" },
  { key: "revenueAssumptions", title: "10. Revenue Model & Assumptions" },
  { key: "expenseAssumptions", title: "11. Operating Expense Assumptions" },
  { key: "breakEvenAnalysis", title: "12. Break-Even Analysis & Milestones" },
  { key: "risksAndMitigation", title: "13. Risk Assessment & Mitigation Plan" },
  { key: "first90DayActionPlan", title: "14. First 90-Day Execution Roadmap" },
];

function PlansContent() {
  const searchParams = useSearchParams();
  const fromIdea = searchParams.get("fromIdea");
  const planIdFromQuery = searchParams.get("id");

  const [plans, setPlans] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [sections, setSections] = useState<Record<string, string>>({});
  const [activeSectionKey, setActiveSectionKey] = useState<string>("executiveSummary");

  // Form state
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);
  const [title, setTitle] = useState(fromIdea ? `${fromIdea} - Business Plan` : "Coffee Cart Business Plan");
  const [industry, setIndustry] = useState("Food & Beverage");
  const [description, setDescription] = useState("A compact mobile coffee cart providing specialty espresso drinks in high foot traffic areas.");
  const [targetMarket, setTargetMarket] = useState("Commuters, university students, and office workers");
  const [startingBudget, setStartingBudget] = useState("₱50,000");
  const [customNotes, setCustomNotes] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const [regeneratePrompt, setRegeneratePrompt] = useState("");
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (fromIdea && !activePlan) {
      setTitle(`${fromIdea} - Business Plan`);
      setShowNewPlanModal(true);
    }
  }, [fromIdea]);

  useEffect(() => {
    if (planIdFromQuery && plans.length > 0) {
      const match = plans.find((p) => p.id === planIdFromQuery);
      if (match) selectPlan(match);
    }
  }, [planIdFromQuery, plans]);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
        if (data.plans.length > 0 && !activePlan && !planIdFromQuery) {
          selectPlan(data.plans[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
    }
  };

  const selectPlan = (plan: any) => {
    setActivePlan(plan);
    setSections(plan.sections || {});
    setActiveSectionKey("executiveSummary");
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          industry,
          description,
          targetMarket,
          startingBudget,
          customNotes: customNotes || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate business plan.");
        setIsGenerating(false);
        return;
      }

      setShowNewPlanModal(false);
      await fetchPlans();
      selectPlan({ ...data.plan, sections: data.sections });
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlanEdits = async () => {
    if (!activePlan) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/plans/${activePlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activePlan.title,
          sections,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActivePlan(data.plan);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        fetchPlans();
      }
    } catch (err) {
      console.error("Save plan failed:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerateCurrentSection = async () => {
    if (!activePlan || isRegeneratingSection) return;
    setIsRegeneratingSection(true);
    setError(null);

    try {
      const res = await fetch(`/api/plans/${activePlan.id}/section`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: activeSectionKey,
          instructions: regeneratePrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to regenerate section.");
        setIsRegeneratingSection(false);
        return;
      }

      setSections((prev) => ({
        ...prev,
        [activeSectionKey]: data.content,
      }));
      setActivePlan((prev: any) => ({ ...prev, version: data.version }));
      setShowRegenModal(false);
      setRegeneratePrompt("");
      fetchPlans();
    } catch (err) {
      setError("Failed to regenerate section.");
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business plan?")) return;
    try {
      const res = await fetch(`/api/plans/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
        if (activePlan?.id === id) {
          setActivePlan(null);
          setSections({});
        }
      }
    } catch (err) {
      console.error("Delete plan failed:", err);
    }
  };

  const handleExportDocument = () => {
    if (!activePlan) return;

    let doc = `# ${activePlan.title}\n`;
    doc += `Version: ${activePlan.version}\n`;
    doc += `Generated by BizAdvisor AI on ${new Date().toLocaleDateString()}\n\n`;
    doc += `> **NOTICE**: Financial projections and cost estimates contained within this plan are preliminary planning assumptions based on user inputs. They do not constitute certified supplier quotations or guaranteed financial outcomes.\n\n---\n\n`;

    SECTIONS.forEach((s) => {
      doc += `## ${s.title}\n\n`;
      doc += `${sections[s.key] || "Pending completion."}\n\n`;
    });

    const blob = new Blob([doc], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activePlan.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_plan_v${activePlan.version}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">14-Section Business Plan Generator</h1>
          </div>
          <p className="text-xs text-slate-500">
            Comprehensive, editable business plan with section-by-section AI regeneration, version control, and export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowNewPlanModal(true)}
            variant="primary"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Generate New Plan</span>
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Plans List / Table of Contents */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Your Saved Plans ({plans.length})
            </div>
            {plans.length > 0 ? (
              <div className="space-y-1">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => selectPlan(p)}
                    className={`flex items-center justify-between p-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      activePlan?.id === p.id
                        ? "bg-brand-50 text-brand-800 font-semibold border border-brand-200"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div>{p.title}</div>
                      <div className="text-[10px] text-slate-400">v{p.version}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlan(p.id);
                      }}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 p-3 bg-slate-50 rounded-lg text-center">
                No plans yet. Click &ldquo;Generate New Plan&rdquo; above.
              </div>
            )}
          </div>

          {activePlan && (
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Table of Contents (14 Sections)
              </div>
              <div className="space-y-0.5 max-h-[380px] overflow-y-auto pr-1">
                {SECTIONS.map((sec) => (
                  <button
                    key={sec.key}
                    onClick={() => setActiveSectionKey(sec.key)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-colors flex items-center justify-between ${
                      activeSectionKey === sec.key
                        ? "bg-slate-900 text-white font-medium"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Plan Section Viewer & Editor (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between min-h-[600px]">
          {activePlan ? (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">{activePlan.title}</h2>
                    <Badge variant="info">v{activePlan.version}</Badge>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Viewing Section: <span className="font-semibold text-slate-700">{SECTIONS.find((s) => s.key === activeSectionKey)?.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setShowRegenModal(true)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1 text-brand-600" />
                    <span>Regenerate Section</span>
                  </Button>

                  <Button
                    onClick={handleExportDocument}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    <span>Export (.md)</span>
                  </Button>

                  <Button
                    onClick={handleSavePlanEdits}
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                  >
                    {saveSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1 text-white" />
                        <span>Saved ✓</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 mr-1" />
                        <span>Save Version</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Disclaimer Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500">
                <strong>Preliminary Assumption Notice:</strong> Financial projections, market sizing, and cost estimates in this plan are calculated planning assumptions for validation, not certified supplier quotes or guaranteed profitability.
              </div>

              {/* Editable Section Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Editable Content for: {SECTIONS.find((s) => s.key === activeSectionKey)?.title}
                </label>
                <textarea
                  rows={14}
                  value={sections[activeSectionKey] || ""}
                  onChange={(e) =>
                    setSections({
                      ...sections,
                      [activeSectionKey]: e.target.value,
                    })
                  }
                  className="w-full p-4 font-mono text-xs text-slate-800 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Navigation between sections */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  onClick={() => {
                    const currentIndex = SECTIONS.findIndex((s) => s.key === activeSectionKey);
                    if (currentIndex > 0) setActiveSectionKey(SECTIONS[currentIndex - 1].key);
                  }}
                  variant="secondary"
                  size="sm"
                  disabled={SECTIONS.findIndex((s) => s.key === activeSectionKey) === 0}
                >
                  &larr; Previous Section
                </Button>

                <div className="text-xs text-slate-400">
                  {SECTIONS.findIndex((s) => s.key === activeSectionKey) + 1} of 14
                </div>

                <Button
                  onClick={() => {
                    const currentIndex = SECTIONS.findIndex((s) => s.key === activeSectionKey);
                    if (currentIndex < SECTIONS.length - 1) setActiveSectionKey(SECTIONS[currentIndex + 1].key);
                  }}
                  variant="secondary"
                  size="sm"
                  disabled={SECTIONS.findIndex((s) => s.key === activeSectionKey) === SECTIONS.length - 1}
                >
                  Next Section &rarr;
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No Business Plan Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Generate a new bankable 14-section business plan or pick one from the left sidebar.
              </p>
              <Button
                onClick={() => setShowNewPlanModal(true)}
                variant="primary"
                size="sm"
                className="mt-4"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Generate Plan</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Generate New Plan Modal */}
      <Modal
        isOpen={showNewPlanModal}
        onClose={() => setShowNewPlanModal(false)}
        title="Generate 14-Section Business Plan"
        description="BizAdvisor AI will formulate a complete, structured plan across all 14 standard sections."
        maxWidth="xl"
      >
        <form onSubmit={handleGeneratePlan} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700">Plan Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Quezon City Artisan Cafe Business Plan"
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Starting Budget</label>
              <input
                type="text"
                required
                value={startingBudget}
                onChange={(e) => setStartingBudget(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Business Concept & Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Market</label>
            <input
              type="text"
              required
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Additional Instructions (Optional)</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Focus on low-cost social media marketing and lean inventory"
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowNewPlanModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Generate Full Plan</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Regenerate Section Modal */}
      <Modal
        isOpen={showRegenModal}
        onClose={() => setShowRegenModal(false)}
        title={`Regenerate ${SECTIONS.find((s) => s.key === activeSectionKey)?.title}`}
        description="Provide custom guidance to focus, expand, or adjust this specific section."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Revision Instructions
            </label>
            <textarea
              rows={4}
              value={regeneratePrompt}
              onChange={(e) => setRegeneratePrompt(e.target.value)}
              placeholder="e.g. Expand on digital channels and give specific metrics for the Philippine market..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowRegenModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isRegeneratingSection}
              onClick={handleRegenerateCurrentSection}
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Regenerate Now</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Business Plans...</div>}>
      <PlansContent />
    </Suspense>
  );
}
