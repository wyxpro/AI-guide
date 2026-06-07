import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { visitRecords } from "@/lib/db/schema/user-data";
import { spots } from "@/lib/db/schema/spots";
import { eq, and, desc, avg } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: spotIdStr } = await context.params;
  const spotId = parseInt(spotIdStr, 10);
  if (isNaN(spotId)) {
    return NextResponse.json({ error: "Invalid spot ID" }, { status: 400 });
  }

  const auth = requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }
  const userId = auth.user.id;

  try {
    const { rating } = await request.json(); // 1 to 5
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Find the most recent visit record for this user and spot, and update it
    const lastVisit = await db
      .select()
      .from(visitRecords)
      .where(and(eq(visitRecords.userId, userId), eq(visitRecords.spotId, spotId)))
      .orderBy(desc(visitRecords.visitedAt))
      .limit(1);

    if (lastVisit[0]) {
      await db
        .update(visitRecords)
        .set({ rating })
        .where(eq(visitRecords.id, lastVisit[0].id));
    } else {
      // If no visit record exists yet, create a default one
      await db.insert(visitRecords).values({
        userId,
        spotId,
        type: "spot",
        rating,
      });
    }

    // Recalculate average rating for this spot across all visit records
    const ratingsResult = await db
      .select({ avgRating: avg(visitRecords.rating) })
      .from(visitRecords)
      .where(eq(visitRecords.spotId, spotId));

    const avgVal = parseFloat(ratingsResult[0]?.avgRating || "0");
    if (avgVal > 0) {
      const scaledRating = Math.min(50, Math.max(10, Math.round(avgVal * 10))); // Scale to 10-50
      await db
        .update(spots)
        .set({ rating: scaledRating })
        .where(eq(spots.id, spotId));
    }

    return NextResponse.json({ success: true, rating });
  } catch (error: any) {
    console.error("[Submit Rating Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
