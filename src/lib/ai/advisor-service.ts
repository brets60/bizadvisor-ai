import { callGemini, callGeminiStructured, sanitizePromptInput } from "./gemini";

export interface UserBusinessContext {
  fullName?: string;
  businessName?: string | null;
  industry?: string | null;
  businessStage?: string | null;
  budgetRange?: string | null;
  targetMarket?: string | null;
  goals?: string | null;
  challenge?: string | null;
  currency?: string;
  country?: string;
}

function buildContextPrompt(context: UserBusinessContext): string {
  const parts: string[] = [];
  parts.push(`User Region & Defaults: Country: ${context.country || "Philippines"}, Currency: ${context.currency || "PHP"}`);
  if (context.businessName) parts.push(`Business Name: ${context.businessName}`);
  if (context.industry) parts.push(`Industry: ${context.industry}`);
  if (context.businessStage) parts.push(`Business Stage: ${context.businessStage}`);
  if (context.budgetRange) parts.push(`Available Budget Range: ${context.budgetRange}`);
  if (context.targetMarket) parts.push(`Target Market: ${context.targetMarket}`);
  if (context.goals) parts.push(`Primary Goal: ${context.goals}`);
  if (context.challenge) parts.push(`Key Challenge: ${context.challenge}`);

  return parts.length > 0 ? `\n--- USER BUSINESS CONTEXT ---\n${parts.join("\n")}\n--- END CONTEXT ---` : "";
}

/**
 * 1. AI Business Advisor Chat
 */
export interface AdviseBusinessInput {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  context: UserBusinessContext;
  apiKey?: string;
}

export interface AdviseBusinessResponse {
  answer: string;
  suggestedFollowUps: string[];
}

export async function adviseBusiness(input: AdviseBusinessInput): Promise<AdviseBusinessResponse> {
  const cleanQuestion = sanitizePromptInput(input.question);
  const contextStr = buildContextPrompt(input.context);

  const historyStr = (input.history || [])
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`)
    .join("\n\n");

  const systemInstruction = `You are BizAdvisor AI, a premier senior business advisor, startup architect, and practical financial mentor powered by Google Gemini.
Your mission is to answer ANY question the user asks with sharp, responsive, practical, real-world business acumen.

RESPONSE PRINCIPLES:
1. DYNAMICALLY ADAPTIVE & RESPONSIVE:
   - For strategic/comprehensive business questions (e.g., "How to start a food business with ₱20,000?", "How to scale my store?"):
     Deliver a clear, prioritized action plan:
     • Executive Summary / Direct Recommendation
     • Step-by-step implementation roadmap
     • Realistic budget estimates & preliminary assumptions (in PHP ₱ or local currency)
     • Key operational risks & practical mitigations
     • Immediate next action to take today
   - For specific/factual questions (e.g., "How do I calculate profit margin?", "What permits do I need from DTI?", "How much does a commercial espresso machine cost?"):
     Answer directly, concisely, and specifically with numbers, formulas, examples, and local processes without unnecessary preamble.
   - For comparisons (e.g., "Food cart vs online bakery?"):
     Give a structured comparison table or bullet points of startup cost, operational complexity, margin, and ideal founder profile.
   - For greetings, casual questions, or open inquiries (e.g., "Hi", "Can you help me?"):
     Reply warmly, professionally, explain how you can assist their business decisions, and invite their ideas.
2. LOCAL & GLOBAL MARKET AWARENESS:
   - Default to Philippine market context (PHP ₱ currency, DTI/SEC/BIR, Barangay Clearance, Mayor's Permit, Shopee, Lazada, TikTok Shop, GrabFood, FoodPanda, GCash, Maya, local suppliers).
   - If the user specifies another country or currency, adapt seamlessly to their jurisdiction.
3. CLEAR FORMATTING:
   - Use clean, well-structured markdown: bold key takeaways, concise bullet points, formatted formulas.
   - Keep answers easy to scan on mobile screens.
4. INTELLIGENT FOLLOW-UPS:
   - Conclude your response with 2 to 3 smart follow-up suggestions in a \`\`\`followups block.`;

  const prompt = `${contextStr}

${historyStr ? `Previous Conversation:\n${historyStr}\n\n` : ""}User Question:
${cleanQuestion}

Please provide your comprehensive advisory response in markdown, followed at the very end by:
\`\`\`followups
["Follow-up inquiry 1?", "Follow-up inquiry 2?", "Follow-up inquiry 3?"]
\`\`\``;

  const raw = await callGemini(prompt, {
    systemInstruction,
    temperature: 0.6,
    apiKey: input.apiKey,
  });

  // Extract followups if present
  let answer = raw;
  let suggestedFollowUps: string[] = [];

  const followUpMatch = raw.match(/```(?:followups|json)?\s*(\[\s*[\s\S]*?\])\s*```/);
  if (followUpMatch) {
    try {
      suggestedFollowUps = JSON.parse(followUpMatch[1]);
      answer = raw.replace(/```(?:followups|json)?\s*\[\s*[\s\S]*?\]\s*```/, "").trim();
    } catch {
      suggestedFollowUps = [];
    }
  }

  if (suggestedFollowUps.length === 0) {
    const qLower = cleanQuestion.toLowerCase();
    if (qLower.includes("cost") || qLower.includes("capital") || qLower.includes("budget") || qLower.includes("price")) {
      suggestedFollowUps = [
        "How can I test this with my current budget?",
        "What are the recurring monthly operating expenses?",
        "How do I calculate the break-even volume for this?",
      ];
    } else if (qLower.includes("market") || qLower.includes("sell") || qLower.includes("customer")) {
      suggestedFollowUps = [
        "What low-cost marketing strategy works best for this?",
        "How can I attract my first 20 paying customers?",
        "How should I differentiate from local competitors?",
      ];
    } else {
      suggestedFollowUps = [
        "What are the first 3 steps to implement this?",
        "What permits and legal requirements apply?",
        "What are the biggest operational risks to watch for?",
      ];
    }
  }

  return {
    answer: answer.trim(),
    suggestedFollowUps: suggestedFollowUps.slice(0, 3),
  };
}

/**
 * 2. Business Idea Generator
 */
export interface GenerateBusinessIdeasInput {
  capital: string;
  industry: string;
  skills: string;
  location: string;
  businessModel: string;
  timeCommitment: string;
  riskTolerance: string;
  context: UserBusinessContext;
}

export interface GeneratedIdea {
  title: string;
  concept: string;
  targetMarket: string;
  customerProblem: string;
  valueProposition: string;
  startupCostEstimate: string;
  costBreakdownAssumptions: string;
  revenueModel: string;
  initialMarketingStrategy: string;
  majorRisks: string;
  validationSteps: string[];
}

export async function generateBusinessIdeas(
  input: GenerateBusinessIdeasInput
): Promise<GeneratedIdea[]> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

Generate 3 viable, highly realistic, tailored business ideas based on the following entrepreneur criteria:
- Available Capital: ${input.capital}
- Preferred Industry: ${input.industry}
- Skills & Background: ${input.skills}
- Target Location / Market: ${input.location}
- Business Model: ${input.businessModel}
- Time Commitment: ${input.timeCommitment}
- Risk Tolerance: ${input.riskTolerance}
- Currency: ${input.context.currency || "PHP"}

Requirements:
- Must be realistic and grounded in the actual market context.
- Estimated startup costs must be explicitly labeled as preliminary assumptions, not certified supplier quotes.
- Do NOT guarantee profits or fabricate guaranteed ROI.
- Provide practical demand validation steps.

Respond with an array of objects matching this exact JSON structure:
[
  {
    "title": "Business Name/Title",
    "concept": "Clear 2-3 sentence description of the business model and operation",
    "targetMarket": "Specific customer segment with demographic and behavioral traits",
    "customerProblem": "The painful friction, inconvenience, or unmet need this solves",
    "valueProposition": "Why customers will choose this over existing alternatives",
    "startupCostEstimate": "Estimated range (e.g. ₱15,000 - ₱25,000)",
    "costBreakdownAssumptions": "Preliminary itemization: inventory, equipment, permits, marketing reserve",
    "revenueModel": "Pricing structure and primary sales channels",
    "initialMarketingStrategy": "Cost-effective customer acquisition tactics",
    "majorRisks": "Market risks, operational risks, competition, and cash-flow sensitivity",
    "validationSteps": ["Step 1 to test demand without heavy spending", "Step 2", "Step 3"]
  }
]`;

  return callGeminiStructured<GeneratedIdea[]>(
    prompt,
    "You are an expert venture builder and startup incubator director specializing in lean startup methodologies."
  );
}

/**
 * 3. Business Plan Generator (14 Sections)
 */
export interface GenerateBusinessPlanInput {
  title: string;
  industry: string;
  description: string;
  targetMarket: string;
  startingBudget: string;
  customNotes?: string;
  context: UserBusinessContext;
}

export interface BusinessPlanSections {
  executiveSummary: string;
  businessDescription: string;
  customerProblem: string;
  productsOrServices: string;
  targetMarket: string;
  competitivePositioning: string;
  marketingStrategy: string;
  operationalPlan: string;
  startupCostEstimates: string;
  revenueAssumptions: string;
  expenseAssumptions: string;
  breakEvenAnalysis: string;
  risksAndMitigation: string;
  first90DayActionPlan: string;
}

export async function generateBusinessPlan(
  input: GenerateBusinessPlanInput
): Promise<BusinessPlanSections> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

Generate a complete, professional, 14-section editable Business Plan for:
- Business Plan Title: ${input.title}
- Industry: ${input.industry}
- Overview: ${input.description}
- Target Market: ${input.targetMarket}
- Available Budget: ${input.startingBudget}
- Additional Notes: ${input.customNotes || "None"}
- Currency: ${input.context.currency || "PHP"}

CRITICAL REQUIREMENTS:
- Produce thorough, high-quality, practical content for EVERY one of the 14 sections.
- Clearly label financial projections as preliminary assumptions and estimates, not guaranteed results.
- Structure must return a JSON object with these 14 keys:
  "executiveSummary",
  "businessDescription",
  "customerProblem",
  "productsOrServices",
  "targetMarket",
  "competitivePositioning",
  "marketingStrategy",
  "operationalPlan",
  "startupCostEstimates",
  "revenueAssumptions",
  "expenseAssumptions",
  "breakEvenAnalysis",
  "risksAndMitigation",
  "first90DayActionPlan"`;

  return callGeminiStructured<BusinessPlanSections>(
    prompt,
    "You are an enterprise business strategy consultant producing bankable, thorough business plans."
  );
}

/**
 * 4. Marketing Strategy Generator
 */
export interface GenerateMarketingPlanInput {
  businessType: string;
  productOrService: string;
  targetAudience: string;
  budget: string;
  channels: string[];
  goal: string;
  tone: string;
  language: string;
  platform: string;
  context: UserBusinessContext;
}

export interface GeneratedMarketingPlan {
  executiveStrategy: string;
  targetAudienceProfile: string;
  channelStrategy: { channel: string; rationale: string; budgetSharePercent: number }[];
  campaignCalendar: { week: string; theme: string; activities: string[] }[];
  socialMediaPostIdeas: {
    platform: string;
    hook: string;
    caption: string;
    callToAction: string;
    suggestedHashtags: string[];
  }[];
  customerAcquisitionTactics: string[];
  brandingSuggestions: string;
  performanceMetrics: { metric: string; target: string; trackingMethod: string }[];
}

export async function generateMarketingPlan(
  input: GenerateMarketingPlanInput
): Promise<GeneratedMarketingPlan> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

Create an actionable, localized marketing strategy:
- Business Type: ${input.businessType}
- Offering: ${input.productOrService}
- Target Audience: ${input.targetAudience}
- Budget: ${input.budget} (${input.context.currency || "PHP"})
- Selected Channels: ${input.channels.join(", ")}
- Primary Goal: ${input.goal}
- Brand Tone: ${input.tone}
- Language: ${input.language}
- Primary Platforms: ${input.platform}

Requirements:
- Real promotional copy suited for the specified language/tone.
- 5 ready-to-publish social media captions with engaging hooks, clear value, and strong CTAs.
- 4-week structured calendar.
- Realistic KPIs and acquisition tactics.

Return valid JSON matching the GeneratedMarketingPlan schema with keys:
"executiveStrategy", "targetAudienceProfile", "channelStrategy", "campaignCalendar", "socialMediaPostIdeas", "customerAcquisitionTactics", "brandingSuggestions", "performanceMetrics".`;

  return callGeminiStructured<GeneratedMarketingPlan>(
    prompt,
    "You are a growth marketing director and brand strategist specializing in social commerce and customer acquisition."
  );
}

/**
 * 5. Business Growth Planner
 */
export interface CreateGrowthPlanInput {
  focusArea: string;
  currentBottleneck: string;
  targetGoal: string;
  context: UserBusinessContext;
}

export interface GrowthActionMilestone {
  title: string;
  description: string;
  category: "retention" | "pricing" | "operations" | "marketing" | "general";
  targetTimelineDays: number;
  priority: "low" | "medium" | "high" | "urgent";
  successMetric: string;
  expectedResources: string;
  risks: string;
}

export async function createGrowthPlan(
  input: CreateGrowthPlanInput
): Promise<GrowthActionMilestone[]> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

Develop 5 to 7 measurable, prioritized growth action milestones for:
- Growth Focus Area: ${input.focusArea}
- Current Bottleneck: ${input.currentBottleneck}
- Target Goal: ${input.targetGoal}

Each milestone must be a concrete, trackable initiative.
Return an array of JSON objects with keys:
"title", "description", "category" (retention/pricing/operations/marketing/general), "targetTimelineDays" (e.g. 7, 14, 30, 60), "priority" (low/medium/high/urgent), "successMetric", "expectedResources", "risks".`;

  return callGeminiStructured<GrowthActionMilestone[]>(
    prompt,
    "You are a Chief Operating Officer and growth consultant helping companies execute structured scale-up sprints."
  );
}

/**
 * 6. Financial Results AI Explainer
 */
export interface ExplainFinancialInput {
  calcType: "startup_cost" | "profit_margin" | "break_even" | "cash_flow";
  inputs: Record<string, any>;
  results: Record<string, any>;
  context: UserBusinessContext;
}

export async function explainFinancialResults(
  input: ExplainFinancialInput
): Promise<string> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

The user performed a deterministic financial calculation in the ${input.calcType} tool.
Calculation Inputs:
${JSON.stringify(input.inputs, null, 2)}

Calculated Results:
${JSON.stringify(input.results, null, 2)}

Provide an expert financial evaluation:
1. Clear interpretation of what these numbers mean for their business in simple terms.
2. Benchmark assessment (Is this margin healthy? Is the break-even volume realistic? Is the startup capital allocation balanced?).
3. Specific red flags or hidden vulnerabilities.
4. Three practical management actions to optimize profitability, protect cash runway, or reduce unit costs.
5. Emphasize that these figures are based on their specific mathematical inputs and should be cross-verified with actual vendor pricing.`;

  return callGemini(prompt, {
    systemInstruction:
      "You are a Chartered Financial Analyst (CFA) and fractional CFO advising small business owners in clear, actionable terms.",
    temperature: 0.5,
  });
}

/**
 * 7. Market and Competitor Research
 */
export interface ConductMarketResearchInput {
  industry: string;
  location: string;
  targetAudience: string;
  competitors?: string;
  pricingInfo?: string;
  researchQuestions?: string;
  context: UserBusinessContext;
}

export interface MarketResearchResult {
  marketOverview: string;
  competitorLandscape: { name: string; estimatedPositioning: string; strengths: string; weaknesses: string }[];
  verifiedMarketRealities: string[];
  userProvidedAssumptions: string[];
  aiGeneratedHypotheses: string[];
  actionableResearchChecklist: { step: string; purpose: string; howToVerifyLocally: string }[];
}

export async function conductMarketResearch(
  input: ConductMarketResearchInput
): Promise<MarketResearchResult> {
  const contextStr = buildContextPrompt(input.context);

  const prompt = `${contextStr}

Conduct a structured market and competitive landscape analysis:
- Industry: ${input.industry}
- Geographic Location: ${input.location}
- Target Audience: ${input.targetAudience}
- Known Competitors: ${input.competitors || "Not specified by user"}
- Current Pricing Information: ${input.pricingInfo || "Not specified"}
- Specific Research Inquiries: ${input.researchQuestions || "General competitive dynamics and demand validation"}

CRITICAL RULE:
Strictly separate:
1. Verified market realities (industry facts, verifiable consumer behaviors, public benchmarks)
2. User-provided assumptions
3. AI-generated hypotheses (needs field validation)
4. A concrete, low-cost field research checklist to verify pricing, foot traffic, and demand locally instead of inventing unverified claims.

Return valid JSON with keys:
"marketOverview", "competitorLandscape", "verifiedMarketRealities", "userProvidedAssumptions", "aiGeneratedHypotheses", "actionableResearchChecklist".`;

  return callGeminiStructured<MarketResearchResult>(
    prompt,
    "You are a commercial market research analyst and field intelligence consultant."
  );
}
