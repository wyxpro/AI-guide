import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getRecentAnalytics, upsertDailyAnalytics } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  // Analytics are readable for dashboard; auth optional for B-end display
  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days")) || 7;
    const data = await getRecentAnalytics(days);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const result = requireAuth(request);
  if (!result.ok) return result.response;
  try {
    const { date, ...data } = await request.json();
    const record = await upsertDailyAnalytics(date, data);
    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Failed to upsert analytics" }, { status: 500 });
  }
}
