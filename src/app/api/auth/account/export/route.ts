import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const fullData = await db.profile.findUnique({
      where: { id: user.id },
      include: {
        business_profile: true,
        conversations: {
          include: { messages: true },
        },
        business_ideas: true,
        business_plans: true,
        marketing_plans: true,
        financial_calcs: true,
        action_plans: true,
        saved_resources: true,
        research_notes: true,
      },
    });

    // Sanitize sensitive internal fields
    if (fullData) {
      delete (fullData as any).password_hash;
      delete (fullData as any).verification_token;
      delete (fullData as any).reset_token;
      delete (fullData as any).reset_expires;
    }

    return new NextResponse(JSON.stringify(fullData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="bizadvisor-export-${user.id}.json"`,
      },
    });
  } catch (error: any) {
    console.error("Account export error:", error);
    return NextResponse.json({ error: "Failed to export account data." }, { status: 500 });
  }
}
