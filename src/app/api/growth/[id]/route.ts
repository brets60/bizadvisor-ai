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
    const { status, title, description, priority, successMetric, targetDate, category } = body;

    const existing = await db.actionPlan.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action item not found." }, { status: 404 });
    }

    const updated = await db.actionPlan.update({
      where: { id: params.id },
      data: {
        status: status !== undefined ? status : existing.status,
        title: title !== undefined ? title : existing.title,
        description: description !== undefined ? description : existing.description,
        priority: priority !== undefined ? priority : existing.priority,
        success_metric: successMetric !== undefined ? successMetric : existing.success_metric,
        category: category !== undefined ? category : existing.category,
        target_date: targetDate !== undefined ? (targetDate ? new Date(targetDate) : null) : existing.target_date,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (error: any) {
    console.error("Update growth item error:", error);
    return NextResponse.json({ error: "Failed to update action item." }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const existing = await db.actionPlan.findFirst({
      where: { id: params.id, user_id: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Action item not found." }, { status: 404 });
    }

    await db.actionPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Action item removed successfully." });
  } catch (error: any) {
    console.error("Delete growth item error:", error);
    return NextResponse.json({ error: "Failed to delete action item." }, { status: 500 });
  }
}
