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
    const plan = await db.businessPlan.findFirst({
      where: { id: params.id, user_id: user.id },
      include: {
        business_idea: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
    }

    return NextResponse.json({
      plan: {
        ...plan,
        sections: JSON.parse(plan.content),
      },
    });
  } catch (error: any) {
    console.error("Get plan error:", error);
    return NextResponse.json({ error: "Failed to load plan." }, { status: 500 });
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
    const { title, sections } = body;

    const existing = await db.businessPlan.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
    }

    const updated = await db.businessPlan.update({
      where: { id: params.id },
      data: {
        title: title || existing.title,
        content: sections ? JSON.stringify(sections) : existing.content,
        version: existing.version + 1, // Auto-increment version on edit
      },
    });

    return NextResponse.json({
      plan: {
        ...updated,
        sections: JSON.parse(updated.content),
      },
    });
  } catch (error: any) {
    console.error("Update plan error:", error);
    return NextResponse.json({ error: "Failed to update business plan." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await db.businessPlan.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Business plan not found." }, { status: 404 });
    }

    await db.businessPlan.delete({
      where: { id: params.id },
    });

    await db.savedResource.deleteMany({
      where: { user_id: user.id, resource_id: params.id },
    });

    return NextResponse.json({ message: "Business plan deleted successfully." });
  } catch (error: any) {
    console.error("Delete plan error:", error);
    return NextResponse.json({ error: "Failed to delete business plan." }, { status: 500 });
  }
}
