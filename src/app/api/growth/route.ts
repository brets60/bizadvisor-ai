import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createGrowthPlan } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const items = await db.actionPlan.findMany({
      where: { user_id: user.id },
      orderBy: [{ status: "asc" }, { created_at: "desc" }],
    });

    const total = items.length;
    const completed = items.filter((i) => i.status === "completed").length;
    const inProgress = items.filter((i) => i.status === "in_progress").length;
    const pending = items.filter((i) => i.status === "pending").length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return NextResponse.json({
      actionItems: items,
      stats: {
        total,
        completed,
        inProgress,
        pending,
        completionRate,
      },
    });
  } catch (error: any) {
    console.error("Fetch growth items error:", error);
    return NextResponse.json({ error: "Failed to load growth action items." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();

    // Mode 1: Generate via AI
    if (body.action === "generate_ai") {
      const rateCheck = checkRateLimit(`growth_${user.id}`, 8, 60 * 1000);
      if (!rateCheck.success) {
        return NextResponse.json(
          { error: "Rate limit reached. Please wait a moment." },
          { status: 429 }
        );
      }

      const { focusArea, currentBottleneck, targetGoal } = body;
      if (!focusArea || !targetGoal) {
        return NextResponse.json(
          { error: "Focus area and target goal are required." },
          { status: 400 }
        );
      }

      const businessProfile = await db.businessProfile.findUnique({
        where: { user_id: user.id },
      });

      let milestones;
      try {
        milestones = await createGrowthPlan({
          focusArea,
          currentBottleneck: currentBottleneck || "General execution friction",
          targetGoal,
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

      // Bulk create milestones in DB as actionable items
      const createdItems = await Promise.all(
        milestones.map((m) => {
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + (m.targetTimelineDays || 14));

          return db.actionPlan.create({
            data: {
              user_id: user.id,
              title: m.title,
              description: m.description,
              category: m.category,
              priority: m.priority || "medium",
              status: "pending",
              success_metric: m.successMetric,
              expected_resources: m.expectedResources,
              risks: m.risks,
              target_date: targetDate,
            },
          });
        })
      );

      return NextResponse.json({
        message: `Created ${createdItems.length} growth milestones in your planner.`,
        createdItems,
      });
    }

    // Mode 2: Manual action item creation
    const { title, description, category, priority, successMetric, targetDate, expectedResources, risks } =
      body;

    if (!title || !description || !successMetric) {
      return NextResponse.json(
        { error: "Title, description, and success metric are required." },
        { status: 400 }
      );
    }

    const item = await db.actionPlan.create({
      data: {
        user_id: user.id,
        title,
        description,
        category: category || "general",
        priority: priority || "medium",
        status: "pending",
        success_metric: successMetric,
        expected_resources: expectedResources || null,
        risks: risks || null,
        target_date: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error("Create growth item error:", error);
    return NextResponse.json({ error: "Failed to create growth item." }, { status: 500 });
  }
}
