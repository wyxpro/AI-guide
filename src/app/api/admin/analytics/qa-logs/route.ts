import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { qaLogs } from "@/lib/db/schema/admin";
import { eq, and, desc, like, or } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const sentiment = searchParams.get("sentiment") || "";
  const query = searchParams.get("query") || "";

  try {
    const whereClause = [];
    if (sentiment) {
      whereClause.push(eq(qaLogs.sentiment, sentiment));
    }
    if (query) {
      whereClause.push(
        or(
          like(qaLogs.question, `%${query}%`),
          like(qaLogs.answer, `%${query}%`)
        )
      );
    }

    const logs = await db
      .select()
      .from(qaLogs)
      .where(whereClause.length > 0 ? and(...whereClause) : undefined)
      .orderBy(desc(qaLogs.createdAt))
      .limit(100);

    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("[GET /api/admin/analytics/qa-logs]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
