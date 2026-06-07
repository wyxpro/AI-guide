import { NextRequest, NextResponse } from "next/server";
import { getTodayAnalytics, upsertDailyAnalytics } from "@/lib/db/queries/admin";

export async function POST(request: NextRequest) {
  try {
    const { rating, comment } = await request.json();
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }
    
    console.info(`[QA Satisfaction Feedback] Rating: ${rating}/5, Comment: ${comment || "none"}`);
    
    const today = new Date().toISOString().split("T")[0];
    const analytics = await getTodayAnalytics();
    
    // Scale 1-5 stars to 10-50 satisfaction points
    const newRatingScore = rating * 10;
    
    let targetScore = newRatingScore;
    if (analytics && analytics.satisfactionScore) {
      targetScore = Math.round((analytics.satisfactionScore * 9 + newRatingScore) / 10);
    }
    
    await upsertDailyAnalytics(today, { satisfactionScore: targetScore });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/qa/feedback]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
