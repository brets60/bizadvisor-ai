"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  ShieldCheck,
  UserCheck,
  HelpCircle,
  CheckSquare,
  Bookmark,
  AlertCircle,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export default function MarketResearchPage() {
  const [industry, setIndustry] = useState("Specialty Coffee & Beverage");
  const [location, setLocation] = useState("Quezon City / Metro Manila, Philippines");
  const [targetAudience, setTargetAudience] = useState("Office workers, remote professionals, college students");
  const [competitors, setCompetitors] = useState("Local roadside coffee stalls, pickup-only kiosks, and national chains");
  const [pricingInfo, setPricingInfo] = useState("Competitor prices range from ₱65 (roadside) to ₱180 (chain stores)");
  const [researchQuestions, setResearchQuestions] = useState("What pricing sweet-spot yields the highest volume without eroding margin?");

  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<any | null>(null);
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResearchNotes();
  }, []);

  const fetchResearchNotes = async () => {
    try {
      const res = await fetch("/api/research");
      if (res.ok) {
        const data = await res.json();
        setSavedNotes(data.researchNotes || []);
      }
    } catch (err) {
      console.error("Fetch research notes error:", err);
    }
  };

  const handleExecuteResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResearching(true);
    setError(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          location,
          targetAudience,
          competitors: competitors || undefined,
          pricingInfo: pricingInfo || undefined,
          researchQuestions: researchQuestions || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to conduct market research.");
        setIsResearching(false);
        return;
      }

      setResearchResult(data.research);
      fetchResearchNotes();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsResearching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-900">Market & Competitor Research Workspace</h1>
        </div>
        <p className="text-xs text-slate-500">
          Analyze competitive dynamics and demand patterns. Rigorously separates verified market data, user assumptions, AI hypotheses, and field validation checklists.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Research Inquiry Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleExecuteResearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Industry / Sector</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Geographic Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Target Audience</label>
              <input
                type="text"
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Known Competitors & Alternatives</label>
              <textarea
                rows={2}
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="Names or types of existing competitors in the vicinity"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Observed Pricing Data</label>
              <textarea
                rows={2}
                value={pricingInfo}
                onChange={(e) => setPricingInfo(e.target.value)}
                placeholder="Current pricing observed in market"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Specific Research Questions</label>
            <input
              type="text"
              value={researchQuestions}
              onChange={(e) => setResearchQuestions(e.target.value)}
              placeholder="e.g. How can a small entrant win against established neighborhood shops?"
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isResearching} size="md">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Conduct Market Research</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Structured Research Results */}
      {researchResult && (
        <div className="space-y-6">
          {/* Overview */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Market Landscape Overview</h2>
              <Badge variant="success">Saved to Knowledge Library ✓</Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">{researchResult.marketOverview}</p>
          </div>

          {/* 3-Way Rigorous Separation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 1. Verified Market Realities */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs pb-2 border-b border-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1. Verified Market Realities</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                {researchResult.verifiedMarketRealities?.map((v: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{v}</li>
                ))}
              </ul>
            </div>

            {/* 2. User Provided Assumptions */}
            <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs pb-2 border-b border-blue-100">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>2. User-Provided Assumptions</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                {researchResult.userProvidedAssumptions?.map((u: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{u}</li>
                ))}
              </ul>
            </div>

            {/* 3. AI Generated Hypotheses */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-xs pb-2 border-b border-amber-100">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                <span>3. AI Hypotheses (Requires Testing)</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-2 list-disc pl-4">
                {researchResult.aiGeneratedHypotheses?.map((h: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">{h}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Competitor Landscape */}
          {researchResult.competitorLandscape?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Competitor Positioning Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {researchResult.competitorLandscape.map((c: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-slate-400" />
                      <span>{c.name}</span>
                    </div>
                    <div className="text-brand-700 font-medium">{c.estimatedPositioning}</div>
                    <div className="text-slate-600 pt-1">
                      <strong className="text-emerald-700">Strengths:</strong> {c.strengths}
                    </div>
                    <div className="text-slate-600">
                      <strong className="text-red-700">Weaknesses:</strong> {c.weaknesses}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Research Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Low-Cost Field Validation Checklist
              </h3>
            </div>
            <div className="space-y-3">
              {researchResult.actionableResearchChecklist?.map((step: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">{step.step}</div>
                  <div className="text-slate-600"><strong>Purpose:</strong> {step.purpose}</div>
                  <div className="text-brand-700"><strong>How to execute locally:</strong> {step.howToVerifyLocally}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Past Research Notes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-4 h-4 text-brand-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Archived Research Sessions ({savedNotes.length})
          </h2>
        </div>

        {savedNotes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 truncate">{note.industry}</div>
                <div className="text-slate-500 text-[11px]">{note.location}</div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Saved on {formatDate(note.created_at)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No research notes recorded yet. Execute an inquiry above to begin gathering market intelligence.
          </div>
        )}
      </div>
    </div>
  );
}
