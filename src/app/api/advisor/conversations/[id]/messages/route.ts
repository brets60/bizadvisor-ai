import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();
    const { messageId } = body;

    // Verify ownership of conversation
    const conversation = await db.conversation.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }

    const message = await db.message.findFirst({
      where: { id: messageId, conversation_id: params.id },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found." }, { status: 404 });
    }

    const updated = await db.message.update({
      where: { id: messageId },
      data: { is_saved: !message.is_saved },
    });

    if (updated.is_saved) {
      // Add or update in saved_resources
      await db.savedResource.create({
        data: {
          user_id: user.id,
          resource_type: "conversation",
          resource_id: message.id,
          title: `Saved Advice from "${conversation.title}"`,
          summary: message.content.slice(0, 150) + "...",
        },
      });
    } else {
      // Remove from saved_resources
      await db.savedResource.deleteMany({
        where: {
          user_id: user.id,
          resource_id: message.id,
        },
      });
    }

    return NextResponse.json({ message: updated });
  } catch (error: any) {
    console.error("Save message error:", error);
    return NextResponse.json({ error: "Failed to update saved status." }, { status: 500 });
  }
}
