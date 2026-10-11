import { z } from "zod";

export const onboardingSchema = z.object({
  businessStage: z.enum(["planning", "startup", "operating", "scaling"], {
    errorMap: () => ({ message: "Please select your business stage" }),
  }),
  industry: z.string().min(2, "Please provide your industry or field of interest"),
  goals: z.string().min(3, "Please describe your primary business goal"),
  budgetRange: z.string().min(1, "Please specify your approximate starting budget"),
  targetMarket: z.string().min(2, "Please describe who your target customers are"),
  country: z.string().default("Philippines"),
  preferredCurrency: z.string().default("PHP"),
  challenge: z.string().min(3, "Please identify your biggest current challenge"),
  businessName: z.string().optional(),
});

export const ideaGeneratorSchema = z.object({
  capital: z.string().min(1, "Available capital is required"),
  industry: z.string().min(2, "Industry preference is required"),
  skills: z.string().min(2, "Skills and interests are required"),
  location: z.string().min(2, "Location or target market is required"),
  businessModel: z.enum(["online", "physical", "hybrid"], {
    errorMap: () => ({ message: "Please choose online, physical, or hybrid" }),
  }),
  timeCommitment: z.enum(["full_time", "part_time"], {
    errorMap: () => ({ message: "Please choose full-time or part-time" }),
  }),
  riskTolerance: z.enum(["low", "moderate", "high"], {
    errorMap: () => ({ message: "Please select your risk tolerance" }),
  }),
});

export const businessPlanGeneratorSchema = z.object({
  title: z.string().min(2, "Business plan title is required"),
  businessIdeaId: z.string().optional(),
  industry: z.string().min(2, "Industry is required"),
  description: z.string().min(10, "Please provide a brief description of the business"),
  targetMarket: z.string().min(2, "Target market is required"),
  startingBudget: z.string().min(1, "Starting budget is required"),
  customNotes: z.string().optional(),
});

export const marketingGeneratorSchema = z.object({
  businessType: z.string().min(2, "Business type is required"),
  productOrService: z.string().min(2, "Product or service description is required"),
  targetAudience: z.string().min(2, "Target audience description is required"),
  budget: z.string().min(1, "Marketing budget is required"),
  channels: z.array(z.string()).min(1, "Please select at least one marketing channel"),
  goal: z.string().min(3, "Marketing objective is required"),
  tone: z.string().default("Professional & Friendly"),
  language: z.string().default("English / Taglish"),
  platform: z.string().default("Facebook & Instagram"),
});

export const growthPlanSchema = z.object({
  title: z.string().min(2, "Goal title is required"),
  description: z.string().min(5, "Action description is required"),
  category: z.string().default("general"),
  targetDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["pending", "in_progress", "completed", "archived"]).default("pending"),
  successMetric: z.string().min(2, "Measurable success metric is required"),
  expectedResources: z.string().optional(),
  risks: z.string().optional(),
});

export const marketResearchSchema = z.object({
  industry: z.string().min(2, "Industry is required"),
  location: z.string().min(2, "Location is required"),
  targetAudience: z.string().min(2, "Target audience is required"),
  competitors: z.string().optional(),
  pricingInfo: z.string().optional(),
  researchQuestions: z.string().optional(),
});
