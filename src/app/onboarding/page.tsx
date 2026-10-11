"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const STEPS = [
  { id: 1, title: "Business Stage", desc: "Where are you currently at?" },
  { id: 2, title: "Industry & Category", desc: "What industry are you operating in?" },
  { id: 3, title: "Primary Goal", desc: "What is your top business objective?" },
  { id: 4, title: "Capital & Budget", desc: "What is your approximate budget?" },
  { id: 5, title: "Target Audience", desc: "Who are your primary customers?" },
  { id: 6, title: "Location & Currency", desc: "Where do you operate?" },
  { id: 7, title: "Current Challenge", desc: "What is your biggest current friction?" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [businessStage, setBusinessStage] = useState<"planning" | "startup" | "operating" | "scaling">("planning");
  const [industry, setIndustry] = useState("Food & Beverage / Restaurant");
  const [customIndustry, setCustomIndustry] = useState("");
  const [goals, setGoals] = useState("Launch our first profitable physical or online store");
  const [budgetRange, setBudgetRange] = useState("₱10,000 - ₱50,000");
  const [targetMarket, setTargetMarket] = useState("Local neighborhood residents and young professionals");
  const [country, setCountry] = useState("Philippines");
  const [preferredCurrency, setPreferredCurrency] = useState("PHP");
  const [challenge, setChallenge] = useState("Deciding on pricing, initial capital allocation, and attracting customers");

  const handleNext = () => {
    setError(null);
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = async () => {
    setIsSubmitting(true);
    setError(null);

    const resolvedIndustry = customIndustry.trim() || industry;

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim() || undefined,
          businessStage,
          industry: resolvedIndustry,
          goals,
          budgetRange,
          targetMarket,
          country,
          preferredCurrency,
          challenge,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save onboarding details.");
        setIsSubmitting(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An error occurred while completing onboarding.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-md shadow-brand-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">BizAdvisor AI</span>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
            <span>Step {currentStep} of 7: {STEPS[currentStep - 1].title}</span>
            <span className="text-brand-600">{Math.round((currentStep / 7) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">{STEPS[currentStep - 1].title}</h2>
            <p className="text-xs text-slate-500 mt-1">{STEPS[currentStep - 1].desc}</p>
          </div>

          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Are you planning a business or already running one?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "planning", title: "Planning My First Business", desc: "Exploring ideas, studying feasibility & budget" },
                    { key: "startup", title: "Early Startup / Pre-launch", desc: "Preparing to launch within the next 1-3 months" },
                    { key: "operating", title: "Existing Business Owner", desc: "Actively selling and operating day-to-day" },
                    { key: "scaling", title: "Looking to Scale & Expand", desc: "Established and seeking growth or higher margins" },
                  ].map((option) => (
                    <div
                      key={option.key}
                      onClick={() => setBusinessStage(option.key as any)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        businessStage === option.key
                          ? "border-brand-500 bg-brand-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className="font-semibold text-sm text-slate-900">{option.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{option.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700">Business or Project Name (Optional)</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Quezon City Artisan Bakery"
                  className="mt-1 block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  What industry or sector are you interested in?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    "Food & Beverage / Restaurant",
                    "E-Commerce & Online Selling",
                    "Freelance Services & Consulting",
                    "Retail & Sari-Sari Store",
                    "Health, Beauty & Personal Care",
                    "Laundry & Dry Cleaning",
                    "Agriculture & Agribusiness",
                    "Technology & SaaS",
                  ].map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => {
                        setIndustry(ind);
                        setCustomIndustry("");
                      }}
                      className={`text-left p-3 rounded-lg border text-xs font-medium transition-colors ${
                        industry === ind && !customIndustry
                          ? "border-brand-500 bg-brand-50 text-brand-800"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600">Or enter custom industry:</label>
                <input
                  type="text"
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  placeholder="e.g. Pet Care, Logistics, Education..."
                  className="mt-1 block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                What is your primary business goal right now?
              </label>
              <div className="space-y-2">
                {[
                  "Generate supplementary income on the side",
                  "Launch our first profitable physical or online store",
                  "Double monthly revenues and optimize profit margins",
                  "Build a sustainable, full-time independent company",
                  "Streamline operations and reduce overhead costs",
                ].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGoals(g)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-medium transition-colors ${
                      goals === g
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600">Custom goal details:</label>
                <input
                  type="text"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="mt-1 block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                What is your approximate starting or operating budget?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Under ₱10,000 (Micro / Lean)",
                  "₱10,000 - ₱50,000",
                  "₱50,000 - ₱150,000",
                  "₱150,000 - ₱500,000",
                  "₱500,000 - ₱1,500,000",
                  "₱1,500,000+ (Growth capital)",
                ].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBudgetRange(b)}
                    className={`p-3 rounded-lg border text-xs font-medium transition-colors ${
                      budgetRange === b
                        ? "border-brand-500 bg-brand-50 text-brand-800"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                Who are your target customers?
              </label>
              <textarea
                rows={3}
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g. Working professionals aged 22-35 in urban areas, college students looking for quick affordable meals..."
                className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-500">
                Tip: The more specific you are, the more tailored your AI advisor recommendations will be.
              </p>
            </div>
          )}

          {/* STEP 6 */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Country or Region</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Default: Philippines</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Preferred Currency</label>
                  <select
                    value={preferredCurrency}
                    onChange={(e) => setPreferredCurrency(e.target.value)}
                    className="mt-1 block w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
                  >
                    <option value="PHP">Philippine Peso (PHP ₱)</option>
                    <option value="USD">US Dollar (USD $)</option>
                    <option value="EUR">Euro (EUR €)</option>
                    <option value="SGD">Singapore Dollar (SGD S$)</option>
                    <option value="CAD">Canadian Dollar (CAD CA$)</option>
                    <option value="AUD">Australian Dollar (AUD AU$)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7 */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-700">
                What is your biggest current business challenge or unknown?
              </label>
              <textarea
                rows={3}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="e.g. Deciding product pricing, finding reliable suppliers, marketing on Facebook/TikTok with limited budget..."
                className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  All set! These preferences are now stored and will actively tailor all AI advisory, plans, and financial insights.
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <Button type="button" variant="secondary" onClick={handleBack} size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                isLoading={isSubmitting}
                size="md"
              >
                {currentStep === 7 ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-1.5" />
                    <span>Complete Onboarding</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
