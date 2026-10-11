import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const conversation = await db.conversation.findFirst({
      where: {
        id: params.id,
        user_id: user.id, // Strictly verify ownership
      },
      include: {
        messages: {
          orderBy: { created_at: "asc" },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    console.error("Get conversation error:", error);
    return NextResponse.json({ error: "Failed to load conversation." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();
    const title = body?.title?.trim();

    if (!title) {
      return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    }

    const conversation = await db.conversation.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const updated = await db.conversation.update({
      where: { id: params.id },
      data: { title },
    });

    return NextResponse.json({ conversation: updated });
  } catch (error: any) {
    console.error("Rename conversation error:", error);
    return NextResponse.json({ error: "Failed to rename conversation." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const conversation = await db.conversation.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    await db.conversation.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Conversation deleted successfully." });
  } catch (error: any) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Failed to delete conversation." }, { status: 500 });
  }
}
