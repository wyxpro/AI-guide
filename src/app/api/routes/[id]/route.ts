import { NextRequest, NextResponse } from "next/server";
import { getRouteById } from "@/lib/db/queries";
import { getSpotsByIds } from "@/lib/db/queries/spots";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const route = await getRouteById(Number(id));
    if (!route) return NextResponse.json({ error: "Route not found" }, { status: 404 });

    const spotIds = (route.spotIds as number[]) || [];
    const spots = await getSpotsByIds(spotIds);

    // Sort spots by the order in spotIds
    const orderedSpots = spotIds.map((sid) => spots.find((s) => s.id === sid)).filter(Boolean);

    return NextResponse.json({ ...route, spots: orderedSpots });
  } catch (error) {
    console.error("[GET /api/routes/:id]", error);
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 });
  }
}
