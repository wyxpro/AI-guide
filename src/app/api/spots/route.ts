import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { searchQueries } from "@/lib/db/schema/user-data";
import { requireAuth } from "@/lib/auth";
import { eq, and, like } from "drizzle-orm";
import { NATIONAL_SPOTS } from "@/lib/data/national-spots";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const city = searchParams.get("city");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const offset = (page - 1) * limit;

  try {
    // Record search keyword if provided
    if (search && search.trim()) {
      const authResult = requireAuth(request);
      const userId = authResult.ok ? authResult.user.id : "anonymous";
      
      // Async insert so it doesn't block the main query
      db.insert(searchQueries).values({
        userId,
        query: search.trim(),
      }).catch(err => console.error("[searchQueries record error]", err));
    }

    // Support national popular spots
    if (category === "national") {
      let filtered = NATIONAL_SPOTS;
      if (city) {
        filtered = filtered.filter((s) => s.city === city);
      }
      if (search && search.trim()) {
        const query = search.trim().toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.name.toLowerCase().includes(query) ||
            s.description.toLowerCase().includes(query) ||
            s.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      const sliced = filtered.slice(offset, offset + limit);
      return NextResponse.json(sliced);
    }

    const conditions = [];
    conditions.push(eq(spots.isActive, true));

    if (category && category !== "all") {
      conditions.push(eq(spots.category, category));
    }

    if (search && search.trim()) {
      conditions.push(like(spots.name, `%${search.trim()}%`));
    }

    const rows = await db
      .select()
      .from(spots)
      .where(and(...conditions))
      .orderBy(spots.sortOrder, spots.id)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[GET /api/spots]", error);
    return NextResponse.json({ error: "Failed to fetch spots" }, { status: 500 });
  }
}
