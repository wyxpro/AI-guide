import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select().from(spots).orderBy(spots.sortOrder);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  try {
    const body = await request.json();
    const rows = await db.insert(spots).values({
      name: body.name,
      category: body.category ?? "cultural",
      description: body.description ?? "",
      imageUrl: body.imageUrl ?? "",
      duration: body.duration ?? 30,
      distance: body.distance ?? "",
      location: body.location ?? { lat: 0, lng: 0 },
      isActive: body.isActive ?? true,
      tags: body.tags ?? [],
    }).returning();
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create spot" }, { status: 500 });
  }
}
