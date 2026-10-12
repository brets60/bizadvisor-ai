import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const rateCheck = checkRateLimit(`login_${ip}`, 15, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again after 60 seconds." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const profile = await db.profile.findUnique({
      where: { email },
      include: {
        business_profile: true,
      },
    });

    if (!profile || !profile.password_hash) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, profile.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      userId: profile.id,
      email: profile.email,
      fullName: profile.full_name,
    });

    const response = NextResponse.json({
      message: "Login successful",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        error: error?.message || "Internal server error. Please try again.",
        code: error?.code || "UNKNOWN"
      },
      { status: 500 }
    );
  }
}
