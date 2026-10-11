"use client";

import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  Sparkles,
  Bookmark,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Trash2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface GeneratedIdea {
  title: string;
  concept: string;
  targetMarket: string;
  customerProblem: string;
  valueProposition: string;
  startupCostEstimate: string;
  costBreakdownAssumptions: string;
  revenueModel: string;
  initialMarketingStrategy: string;
  majorRisks: string;
  validationSteps: string[];
}

export default function BusinessIdeasPage() {
  // Input criteria
  const [capital, setCapital] = useState("₱25,000");
  const [industry, setIndustry] = useState("Food & Beverage / Specialty Retail");
  const [skills, setSkills] = useState("Social media management, basic baking, customer relations");
  const [location, setLocation] = useState("Metro Manila, Philippines (Online delivery + Pop-up)");
  const [businessModel, setBusinessModel] = useState<"online" | "physical" | "hybrid">("hybrid");
  const [timeCommitment, setTimeCommitment] = useState<"full_time" | "part_time">("part_time");
  const [riskTolerance, setRiskTolerance] = useState<"low" | "moderate" | "high">("moderate");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccessMap, setSavedSuccessMap] = useState<Record<string, boolean>>({});

  // Comparison Modal state
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<GeneratedIdea[]>([]);

  useEffect(() => {
    fetchSavedIdeas();
  }, []);

  const fetchSavedIdeas = async () => {
    try {
      const res = await fetch("/api/ideas");
      if (res.ok) {
        const data = await res.json();
        setSavedIdeas(data.ideas || []);
      }
    } catch (err) {
      console.error("Failed to load saved ideas:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);
    setGeneratedIdeas([]);

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capital,
          industry,
          skills,
          location,
          businessModel,
          timeCommitment,
          riskTolerance,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate business ideas.");
        setIsGenerating(false);
        return;
      }

      setGeneratedIdeas(data.ideas || []);
    } catch (err) {
      setError("An unexpected network error occurred while communicating with the AI service.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveIdea = async (idea: GeneratedIdea) => {
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          idea,
        }),
      });

      if (res.ok) {
        setSavedSuccessMap((prev) => ({ ...prev, [idea.title]: true }));
        fetchSavedIdeas();
      }
    } catch (err) {
      console.error("Save idea error:", err);
    }
  };

  const handleDeleteSavedIdea = async (id: string) => {
    if (!confirm("Are you sure you want to remove this idea from your workspace?")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedIdeas((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      console.error("Delete idea error:", err);
    }
  };

  const toggleCompare = (idea: GeneratedIdea) => {
    if (selectedForComparison.some((i) => i.title === idea.title)) {
      setSelectedForComparison((prev) => prev.filter((i) => i.title !== idea.title));
    } else {
      if (selectedForComparison.length >= 3) {
        alert("You can compare up to 3 ideas at a time.");
        return;
      }
      setSelectedForComparison((prev) => [...prev, idea]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-bold text-slate-900">AI Business Idea Generator</h1>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Generate realistic, localized business concepts tailored to your available capital, skill set, and risk appetite.
          All estimates are strictly preliminary assumptions for validation.
        </p>
      </div>

      {/* Generator Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Available Capital</label>
              <input
                type="text"
                required
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                placeholder="e.g. ₱20,000 or $1,000"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Preferred Industry</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Food, E-Commerce, Services"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Location / Target Market</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Cebu City or Nationwide Online"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Business Model</label>
              <select
                value={businessModel}
                onChange={(e) => setBusinessModel(e.target.value as any)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="online">Online / Digital Store</option>
                <option value="physical">Physical Location / Pop-up</option>
                <option value="hybrid">Hybrid (Physical + Online)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700">Skills, Talents & Interests</label>
              <input
                type="text"
                required
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Cooking, graphic design, direct sales, mechanics"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Commitment</label>
                <select
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="part_time">Part-Time</option>
                  <option value="full_time">Full-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Risk Profile</label>
                <select
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(e.target.value as any)}
                  className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="low">Low Risk</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High Risk / High Upside</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-400">
              BizAdvisor AI evaluates capital efficiency and local demand dynamics.
            </div>
            <Button type="submit" isLoading={isGenerating} size="md">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Generate Tailored Ideas</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Floating Action Bar */}
      {selectedForComparison.length > 0 && (
        <div className="sticky top-20 z-10 bg-slate-900 text-white p-3.5 rounded-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs">
            <Scale className="w-4 h-4 text-brand-300" />
            <span>
              <strong>{selectedForComparison.length}</strong> idea{selectedForComparison.length > 1 ? "s" : ""} selected for side-by-side comparison
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setComparisonModalOpen(true)}
              variant="primary"
              size="sm"
              className="bg-brand-500 hover:bg-brand-400"
            >
              Compare Now &rarr;
            </Button>
            <button
              onClick={() => setSelectedForComparison([])}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Generated Ideas Section */}
      {generatedIdeas.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Tailored Business Ideas ({generatedIdeas.length})
            </h2>
            <span className="text-xs text-slate-500">
              Select &ldquo;Compare&rdquo; on any two cards to evaluate them side-by-side
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {generatedIdeas.map((idea, idx) => {
              const isSelected = selectedForComparison.some((i) => i.title === idea.title);
              const isSaved = savedSuccessMap[idea.title];

              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all ${
                    isSelected ? "border-brand-500 ring-2 ring-brand-100" : "border-slate-200"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-base text-slate-900">{idea.title}</h3>
                      <button
                        onClick={() => toggleCompare(idea)}
                        className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                          isSelected
                            ? "bg-brand-50 border-brand-300 text-brand-700"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected ? "Comparing ✓" : "+ Compare"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{idea.concept}</p>

                    {/* Startup Cost Box */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Preliminary Startup Cost
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        {idea.startupCostEstimate}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 italic">
                        *Assumptions: {idea.costBreakdownAssumptions}
                      </div>
                    </div>

                    <div className="text-xs space-y-1.5 pt-1">
                      <div>
                        <span className="font-semibold text-slate-700">Problem Addressed:</span>{" "}
                        <span className="text-slate-600">{idea.customerProblem}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Value Proposition:</span>{" "}
                        <span className="text-slate-600">{idea.valueProposition}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">Revenue Model:</span>{" "}
                        <span className="text-slate-600">{idea.revenueModel}</span>
                      </div>
                    </div>

                    {/* Validation Steps */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-700 mb-1">
                        Demand Validation Steps:
                      </div>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {idea.validationSteps?.map((s, sIdx) => (
                          <li key={sIdx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Risks */}
                    <div className="p-2.5 bg-amber-50 rounded-lg text-amber-800 text-[11px] flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <span>{idea.majorRisks}</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Button
                      onClick={() => handleSaveIdea(idea)}
                      variant={isSaved ? "secondary" : "outline"}
                      size="sm"
                      className="w-full"
                    >
                      <Bookmark className={`w-3.5 h-3.5 mr-1.5 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
                      <span>{isSaved ? "Saved to Workspace ✓" : "Save to Workspace"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Saved Ideas in Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Saved Ideas in Your Workspace ({savedIdeas.length})
            </h2>
          </div>
        </div>

        {savedIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedIdeas.map((saved) => (
              <div
                key={saved.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-xs text-slate-900 truncate">{saved.title}</h3>
                    <button
                      onClick={() => handleDeleteSavedIdea(saved.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="Remove from workspace"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-3">{saved.concept}</p>
                  <div className="mt-2 text-[11px] font-semibold text-slate-700">
                    Est. Cost: {saved.startup_cost_estimate}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <Badge variant="success">Saved</Badge>
                  <a
                    href={`/plans?fromIdea=${encodeURIComponent(saved.title)}`}
                    className="text-brand-600 hover:underline font-medium text-[11px]"
                  >
                    Generate Business Plan &rarr;
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No saved ideas yet. Fill out the generator above to discover and shortlist ideas!
          </div>
        )}
      </div>

      {/* Comparison Modal */}
      <Modal
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        title="Side-by-Side Idea Comparison"
        description="Evaluate capital efficiency, customer problems, and feasibility."
        maxWidth="4xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-semibold text-slate-700 w-32">Attribute</th>
                {selectedForComparison.map((idea, idx) => (
                  <th key={idx} className="p-3 font-bold text-slate-900 min-w-[220px]">
                    {idea.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Concept</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 text-slate-700">{idea.concept}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Est. Capital</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 font-bold text-slate-900">{idea.startupCostEstimate}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Target Market</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 text-slate-700">{idea.targetMarket}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Value Prop</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 text-slate-700">{idea.valueProposition}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Revenue Model</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 text-slate-700">{idea.revenueModel}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-600 bg-slate-50/50">Major Risks</td>
                {selectedForComparison.map((idea, idx) => (
                  <td key={idx} className="p-3 text-amber-700 bg-amber-50/30">{idea.majorRisks}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
