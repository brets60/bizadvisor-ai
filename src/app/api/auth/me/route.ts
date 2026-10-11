import { NextRequest, NextResponse } from "next/server";
import { getSessionUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        country: user.country,
        currency: user.preferred_currency,
        businessProfile: user.business_profile,
        onboardingCompleted: user.business_profile?.onboarding_completed ?? false,
      },
    });
  } catch (error) {
    console.error("Me endpoint error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
