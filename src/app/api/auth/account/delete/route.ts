import { NextRequest, NextResponse } from "next/server";
import { requireAuth, clearSessionCookie } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    // Delete profile (cascades to all user records)
    await db.profile.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({
      message: "Your account and all associated data have been permanently deleted.",
    });

    clearSessionCookie(response);
    return response;
  } catch (error: any) {
    console.error("Account deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account." }, { status: 500 });
  }
}
