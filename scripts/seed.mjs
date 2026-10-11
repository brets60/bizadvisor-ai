import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("Seeding development demo account for BizAdvisor AI...");

  // Password for demo user: "DemoPass2026!PH" (Fulfills all password security rules)
  const passwordHash = await bcrypt.hash("DemoPass2026!PH", 10);

  // Upsert demo profile
  const profile = await db.profile.upsert({
    where: { email: "founder@bizadvisor.ph" },
    update: {},
    create: {
      full_name: "Juan Dela Cruz",
      email: "founder@bizadvisor.ph",
      password_hash: passwordHash,
      email_verified: true,
      preferred_currency: "PHP",
      country: "Philippines",
      business_profile: {
        create: {
          business_name: "Manila Brews Specialty Coffee",
          industry: "Food & Beverage / Coffee Cart",
          business_stage: "startup",
          budget_range: "₱50,000 - ₱100,000",
          target_market: "College students, remote workers, and commuting professionals in Quezon City",
          goals: "Achieve break-even within 60 days and open a 2nd pop-up cart in 6 months",
          challenge: "Determining optimal pricing markups, inventory waste control, and initial marketing",
          onboarding_completed: true,
        },
      },
    },
    include: {
      business_profile: true,
    },
  });

  console.log(`Demo Profile ready: ${profile.email}`);

  // 1. Seed Conversation & Messages
  const conversation = await db.conversation.create({
    data: {
      user_id: profile.id,
      title: "Pricing Strategy for Artisan Cold Brew in QC",
      messages: {
        create: [
          {
            role: "user",
            content: "What business can I start with ₱50,000 in Quezon City, and how should I price my drinks?",
          },
          {
            role: "assistant",
            content: `1. Understanding the problem:
Starting with ₱50,000 in Quezon City requires a lean, low-overhead operational model. High-rent brick-and-mortar setups are precluded; a pop-up cold brew cart or delivery-first beverage brand is ideal.

2. Recommended approach:
Deploy a minimalist mobile cart or pop-up kiosk outside transport hubs, co-working spaces, or universities. Focus on high-margin cold brews, matcha, and signature syrups that do not require heavy espresso machinery.

3. Step-by-step action plan:
- Step 1: Source commercial-grade immersion cold brew buckets and local Arabica/Robusta beans from Benguet or Sagada.
- Step 2: Formulate standard 16oz and 22oz recipes with documented gram-per-cup yield to control COGS.
- Step 3: Secure Barangay business clearance and Mayor's permit for mobile vending.
- Step 4: Launch social pre-orders on TikTok and Instagram with free delivery within a 2km radius.

4. Estimated budget breakdown (Preliminary planning assumptions):
- Commercial immersion setup & kegs: ₱12,000
- Initial bean inventory & dairy/oat milk: ₱8,000
- Custom cups, lids, and seal stickers: ₱6,000
- Mobile cart fabrication / signage: ₱14,000
- Permits & contingency reserve: ₱10,000
Total Estimated Capital: ₱50,000

5. Potential risks:
- Ice melting / temperature control during outdoor summer events.
- Highly competitive roadside ₱39 iced coffee stands (counter by emphasizing bean quality and fresh brew).

6. How to measure success:
- Gross profit margin exceeding 55%.
- Selling minimum 35 cups/day at average order value of ₱95.

7. Suggested next step:
Use the Profit Margin Calculator in the Financial Tools tab to calculate your exact bean and cup cost before printing menus.`,
            is_saved: true,
          },
        ],
      },
    },
  });

  // 2. Seed Business Idea
  await db.businessIdea.create({
    data: {
      user_id: profile.id,
      title: "Mobile Cold Brew & Matcha Kiosk",
      concept: "A compact, modular bicycle or cart kiosk serving premium iced coffee, dirty matcha, and cold brews using locally sourced Philippine coffee beans.",
      target_market: "University students and office workers in Katipunan and Eastwood seeking quality coffee under ₱110.",
      startup_cost_estimate: "₱45,000 - ₱65,000",
      assumptions: "Preliminary assumptions: cart fabrication ₱15k, grinder ₱8k, cold brew gear ₱6k, ingredients & cups ₱15k, permits ₱6k.",
      risks: "Weather fluctuations, foot-traffic variability, permits enforcement.",
      status: "saved",
      raw_data: JSON.stringify({
        title: "Mobile Cold Brew & Matcha Kiosk",
        concept: "A compact, modular bicycle or cart kiosk serving premium iced coffee.",
        targetMarket: "Students and young professionals",
        customerProblem: "High coffee shop prices (₱180+) vs poor quality 3-in-1 roadside mixes",
        valueProposition: "Specialty-grade local beans at an accessible ₱85-₱110 price point",
        startupCostEstimate: "₱45,000 - ₱65,000",
        costBreakdownAssumptions: "Cart, initial inventory, permits, cups",
        revenueModel: "Per-cup direct retail + weekend event catering packages",
        initialMarketingStrategy: "Taste-test sampling with student discounts and TikTok aesthetic reels",
        majorRisks: "Rainy season foot-traffic dips",
        validationSteps: ["Host pop-up booth at local community bazaar", "Pre-sell 50 bottles via Instagram stories"],
      }),
    },
  });

  // 3. Seed Financial Calculation
  await db.financialCalculation.create({
    data: {
      user_id: profile.id,
      calculation_type: "profit_margin",
      title: "16oz Iced Cold Brew Margin Analysis",
      inputs: JSON.stringify({ sellingPrice: 95, cogs: 32, additionalVariableCosts: 8 }),
      results: JSON.stringify({
        sellingPrice: 95,
        totalCost: 40,
        grossProfit: 55,
        profitMarginPercent: 57.89,
        markupPercent: 137.5,
        isProfitable: true,
      }),
      ai_explanation: "A 57.89% gross margin is healthy for beverage retail in the Philippines. Protect margins by standardizing pump dispensers for syrups and milk.",
    },
  });

  // 4. Seed Growth Action Items
  await db.actionPlan.createMany({
    data: [
      {
        user_id: profile.id,
        title: "Standardize 16oz Cold Brew Recipe Yield",
        description: "Test 1kg Benguet Arabica batch and calculate exact cost per fluid ounce.",
        category: "pricing",
        priority: "urgent",
        status: "completed",
        success_metric: "Achieve below ₱35 COGS per cup",
        target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: profile.id,
        title: "Secure Barangay Business Permit",
        description: "Submit cart specs and health certificates to local barangay hall.",
        category: "operations",
        priority: "high",
        status: "in_progress",
        success_metric: "Barangay clearance issued",
        target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
      {
        user_id: profile.id,
        title: "Launch Instagram Reel Teaser Campaign",
        description: "Post 3 behind-the-scenes videos showing bean brewing and taste tests.",
        category: "marketing",
        priority: "medium",
        status: "pending",
        success_metric: "500 local video views & 50 profile visits",
        target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  // 5. Seed Knowledge Library Saved Resource
  await db.savedResource.create({
    data: {
      user_id: profile.id,
      resource_type: "conversation",
      resource_id: conversation.id,
      title: "Pricing Strategy for Artisan Cold Brew in QC",
      summary: "Action plan for lean beverage startup in Quezon City with ₱50k starting budget.",
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
