import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft, Building2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">BizAdvisor AI</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy & AI Data Processing Disclosures</h1>
            <p className="text-xs text-slate-400 mt-1">Last Updated: October 2026</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">1. Overview</h2>
            <p>
              BizAdvisor AI is dedicated to safeguarding the privacy and commercial confidentiality of our users. This policy outlines how information is collected, stored, processed by artificial intelligence, and managed within the application.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">2. AI Data Processing Disclosures</h2>
            <p>
              To deliver personalized, context-aware business advisory services, BizAdvisor AI utilizes Google Gemini models. When you interact with our AI advisor or generate business plans:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Only the authorized context necessary for the specific calculation or advisory query (such as your industry, stage, budget range, and immediate question) is transmitted server-side.</li>
              <li>Your sensitive database credentials and plaintext account passwords are never shared or transmitted.</li>
              <li>User inputs are sanitized server-side against prompt injection and malicious control sequences.</li>
              <li>Under enterprise API agreements, customer prompts processed via the Google Gemini API are not used to train global third-party foundational models.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">3. Multi-Tenant Isolation & Ownership</h2>
            <p>
              All user records, business ideas, 14-section plans, financial models, and chat histories are strictly isolated with user-level authorization checks. Users can only query, modify, or delete their own data.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">4. Data Portability & Permanent Deletion</h2>
            <p>
              You maintain complete ownership of your business data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Data Export:</strong> You can download a complete JSON export of your profile, chats, plans, and financial models at any time from the Settings tab.</li>
              <li><strong>Account Deletion:</strong> You can permanently purge your account and all associated database records with zero retention.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
