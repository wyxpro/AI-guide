import { eq, desc, and, inArray } from "drizzle-orm";
import { db } from "../client";
import { spots } from "../schema/spots";

export async function getAllSpots() {
  return db.select().from(spots).where(eq(spots.isActive, true)).orderBy(spots.sortOrder, spots.id);
}

export async function getSpotById(id: number) {
  const rows = await db.select().from(spots).where(eq(spots.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getSpotsByCategory(category: string) {
  return db.select().from(spots).where(and(eq(spots.isActive, true), eq(spots.category, category))).orderBy(spots.sortOrder);
}

export async function getSpotsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  return db.select().from(spots).where(inArray(spots.id, ids));
}

export async function incrementVisitCount(id: number) {
  const spot = await getSpotById(id);
  if (!spot) return;
  await db.update(spots).set({ visitCount: spot.visitCount + 1, updatedAt: new Date() }).where(eq(spots.id, id));
}
