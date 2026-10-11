import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { explainFinancialResults } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  const rateCheck = checkRateLimit(`fin_explain_${user.id}`, 15, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Rate limit reached. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { calcType, inputs, results } = body;

    if (!calcType || !inputs || !results) {
      return NextResponse.json(
        { error: "calcType, inputs, and results are required." },
        { status: 400 }
      );
    }

    const businessProfile = await db.businessProfile.findUnique({
      where: { user_id: user.id },
    });

    let explanation;
    try {
      explanation = await explainFinancialResults({
        calcType,
        inputs,
        results,
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

    return NextResponse.json({ explanation });
  } catch (error: any) {
    console.error("Explain financial error:", error);
    return NextResponse.json(
      { error: "Failed to generate financial advisory explanation." },
      { status: 500 }
    );
  }
}
