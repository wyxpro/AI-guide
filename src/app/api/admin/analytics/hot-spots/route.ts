import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { visitRecords } from "@/lib/db/schema/user-data";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const hotSpots = await db
      .select({ spotId: visitRecords.spotId, count: sql<number>`count(*)`.as("count") })
      .from(visitRecords)
      .where(sql`${visitRecords.spotId} IS NOT NULL`)
      .groupBy(visitRecords.spotId)
      .orderBy(sql`count DESC`)
      .limit(10);
    return NextResponse.json(hotSpots.map((s) => ({ spotId: s.spotId, visits: Number(s.count) })));
  } catch {
    return NextResponse.json({ error: "Failed to fetch hot spots" }, { status: 500 });
  }
}
