import { z } from "zod";

export interface PasswordRuleState {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noLeadingTrailingSpaces: boolean;
  notCommon: boolean;
}

const COMMON_PASSWORDS = new Set([
  "password1234!",
  "password12345",
  "admin1234567!",
  "welcome12345!",
  "qwerty123456!",
  "changeme1234!",
  "letmein12345!",
  "iloveyou1234!",
  "pass12345678!",
]);

export function evaluatePasswordRules(password: string): PasswordRuleState {
  const length = password.length >= 12;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^A-Za-z0-9\s]/.test(password);
  const noLeadingTrailingSpaces = password.length > 0 && password.trim() === password;
  const notCommon = !COMMON_PASSWORDS.has(password.toLowerCase().trim());

  return {
    length,
    uppercase,
    lowercase,
    number,
    special,
    noLeadingTrailingSpaces,
    notCommon,
  };
}

export function calculatePasswordStrength(password: string): {
  score: number; // 0 to 4
  label: "Too Weak" | "Weak" | "Fair" | "Good" | "Strong";
  colorClass: string;
} {
  if (!password) {
    return { score: 0, label: "Too Weak", colorClass: "bg-gray-200 text-gray-500" };
  }

  if (password.length < 8) {
    return { score: 1, label: "Weak", colorClass: "bg-red-500 text-red-700" };
  }

  const rules = evaluatePasswordRules(password);
  const passedCount = Object.values(rules).filter(Boolean).length;

  if (passedCount <= 3) {
    return { score: 1, label: "Weak", colorClass: "bg-red-500 text-red-700" };
  }
  if (passedCount <= 5) {
    return { score: 2, label: "Fair", colorClass: "bg-yellow-500 text-yellow-700" };
  }
  if (passedCount <= 6) {
    return { score: 3, label: "Good", colorClass: "bg-blue-500 text-blue-700" };
  }
  return { score: 4, label: "Strong", colorClass: "bg-emerald-600 text-emerald-700" };
}

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .refine((p) => p.trim() === p, "Password cannot have leading or trailing spaces")
      .refine((p) => /[A-Z]/.test(p), "Must contain at least one uppercase letter")
      .refine((p) => /[a-z]/.test(p), "Must contain at least one lowercase letter")
      .refine((p) => /[0-9]/.test(p), "Must contain at least one number")
      .refine((p) => /[^A-Za-z0-9\s]/.test(p), "Must contain at least one special character")
      .refine(
        (p) => !COMMON_PASSWORDS.has(p.toLowerCase().trim()),
        "This password is too common or easily compromised. Please choose a more unique password."
      ),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and privacy policy"),
    // Optional profile fields
    businessName: z.string().optional(),
    industry: z.string().optional(),
    businessStage: z.string().optional(),
    country: z.string().default("Philippines"),
    preferredCurrency: z.string().default("PHP"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase().trim(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(12, "Password must be at least 12 characters")
      .refine((p) => p.trim() === p, "Password cannot have leading or trailing spaces")
      .refine((p) => /[A-Z]/.test(p), "Must contain at least one uppercase letter")
      .refine((p) => /[a-z]/.test(p), "Must contain at least one lowercase letter")
      .refine((p) => /[0-9]/.test(p), "Must contain at least one number")
      .refine((p) => /[^A-Za-z0-9\s]/.test(p), "Must contain at least one special character")
      .refine(
        (p) => !COMMON_PASSWORDS.has(p.toLowerCase().trim()),
        "This password is too common or easily compromised."
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
