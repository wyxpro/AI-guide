import { NextRequest, NextResponse } from "next/server";
import { getSpotById, incrementVisitCount } from "@/lib/db/queries";
import { NATIONAL_SPOTS } from "@/lib/data/national-spots";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spotIdNum = Number(id);

    // Support national popular spots
    const nationalSpot = NATIONAL_SPOTS.find((s) => s.id === spotIdNum);
    if (nationalSpot) {
      return NextResponse.json(nationalSpot);
    }

    const spot = await getSpotById(spotIdNum);
    if (!spot) return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    await incrementVisitCount(spotIdNum);
    return NextResponse.json(spot);
  } catch (error) {
    console.error("[GET /api/spots/:id]", error);
    return NextResponse.json({ error: "Failed to fetch spot" }, { status: 500 });
  }
}
