"use client";

import React from "react";
import { calculatePasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const { score, label, colorClass } = calculatePasswordStrength(password);

  const colors = [
    "bg-slate-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-600",
  ];

  return (
    <div className="mt-2 space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500">Strength:</span>
        <span
          className={`font-semibold ${
            score === 4
              ? "text-emerald-700"
              : score === 3
              ? "text-blue-700"
              : score === 2
              ? "text-amber-700"
              : "text-red-600"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= step ? colors[score] : "bg-slate-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
