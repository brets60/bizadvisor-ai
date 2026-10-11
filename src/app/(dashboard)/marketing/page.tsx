"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Sparkles,
  Copy,
  Check,
  Calendar,
  Share2,
  Bookmark,
  Target,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function MarketingPage() {
  const [businessType, setBusinessType] = useState("Local Specialty Coffee & Pastry Shop");
  const [productOrService, setProductOrService] = useState("Handcrafted iced espresso, matcha lattes, and artisan sourdough cookies");
  const [targetAudience, setTargetAudience] = useState("University students, remote freelancers, and neighborhood residents aged 18-35");
  const [budget, setBudget] = useState("₱5,000 / month");
  const [channels, setChannels] = useState<string[]>(["TikTok", "Instagram", "Facebook Groups"]);
  const [goal, setGoal] = useState("Drive 150 new customer visits in our launch month");
  const [tone, setTone] = useState("Warm, Friendly & Trendy");
  const [language, setLanguage] = useState("English & Taglish (Conversational)");
  const [platform, setPlatform] = useState("TikTok & Instagram Reels");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copiedCaptionIndex, setCopiedCaptionIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSavedMarketingPlans();
  }, []);

  const fetchSavedMarketingPlans = async () => {
    try {
      const res = await fetch("/api/marketing");
      if (res.ok) {
        const data = await res.json();
        setSavedPlans(data.marketingPlans || []);
      }
    } catch (err) {
      console.error("Fetch marketing plans error:", err);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          productOrService,
          targetAudience,
          budget,
          channels,
          goal,
          tone,
          language,
          platform,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate marketing strategy.");
        setIsGenerating(false);
        return;
      }

      setGeneratedPlan(data.content);
      fetchSavedMarketingPlans();
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyCaption = (caption: string, idx: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedCaptionIndex(idx);
    setTimeout(() => setCopiedCaptionIndex(null), 2000);
  };

  const toggleChannel = (channel: string) => {
    if (channels.includes(channel)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== channel));
      }
    } else {
      setChannels([...channels, channel]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Megaphone className="w-5 h-5 text-rose-600" />
          <h1 className="text-xl font-bold text-slate-900">AI Marketing Strategy & Social Copy Generator</h1>
        </div>
        <p className="text-xs text-slate-500">
          Create complete go-to-market strategies, 4-week campaign calendars, ready-to-use social captions, and acquisition tactics.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Generator Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Business Type</label>
              <input
                type="text"
                required
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Monthly Marketing Budget</label>
              <input
                type="text"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Primary Objective / Goal</label>
              <input
                type="text"
                required
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Products or Offerings</label>
              <textarea
                rows={2}
                required
                value={productOrService}
                onChange={(e) => setProductOrService(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Target Audience Profile</label>
              <textarea
                rows={2}
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Tone & Personality</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Warm, Friendly & Trendy">Warm, Friendly & Trendy</option>
                <option value="Professional & Authoritative">Professional & Authoritative</option>
                <option value="Bold, High Energy & Persuasive">Bold, High Energy & Persuasive</option>
                <option value="Minimalist & Elegant">Minimalist & Elegant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Language Style</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="English & Taglish (Conversational)">English & Taglish (Conversational)</option>
                <option value="Professional English">Professional English</option>
                <option value="Pure Tagalog / Filipino">Pure Tagalog / Filipino</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Primary Channel Format</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="TikTok & Instagram Reels">TikTok & Instagram Reels (Short Video)</option>
                <option value="Facebook Page & Community Groups">Facebook Page & Community Groups</option>
                <option value="Shopee / Lazada Feed">Shopee / Lazada Feed</option>
                <option value="LinkedIn & Email Newsletter">LinkedIn & Email Newsletter (B2B)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Marketing Channels to Incorporate:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                "TikTok",
                "Instagram",
                "Facebook Groups",
                "Influencer Seeding / UGC",
                "Google Business / Maps",
                "Local Flyers / Pop-ups",
                "Referral Programs",
              ].map((c) => {
                const isSelected = channels.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleChannel(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {c} {isSelected ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isGenerating} size="md">
              <Sparkles className="w-4 h-4 mr-1.5" />
              <span>Generate Marketing Strategy</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Generated Marketing Strategy Output */}
      {generatedPlan && (
        <div className="space-y-6">
          {/* Executive Strategy & Audience */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" />
                <h2 className="text-base font-bold text-slate-900">Executive Go-To-Market Blueprint</h2>
              </div>
              <Badge variant="success">Auto-Saved to Library ✓</Badge>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-700 leading-relaxed">
              <strong>Core Strategy:</strong> {generatedPlan.executiveStrategy}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <div className="font-bold text-slate-800 mb-1">Target Persona Breakdown</div>
                <div className="text-slate-600 leading-relaxed">{generatedPlan.targetAudienceProfile}</div>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 bg-white">
                <div className="font-bold text-slate-800 mb-1">Branding & Tone Principles</div>
                <div className="text-slate-600 leading-relaxed">{generatedPlan.brandingSuggestions}</div>
              </div>
            </div>
          </div>

          {/* Ready-to-Publish Social Media Captions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Share2 className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900">
                Ready-to-Publish Promotional Captions ({generatedPlan.socialMediaPostIdeas?.length || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedPlan.socialMediaPostIdeas?.map((post: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="info">{post.platform}</Badge>
                      <button
                        onClick={() =>
                          handleCopyCaption(
                            `${post.caption}\n\n${(post.suggestedHashtags || []).join(" ")}`,
                            idx
                          )
                        }
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                      >
                        {copiedCaptionIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-semibold">Copied ✓</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Caption</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-xs font-bold text-slate-900">Hook: &ldquo;{post.hook}&rdquo;</div>
                    <div className="text-xs text-slate-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                      {post.caption}
                    </div>

                    <div className="text-[11px] text-brand-600 font-medium">CTA: {post.callToAction}</div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.suggestedHashtags?.map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4-Week Campaign Calendar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">4-Week Campaign Execution Calendar</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedPlan.campaignCalendar?.map((week: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="text-xs font-bold text-slate-900">{week.week}: {week.theme}</div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                    {week.activities?.map((act: string, aIdx: number) => (
                      <li key={aIdx}>{act}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Campaign Performance KPIs</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {generatedPlan.performanceMetrics?.map((m: any, idx: number) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-xs">
                  <div className="font-bold text-slate-800">{m.metric}</div>
                  <div className="text-brand-700 font-bold mt-1 text-sm">{m.target}</div>
                  <div className="text-slate-500 text-[11px] mt-1">Tracking: {m.trackingMethod}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
