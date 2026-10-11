"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Download,
  Trash2,
  Check,
  AlertCircle,
  Shield,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function SettingsPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("Philippines");
  const [currency, setCurrency] = useState("PHP");

  // Business Profile
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [businessStage, setBusinessStage] = useState("planning");
  const [budgetRange, setBudgetRange] = useState("");
  const [targetMarket, setTargetMarket] = useState("");
  const [goals, setGoals] = useState("");
  const [challenge, setChallenge] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setFullName(data.user.fullName || "");
          setEmail(data.user.email || "");
          setCountry(data.user.country || "Philippines");
          setCurrency(data.user.currency || "PHP");

          const bp = data.user.businessProfile;
          if (bp) {
            setBusinessName(bp.business_name || "");
            setIndustry(bp.industry || "");
            setBusinessStage(bp.business_stage || "planning");
            setBudgetRange(bp.budget_range || "");
            setTargetMarket(bp.target_market || "");
            setGoals(bp.goals || "");
            setChallenge(bp.challenge || "");
          }
        }
      }
    } catch (err) {
      console.error("Fetch profile failed:", err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName || undefined,
          businessStage,
          industry,
          goals,
          budgetRange,
          targetMarket,
          country,
          preferredCurrency: currency,
          challenge,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setError("An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    window.open("/api/auth/account/export", "_blank");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmationText !== "DELETE") {
      alert('Please type "DELETE" to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/account/delete", { method: "DELETE" });
      if (res.ok) {
        router.push("/register");
        router.refresh();
      }
    } catch (err) {
      alert("Failed to delete account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon className="w-5 h-5 text-slate-700" />
          <h1 className="text-xl font-bold text-slate-900">Account & Advisory Preferences</h1>
        </div>
        <p className="text-xs text-slate-500">
          Manage your personal account credentials, business profile context, data privacy, and exports.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>Profile context updated successfully! Your AI advisory responses will reflect these updates.</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">User Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={email}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Country / Operating Market</label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Default Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
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

        {/* Business Profile Context */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Personalized Business Context (AI Engine)</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">Business or Brand Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Manila Brews"
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Industry / Niche</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Business Stage</label>
              <select
                value={businessStage}
                onChange={(e) => setBusinessStage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              >
                <option value="planning">Planning first business</option>
                <option value="startup">Early startup</option>
                <option value="operating">Operating business</option>
                <option value="scaling">Growth / Scaling</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">Starting Budget Range</label>
              <input
                type="text"
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Target Customers</label>
            <input
              type="text"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Primary Business Objective</label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">Current Key Challenge</label>
            <textarea
              rows={2}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              className="mt-1 block w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isLoading} size="md">
              <Check className="w-4 h-4 mr-1.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>
      </form>

      {/* Data Management & Security */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Shield className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-900">Privacy & Data Governance</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-800">Export All Business Data</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Download a complete JSON export of your profile, saved advice, ideas, plans, and financial models.
            </div>
          </div>
          <Button onClick={handleExportData} variant="outline" size="sm">
            <Download className="w-3.5 h-3.5 mr-1" />
            <span>Download Data (.json)</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
          <div>
            <div className="text-xs font-semibold text-red-800">Permanently Delete Account</div>
            <div className="text-[11px] text-red-600/80 mt-0.5">
              Permanently purges all business records, generated plans, and conversations. This action cannot be reversed.
            </div>
          </div>
          <Button
            onClick={() => setDeleteModalOpen(true)}
            variant="danger"
            size="sm"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Delete Account</span>
          </Button>
        </div>
      </div>

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Permanent Account Deletion"
        description="This will permanently delete your profile, business plans, financial models, and conversations."
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please type <strong className="text-red-700">DELETE</strong> below to confirm.
          </p>
          <input
            type="text"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE"
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:border-red-500 focus:outline-none"
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              disabled={deleteConfirmationText !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
