import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { marketingGeneratorSchema } from "@/lib/validations/business";
import { generateMarketingPlan } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const plans = await db.marketingPlan.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const parsed = plans.map((p) => ({
      ...p,
      content: JSON.parse(p.content),
    }));

    return NextResponse.json({ marketingPlans: parsed });
  } catch (error: any) {
    console.error("Fetch marketing plans error:", error);
    return NextResponse.json({ error: "Failed to load marketing plans." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();

    // If saving an existing/edited plan
    if (body.action === "save") {
      const { title, content, businessPlanId } = body;
      if (!title || !content) {
        return NextResponse.json({ error: "Title and content are required." }, { status: 400 });
      }

      const plan = await db.marketingPlan.create({
        data: {
          user_id: user.id,
          business_plan_id: businessPlanId || null,
          title,
          content: JSON.stringify(content),
        },
      });

      await db.savedResource.create({
        data: {
          user_id: user.id,
          resource_type: "marketing",
          resource_id: plan.id,
          title: plan.title,
          summary: `Marketing Strategy: ${content.executiveStrategy?.slice(0, 120)}...`,
        },
      });

      return NextResponse.json({ marketingPlan: plan });
    }

    // AI Generation
    const rateCheck = checkRateLimit(`mktg_${user.id}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a minute before generating another marketing strategy." },
        { status: 429 }
      );
    }

    const validation = marketingGeneratorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const businessProfile = await db.businessProfile.findUnique({
      where: { user_id: user.id },
    });

    let generated;
    try {
      generated = await generateMarketingPlan({
        ...validation.data,
        context: {
          fullName: user.full_name,
          businessName: businessProfile?.business_name,
          industry: businessProfile?.industry,
          businessStage: businessProfile?.business_stage,
          budgetRange: businessProfile?.budget_range,
          targetMarket: businessProfile?.target_market,
          goals: businessProfile?.goals,
          challenge: businessProfile?.challenge,
          currency: user.preferred_currency,
          country: user.country,
        },
      });
    } catch (err: any) {
      if (err instanceof GeminiConfigError) {
        return NextResponse.json({ error: err.message, isConfigError: true }, { status: 503 });
      }
      if (err instanceof GeminiServiceError) {
        return NextResponse.json({ error: err.message }, { status: 502 });
      }
      throw err;
    }

    // Auto-save generated marketing plan
    const title = `${validation.data.businessType} Marketing Strategy (${validation.data.platform})`;
    const saved = await db.marketingPlan.create({
      data: {
        user_id: user.id,
        title,
        content: JSON.stringify(generated),
      },
    });

    await db.savedResource.create({
      data: {
        user_id: user.id,
        resource_type: "marketing",
        resource_id: saved.id,
        title: saved.title,
        summary: `Marketing Strategy: ${generated.executiveStrategy?.slice(0, 120)}...`,
      },
    });

    return NextResponse.json({
      marketingPlan: saved,
      content: generated,
    });
  } catch (error: any) {
    console.error("Generate marketing plan error:", error);
    return NextResponse.json({ error: "Failed to generate marketing plan." }, { status: 500 });
  }
}
