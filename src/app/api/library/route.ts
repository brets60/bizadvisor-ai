import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse || !user) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "all" | "conversation" | "idea" | "plan" | "marketing" | "financial" | "research"
    const search = searchParams.get("q")?.toLowerCase();
    const sort = searchParams.get("sort") || "date_desc";

    const whereClause: any = {
      user_id: user.id,
    };

    if (type && type !== "all") {
      whereClause.resource_type = type;
    }

    let orderBy: any = { created_at: "desc" };
    if (sort === "date_asc") {
      orderBy = { created_at: "asc" };
    } else if (sort === "title_asc") {
      orderBy = { title: "asc" };
    } else if (sort === "title_desc") {
      orderBy = { title: "desc" };
    }

    const resources = await db.savedResource.findMany({
      where: whereClause,
      orderBy,
    });

    const filtered = search
      ? resources.filter(
          (r) =>
            r.title.toLowerCase().includes(search) ||
            (r.summary && r.summary.toLowerCase().includes(search))
        )
      : resources;

    return NextResponse.json({ resources: filtered });
  } catch (error: any) {
    console.error("Fetch library error:", error);
    return NextResponse.json({ error: "Failed to load library resources." }, { status: 500 });
  }
}
