import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { marketResearchSchema } from "@/lib/validations/business";
import { conductMarketResearch } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const notes = await db.researchNote.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const parsed = notes.map((n) => ({
      ...n,
      competitors: n.competitors ? JSON.parse(n.competitors) : null,
      verifiedSources: n.verified_sources ? JSON.parse(n.verified_sources) : null,
      userInputs: n.user_inputs ? JSON.parse(n.user_inputs) : null,
      aiHypotheses: n.ai_hypotheses ? JSON.parse(n.ai_hypotheses) : null,
      checklist: n.checklist ? JSON.parse(n.checklist) : null,
    }));

    return NextResponse.json({ researchNotes: parsed });
  } catch (error: any) {
    console.error("Fetch research error:", error);
    return NextResponse.json({ error: "Failed to load research notes." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  const rateCheck = checkRateLimit(`research_${user.id}`, 8, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Rate limit reached. Please wait a minute before submitting more research requests." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const validation = marketResearchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const businessProfile = await db.businessProfile.findUnique({
      where: { user_id: user.id },
    });

    let research;
    try {
      research = await conductMarketResearch({
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

    // Save note in database
    const savedNote = await db.researchNote.create({
      data: {
        user_id: user.id,
        industry: validation.data.industry,
        location: validation.data.location,
        target_audience: validation.data.targetAudience,
        pricing_info: validation.data.pricingInfo || null,
        research_questions: validation.data.researchQuestions || null,
        competitors: JSON.stringify(research.competitorLandscape || []),
        verified_sources: JSON.stringify(research.verifiedMarketRealities || []),
        user_inputs: JSON.stringify([
          `Audience: ${validation.data.targetAudience}`,
          `Pricing input: ${validation.data.pricingInfo || "None"}`,
          `Competitors: ${validation.data.competitors || "None"}`,
        ]),
        ai_hypotheses: JSON.stringify(research.aiGeneratedHypotheses || []),
        checklist: JSON.stringify(research.actionableResearchChecklist || []),
      },
    });

    await db.savedResource.create({
      data: {
        user_id: user.id,
        resource_type: "research",
        resource_id: savedNote.id,
        title: `${savedNote.industry} Market Research (${savedNote.location})`,
        summary: research.marketOverview.slice(0, 150),
      },
    });

    return NextResponse.json({
      note: savedNote,
      research,
    });
  } catch (error: any) {
    console.error("Conduct research error:", error);
    return NextResponse.json({ error: "Failed to generate market research." }, { status: 500 });
  }
}
