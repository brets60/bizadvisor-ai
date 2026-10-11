import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { callGemini, GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  const rateCheck = checkRateLimit(`regen_section_${user.id}`, 15, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Rate limit reached. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { sectionKey, instructions } = body;

    if (!sectionKey) {
      return NextResponse.json({ error: "Section key is required." }, { status: 400 });
    }

    const plan = await db.businessPlan.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!plan) {
      return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
    }

    const sections = JSON.parse(plan.content);
    const currentSectionContent = sections[sectionKey] || "";

    const prompt = `You are an expert business strategy consultant.
Regenerate or enhance the "${sectionKey}" section for this business plan.

Business Plan Title: ${plan.title}
Current Section Content:
${currentSectionContent}

Additional User Modification Instructions:
${instructions || "Provide a more thorough, practical, and well-structured revision."}

Return ONLY the updated section content in clear, professional markdown.`;

    let newContent;
    try {
      newContent = await callGemini(prompt, {
        temperature: 0.6,
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

    sections[sectionKey] = newContent;

    const updated = await db.businessPlan.update({
      where: { id: params.id },
      data: {
        content: JSON.stringify(sections),
        version: plan.version + 1,
      },
    });

    return NextResponse.json({
      sectionKey,
      content: newContent,
      version: updated.version,
    });
  } catch (error: any) {
    console.error("Regenerate section error:", error);
    return NextResponse.json({ error: "Failed to regenerate section." }, { status: 500 });
  }
}
