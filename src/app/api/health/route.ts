import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || "";
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const tableQuery: any = await db.$queryRawUnsafe(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    const tables = tableQuery.map((t: any) => t.table_name);
    const profileCount = tables.includes("profiles") ? await db.profile.count() : 0;

    return NextResponse.json({
      status: "healthy",
      databaseConnected: true,
      databaseUrlMasked: maskedUrl,
      tables,
      profileCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        databaseConnected: false,
        databaseUrlMasked: maskedUrl,
        error: error.message,
        code: error.code,
      },
      { status: 500 }
    );
  }
}
