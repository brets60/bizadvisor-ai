import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await db.savedResource.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Resource not found." }, { status: 404 });
    }

    await db.savedResource.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Resource removed from library." });
  } catch (error: any) {
    console.error("Delete resource error:", error);
    return NextResponse.json({ error: "Failed to delete resource." }, { status: 500 });
  }
}
