import { describe, it, expect } from "vitest";
import { evaluatePasswordRules, calculatePasswordStrength, registerSchema } from "./auth";

describe("Password and Authentication Validation", () => {
  it("should fail validation if password is shorter than 12 characters", () => {
    const rules = evaluatePasswordRules("Short123!a");
    expect(rules.length).toBe(false);
  });

  it("should pass all rules for a compliant strong password", () => {
    const rules = evaluatePasswordRules("SecurePass2026!PH");
    expect(rules.length).toBe(true);
    expect(rules.uppercase).toBe(true);
    expect(rules.lowercase).toBe(true);
    expect(rules.number).toBe(true);
    expect(rules.special).toBe(true);
    expect(rules.noLeadingTrailingSpaces).toBe(true);
    expect(rules.notCommon).toBe(true);
  });

  it("should detect leading or trailing whitespace", () => {
    const rules = evaluatePasswordRules(" SecurePass2026!PH ");
    expect(rules.noLeadingTrailingSpaces).toBe(false);
  });

  it("should reject known common passwords", () => {
    const rules = evaluatePasswordRules("password1234!");
    expect(rules.notCommon).toBe(false);
  });

  it("should calculate strength accurately", () => {
    expect(calculatePasswordStrength("123").score).toBe(1);
    expect(calculatePasswordStrength("SecurePass2026!PH").score).toBe(4);
  });

  it("should validate registerSchema mismatch passwords", () => {
    const result = registerSchema.safeParse({
      fullName: "Maria Santos",
      email: "maria@example.com",
      password: "StrongPass2026!PH",
      confirmPassword: "DifferentPassword2026!PH",
      acceptTerms: true,
      country: "Philippines",
      preferredCurrency: "PHP",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Passwords do not match");
    }
  });
});
