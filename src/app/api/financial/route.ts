import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const calculations = await db.financialCalculation.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const parsed = calculations.map((c) => ({
      ...c,
      inputs: JSON.parse(c.inputs),
      results: JSON.parse(c.results),
    }));

    return NextResponse.json({ calculations: parsed });
  } catch (error: any) {
    console.error("Fetch calculations error:", error);
    return NextResponse.json({ error: "Failed to load financial calculations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();
    const { calculationType, title, inputs, results, aiExplanation } = body;

    if (!calculationType || !inputs || !results) {
      return NextResponse.json(
        { error: "calculationType, inputs, and results are required." },
        { status: 400 }
      );
    }

    const calc = await db.financialCalculation.create({
      data: {
        user_id: user.id,
        calculation_type: calculationType,
        title: title || `${calculationType.replace("_", " ").toUpperCase()} Calculation`,
        inputs: JSON.stringify(inputs),
        results: JSON.stringify(results),
        ai_explanation: aiExplanation || null,
      },
    });

    await db.savedResource.create({
      data: {
        user_id: user.id,
        resource_type: "financial",
        resource_id: calc.id,
        title: calc.title || "Financial Calculation",
        summary: `Type: ${calculationType} | Saved on ${new Date().toLocaleDateString()}`,
      },
    });

    return NextResponse.json({
      message: "Calculation saved to your library.",
      calculation: calc,
    });
  } catch (error: any) {
    console.error("Save calculation error:", error);
    return NextResponse.json({ error: "Failed to save calculation." }, { status: 500 });
  }
}
