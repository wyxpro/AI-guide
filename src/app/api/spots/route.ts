import { NextResponse } from "next/server";
import { getAllSpots, getSpotsByCategory, incrementVisitCount } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  try {
    const spots = category && category !== "all"
      ? await getSpotsByCategory(category)
      : await getAllSpots();
    return NextResponse.json(spots);
  } catch (error) {
    console.error("[GET /api/spots]", error);
    return NextResponse.json({ error: "Failed to fetch spots" }, { status: 500 });
  }
}
