import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { onboardingSchema } from "@/lib/validations/business";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();
    const validation = onboardingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid onboarding submission" },
        { status: 400 }
      );
    }

    const {
      businessStage,
      industry,
      goals,
      budgetRange,
      targetMarket,
      country,
      preferredCurrency,
      challenge,
      businessName,
    } = validation.data;

    // Update profile
    await db.profile.update({
      where: { id: user.id },
      data: {
        country: country || user.country,
        preferred_currency: preferredCurrency || user.preferred_currency,
      },
    });

    // Upsert business profile
    const businessProfile = await db.businessProfile.upsert({
      where: { user_id: user.id },
      create: {
        user_id: user.id,
        business_name: businessName || null,
        industry,
        business_stage: businessStage,
        budget_range: budgetRange,
        target_market: targetMarket,
        goals,
        challenge,
        onboarding_completed: true,
      },
      update: {
        business_name: businessName || undefined,
        industry,
        business_stage: businessStage,
        budget_range: budgetRange,
        target_market: targetMarket,
        goals,
        challenge,
        onboarding_completed: true,
      },
    });

    return NextResponse.json({
      message: "Onboarding completed successfully",
      businessProfile,
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to save onboarding data." }, { status: 500 });
  }
}
