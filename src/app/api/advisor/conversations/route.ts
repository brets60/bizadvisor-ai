import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const conversations = await db.conversation.findMany({
      where: { user_id: user.id },
      orderBy: { updated_at: "desc" },
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Failed to load conversations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const title = body?.title?.trim() || "New Advisory Session";

    const conversation = await db.conversation.create({
      data: {
        user_id: user.id,
        title,
      },
    });

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Failed to create conversation." }, { status: 500 });
  }
}
