import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const rateCheck = checkRateLimit(`register_${ip}`, 10, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { fullName, email, password, country, preferredCurrency, businessName, industry, businessStage } =
      validation.data;

    // Check if email already registered
    const existing = await db.profile.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create profile and initial business profile
    const profile = await db.profile.create({
      data: {
        full_name: fullName,
        email,
        password_hash: passwordHash,
        country: country || "Philippines",
        preferred_currency: preferredCurrency || "PHP",
        business_profile: {
          create: {
            business_name: businessName || null,
            industry: industry || null,
            business_stage: businessStage || null,
            onboarding_completed: false,
          },
        },
      },
      include: {
        business_profile: true,
      },
    });

    const token = createSessionToken({
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
    });

    const response = NextResponse.json({
      message: "Registration successful",
      user: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        country: profile.country,
        currency: profile.preferred_currency,
        onboardingCompleted: profile.business_profile?.onboarding_completed ?? false,
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        error: error?.message || "An unexpected error occurred during registration. Please try again.",
        code: error?.code || "UNKNOWN"
      },
      { status: 500 }
    );
  }
}
