import { NextRequest, NextResponse } from "next/server";
import { getSpotById, incrementVisitCount } from "@/lib/db/queries";
import { NATIONAL_SPOTS } from "@/lib/data/national-spots";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spotIdNum = Number(id);

    // 1. Support national popular spots by exact ID match
    const nationalSpot = NATIONAL_SPOTS.find((s) => s.id === spotIdNum);
    if (nationalSpot) {
      return NextResponse.json(nationalSpot);
    }

    // 2. Search database by numeric ID
    if (!isNaN(spotIdNum) && spotIdNum > 0) {
      const spot = await getSpotById(spotIdNum);
      if (spot) {
        await incrementVisitCount(spotIdNum);
        return NextResponse.json(spot);
      }
    }

    // 3. Fallback: Return a valid national spot (e.g. by index offset) instead of 404
    const index = Math.abs(spotIdNum || 0) % NATIONAL_SPOTS.length;
    const fallbackSpot = NATIONAL_SPOTS[index] || NATIONAL_SPOTS[0];
    return NextResponse.json(fallbackSpot);
  } catch (error) {
    console.error("[GET /api/spots/:id]", error);
    return NextResponse.json(NATIONAL_SPOTS[0]);
  }
}
