import { NextRequest, NextResponse } from "next/server";
import { getSpotById, incrementVisitCount } from "@/lib/db/queries";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const spot = await getSpotById(Number(id));
    if (!spot) return NextResponse.json({ error: "Spot not found" }, { status: 404 });
    await incrementVisitCount(Number(id));
    return NextResponse.json(spot);
  } catch (error) {
    console.error("[GET /api/spots/:id]", error);
    return NextResponse.json({ error: "Failed to fetch spot" }, { status: 500 });
  }
}
