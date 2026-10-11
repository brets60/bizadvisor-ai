import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { businessPlanGeneratorSchema } from "@/lib/validations/business";
import { generateBusinessPlan } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const plans = await db.businessPlan.findMany({
      where: { user_id: user.id },
      orderBy: { updated_at: "desc" },
      include: {
        business_idea: {
          select: { title: true },
        },
      },
    });

    const parsedPlans = plans.map((p) => ({
      ...p,
      sections: JSON.parse(p.content),
    }));

    return NextResponse.json({ plans: parsedPlans });
  } catch (error: any) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ error: "Failed to load business plans." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();

    // Check action: direct save or AI generate
    if (body.action === "save") {
      const { title, sections, businessIdeaId } = body;
      if (!title || !sections) {
        return NextResponse.json({ error: "Title and sections are required." }, { status: 400 });
      }

      const plan = await db.businessPlan.create({
        data: {
          user_id: user.id,
          title,
          business_idea_id: businessIdeaId || null,
          content: JSON.stringify(sections),
          version: 1,
        },
      });

      await db.savedResource.create({
        data: {
          user_id: user.id,
          resource_type: "plan",
          resource_id: plan.id,
          title: plan.title,
          summary: `Business Plan v${plan.version} - ${sections.executiveSummary?.slice(0, 100) || "Comprehensive plan"}`,
        },
      });

      return NextResponse.json({ plan, sections });
    }

    // Default action: AI generation
    const rateCheck = checkRateLimit(`plans_${user.id}`, 6, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a minute before generating another business plan." },
        { status: 429 }
      );
    }

    const validation = businessPlanGeneratorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const businessProfile = await db.businessProfile.findUnique({
      where: { user_id: user.id },
    });

    let generatedSections;
    try {
      generatedSections = await generateBusinessPlan({
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

    // Automatically persist newly generated plan
    const newPlan = await db.businessPlan.create({
      data: {
        user_id: user.id,
        title: validation.data.title,
        business_idea_id: validation.data.businessIdeaId || null,
        content: JSON.stringify(generatedSections),
        version: 1,
      },
    });

    await db.savedResource.create({
      data: {
        user_id: user.id,
        resource_type: "plan",
        resource_id: newPlan.id,
        title: newPlan.title,
        summary: `Business Plan v1: ${generatedSections.executiveSummary?.slice(0, 120)}...`,
      },
    });

    return NextResponse.json({
      plan: newPlan,
      sections: generatedSections,
    });
  } catch (error: any) {
    console.error("Generate business plan error:", error);
    return NextResponse.json({ error: "Failed to generate business plan." }, { status: 500 });
  }
}
