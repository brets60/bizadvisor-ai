import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { ideaGeneratorSchema } from "@/lib/validations/business";
import { generateBusinessIdeas } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const ideas = await db.businessIdea.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const parsedIdeas = ideas.map((idea) => ({
      ...idea,
      rawData: idea.raw_data ? JSON.parse(idea.raw_data) : null,
    }));

    return NextResponse.json({ ideas: parsedIdeas });
  } catch (error: any) {
    console.error("Fetch ideas error:", error);
    return NextResponse.json({ error: "Failed to load saved ideas." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();

    // Check action: "generate" or "save"
    if (body.action === "save") {
      const { idea } = body;
      if (!idea || !idea.title) {
        return NextResponse.json({ error: "Invalid idea payload." }, { status: 400 });
      }

      const saved = await db.businessIdea.create({
        data: {
          user_id: user.id,
          title: idea.title,
          concept: idea.concept,
          target_market: idea.targetMarket,
          startup_cost_estimate: idea.startupCostEstimate,
          assumptions: idea.costBreakdownAssumptions || idea.assumptions || "",
          risks: idea.majorRisks || idea.risks || "",
          status: "saved",
          raw_data: JSON.stringify(idea),
        },
      });

      // Also register in saved_resources library
      await db.savedResource.create({
        data: {
          user_id: user.id,
          resource_type: "idea",
          resource_id: saved.id,
          title: saved.title,
          summary: saved.concept.slice(0, 150),
        },
      });

      return NextResponse.json({
        message: "Idea saved to workspace successfully",
        idea: saved,
      });
    }

    // Default action: Generate new ideas with AI
    const rateCheck = checkRateLimit(`ideas_${user.id}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Rate limit reached. Please wait a minute before generating new ideas." },
        { status: 429 }
      );
    }

    const validation = ideaGeneratorSchema.safeParse(body);
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
      generated = await generateBusinessIdeas({
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

    return NextResponse.json({ ideas: generated });
  } catch (error: any) {
    console.error("Generate ideas error:", error);
    return NextResponse.json({ error: "Failed to generate business ideas." }, { status: 500 });
  }
}
