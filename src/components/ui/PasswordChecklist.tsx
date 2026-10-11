"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { evaluatePasswordRules } from "@/lib/validations/auth";

interface PasswordChecklistProps {
  password: string;
}

export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const rules = evaluatePasswordRules(password);

  const checklistItems = [
    { label: "At least 12 characters", passed: rules.length },
    { label: "One uppercase letter (A-Z)", passed: rules.uppercase },
    { label: "One lowercase letter (a-z)", passed: rules.lowercase },
    { label: "One number (0-9)", passed: rules.number },
    { label: "One special character (!@#$%...)", passed: rules.special },
    { label: "No leading or trailing spaces", passed: rules.noLeadingTrailingSpaces },
    { label: "Not a commonly compromised password", passed: rules.notCommon },
  ];

  return (
    <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
      <div className="font-semibold text-slate-700 mb-2">Password Requirements:</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {checklistItems.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-1.5 transition-colors ${
              item.passed ? "text-emerald-700 font-medium" : "text-slate-500"
            }`}
          >
            {item.passed ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
