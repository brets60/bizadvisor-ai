import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const body = await request.json();
    const { status, title, concept } = body;

    const existing = await db.businessIdea.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    const updated = await db.businessIdea.update({
      where: { id: params.id },
      data: {
        status: status || existing.status,
        title: title || existing.title,
        concept: concept || existing.concept,
      },
    });

    return NextResponse.json({ idea: updated });
  } catch (error: any) {
    console.error("Update idea error:", error);
    return NextResponse.json({ error: "Failed to update idea." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await db.businessIdea.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Idea not found." }, { status: 404 });
    }

    await db.businessIdea.delete({
      where: { id: params.id },
    });

    await db.savedResource.deleteMany({
      where: { user_id: user.id, resource_id: params.id },
    });

    return NextResponse.json({ message: "Idea removed successfully." });
  } catch (error: any) {
    console.error("Delete idea error:", error);
    return NextResponse.json({ error: "Failed to delete idea." }, { status: 500 });
  }
}
