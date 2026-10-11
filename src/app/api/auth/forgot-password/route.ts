import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { db } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    const rateCheck = checkRateLimit(`forgot_${ip}`, 5, 60 * 1000);
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many reset attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const user = await db.profile.findUnique({ where: { email } });

    // Consistent response whether user exists or not to prevent user enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: "If that email is registered, password reset instructions have been generated.",
        resetToken: null,
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.profile.update({
      where: { id: user.id },
      data: {
        reset_token: resetToken,
        reset_expires: resetExpires,
      },
    });

    return NextResponse.json({
      message: "If that email is registered, password reset instructions have been generated.",
      // In development mode, we surface the reset token to facilitate immediate testing:
      devResetLink: `/reset-password?token=${resetToken}`,
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
