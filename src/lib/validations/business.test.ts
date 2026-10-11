import { describe, it, expect } from "vitest";
import {
  onboardingSchema,
  ideaGeneratorSchema,
  businessPlanGeneratorSchema,
  marketingGeneratorSchema,
  growthPlanSchema,
  marketResearchSchema,
} from "./business";

describe("Business Validation Schemas", () => {
  it("should validate onboarding schema successfully", () => {
    const validOnboarding = {
      businessStage: "planning",
      industry: "Food & Beverage",
      goals: "Open a specialty cold brew stall",
      budgetRange: "₱25,000",
      targetMarket: "College students",
      country: "Philippines",
      preferredCurrency: "PHP",
      challenge: "Pricing and foot traffic",
    };

    const result = onboardingSchema.safeParse(validOnboarding);
    expect(result.success).toBe(true);
  });

  it("should reject invalid businessStage in onboarding", () => {
    const invalid = {
      businessStage: "invalid_stage",
      industry: "Retail",
      goals: "Grow sales",
      budgetRange: "₱10,000",
      targetMarket: "Neighbors",
      challenge: "Cash",
    };

    const result = onboardingSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("should validate idea generator schema", () => {
    const validIdeaInput = {
      capital: "₱50,000",
      industry: "Retail",
      skills: "Baking, Sales",
      location: "Quezon City",
      businessModel: "hybrid",
      timeCommitment: "part_time",
      riskTolerance: "moderate",
    };

    const result = ideaGeneratorSchema.safeParse(validIdeaInput);
    expect(result.success).toBe(true);
  });

  it("should validate 14-section business plan generator schema", () => {
    const validPlanInput = {
      title: "Artisan Coffee Cart Plan",
      industry: "Food & Beverage",
      description: "Mobile coffee cart providing espresso and cold brew.",
      targetMarket: "Young professionals",
      startingBudget: "₱50,000",
    };

    const result = businessPlanGeneratorSchema.safeParse(validPlanInput);
    expect(result.success).toBe(true);
  });

  it("should validate marketing generator schema and channel array requirements", () => {
    const validMarketingInput = {
      businessType: "Coffee Cart",
      productOrService: "Cold Brew",
      targetAudience: "Students",
      budget: "₱5,000",
      channels: ["TikTok", "Instagram"],
      goal: "100 customers",
      tone: "Friendly",
      language: "Taglish",
      platform: "TikTok",
    };

    const result = marketingGeneratorSchema.safeParse(validMarketingInput);
    expect(result.success).toBe(true);
  });

  it("should reject marketing input with empty channels", () => {
    const invalid = {
      businessType: "Coffee Cart",
      productOrService: "Cold Brew",
      targetAudience: "Students",
      budget: "₱5,000",
      channels: [],
      goal: "100 customers",
    };

    const result = marketingGeneratorSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
