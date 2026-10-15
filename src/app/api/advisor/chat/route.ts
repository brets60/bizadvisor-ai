import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adviseBusiness } from "@/lib/ai/advisor-service";
import { GeminiConfigError, GeminiServiceError } from "@/lib/ai/gemini";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  const rateCheck = checkRateLimit(`chat_${user.id}`, 20, 60 * 1000);
  if (!rateCheck.success) {
    return NextResponse.json(
      { error: "Rate limit reached. Please wait a moment before sending another question." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { question, conversationId } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Question cannot be empty." }, { status: 400 });
    }

    // Verify or create conversation
    let convId = conversationId;
    if (convId) {
      const existingConv = await db.conversation.findFirst({
        where: { id: convId, user_id: user.id },
      });
      if (!existingConv) {
        return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
      }
    } else {
      const newConv = await db.conversation.create({
        data: {
          user_id: user.id,
          title: question.trim().slice(0, 45) + (question.length > 45 ? "..." : ""),
        },
      });
      convId = newConv.id;
    }

    // Save user message
    const userMessage = await db.message.create({
      data: {
        conversation_id: convId,
        role: "user",
        content: question.trim(),
      },
    });

    // Fetch conversation message history (last 8 messages)
    const history = await db.message.findMany({
      where: { conversation_id: convId },
      orderBy: { created_at: "asc" },
      take: 8,
    });

    const formattedHistory = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Fetch user business profile context
    const businessProfile = await db.businessProfile.findUnique({
      where: { user_id: user.id },
    });

    // Check for user-provided Gemini API key from Settings or custom header
    const userApiKey = request.headers.get("x-gemini-key")?.trim() || undefined;

    let aiResult;
    try {
      aiResult = await adviseBusiness({
        question: question.trim(),
        history: formattedHistory,
        apiKey: userApiKey,
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
        return NextResponse.json(
          {
            error: err.message,
            isConfigError: true,
          },
          { status: 503 }
        );
      }
      if (err instanceof GeminiServiceError) {
        return NextResponse.json({ error: err.message }, { status: 502 });
      }
      throw err;
    }

    // Save assistant message to database
    const assistantMessage = await db.message.create({
      data: {
        conversation_id: convId,
        role: "assistant",
        content: aiResult.answer,
      },
    });

    // Touch conversation updated_at
    await db.conversation.update({
      where: { id: convId },
      data: { updated_at: new Date() },
    });

    return NextResponse.json({
      conversationId: convId,
      userMessage,
      assistantMessage,
      suggestedFollowUps: aiResult.suggestedFollowUps,
    });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI advisory response. Please try again." },
      { status: 500 }
    );
  }
}
