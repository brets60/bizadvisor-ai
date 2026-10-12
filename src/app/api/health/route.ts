import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const dbUrl = process.env.DATABASE_URL || "";
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const tableQuery: any = await db.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tables = tableQuery.map((t: any) => t.table_name);
    const profileCount = tables.includes("profiles") ? await db.profile.count() : 0;

    let seedResult = null;
    const shouldSeed = request.nextUrl.searchParams.get("seed") === "true";

    if (shouldSeed) {
      const existing = await db.profile.findUnique({
        where: { email: "founder@bizadvisor.ph" },
      });

      if (!existing) {
        const passwordHash = await bcrypt.hash("DemoPass2026!PH", 10);
        const demoUser = await db.profile.create({
          data: {
            full_name: "Juan Dela Cruz",
            email: "founder@bizadvisor.ph",
            password_hash: passwordHash,
            email_verified: true,
            preferred_currency: "PHP",
            country: "Philippines",
            business_profile: {
              create: {
                business_name: "Manila Brews Specialty Coffee",
                industry: "Food & Beverage / Coffee Cart",
                business_stage: "startup",
                budget_range: "₱50,000 - ₱100,000",
                target_market: "College students, remote workers, and commuting professionals in Quezon City",
                goals: "Achieve break-even within 60 days and open a 2nd pop-up cart in 6 months",
                challenge: "Determining optimal pricing markups, inventory waste control, and initial marketing",
                onboarding_completed: true,
              },
            },
          },
        });
        seedResult = { success: true, email: demoUser.email };
      } else {
        seedResult = { success: true, email: existing.email, alreadyExisted: true };
      }
    }

    return NextResponse.json({
      status: "healthy",
      databaseConnected: true,
      databaseUrlMasked: maskedUrl,
      tables,
      profileCount,
      seedResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        databaseConnected: false,
        databaseUrlMasked: maskedUrl,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
