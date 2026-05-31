import { NextResponse } from "next/server";
import { getAllRoutes, getRoutesByInterest } from "@/lib/db/queries";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const interest = searchParams.get("interest");

  try {
    const routes = interest && interest !== "all"
      ? await getRoutesByInterest(interest)
      : await getAllRoutes();
    return NextResponse.json(routes);
  } catch (error) {
    console.error("[GET /api/routes]", error);
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}
