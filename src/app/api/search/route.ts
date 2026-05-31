import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { spots } from "@/lib/db/schema/spots";
import { knowledgeDocs } from "@/lib/db/schema/admin";
import { ilike, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json({ spots: [], knowledge: [] });

  try {
    const [matchSpots, matchDocs] = await Promise.all([
      db.select({
        id: spots.id,
        name: spots.name,
        category: spots.category,
        description: spots.description,
        imageUrl: spots.imageUrl,
        rating: spots.rating,
        duration: spots.duration,
      }).from(spots)
        .where(or(
          ilike(spots.name, `%${q}%`),
          ilike(spots.description, `%${q}%`),
        ))
        .limit(6),

      db.select({
        id: knowledgeDocs.id,
        title: knowledgeDocs.title,
        category: knowledgeDocs.category,
        content: knowledgeDocs.content,
      }).from(knowledgeDocs)
        .where(or(
          ilike(knowledgeDocs.title, `%${q}%`),
          ilike(knowledgeDocs.content, `%${q}%`),
        ))
        .limit(4),
    ]);

    // Trim knowledge content for preview
    const knowledge = matchDocs.map(d => ({
      ...d,
      preview: d.content.slice(0, 80) + (d.content.length > 80 ? "…" : ""),
    }));

    return NextResponse.json({ spots: matchSpots, knowledge });
  } catch (error) {
    console.error("[search]", error);
    return NextResponse.json({ spots: [], knowledge: [] });
  }
}
