import { eq, desc, and } from "drizzle-orm";
import { db } from "../client";
import { chatSessions, favorites, visitRecords, userPreferences } from "../schema/user-data";
import { spots } from "../schema/spots";
import { routes } from "../schema/routes";

// Chat/QA sessions
export async function getChatSessionsByUser(userId: string) {
  return db.select().from(chatSessions).where(eq(chatSessions.userId, userId)).orderBy(desc(chatSessions.updatedAt)).limit(20);
}

export async function createChatSession(userId: string, title: string) {
  const rows = await db.insert(chatSessions).values({ userId, title }).returning();
  return rows[0];
}

export async function updateChatSession(id: number, messages: Array<{ role: "user" | "assistant"; content: string; timestamp: string }>) {
  const rows = await db.update(chatSessions).set({ messages, updatedAt: new Date() }).where(eq(chatSessions.id, id)).returning();
  return rows[0];
}

export async function deleteChatSession(id: number, userId: string) {
  await db.delete(chatSessions).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId)));
}

export async function getChatSessionById(id: number, userId: string) {
  const rows = await db.select().from(chatSessions).where(and(eq(chatSessions.id, id), eq(chatSessions.userId, userId))).limit(1);
  return rows[0] ?? null;
}

// Favorites
export async function getFavoritesByUser(userId: string) {
  return db
    .select({
      id: favorites.id,
      userId: favorites.userId,
      spotId: favorites.spotId,
      routeId: favorites.routeId,
      type: favorites.type,
      createdAt: favorites.createdAt,
      spotName: spots.name,
      spotImage: spots.imageUrl,
      spotRating: spots.rating,
      routeName: routes.name,
      routeImage: routes.imageUrl,
    })
    .from(favorites)
    .leftJoin(spots, eq(favorites.spotId, spots.id))
    .leftJoin(routes, eq(favorites.routeId, routes.id))
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}

export async function addFavorite(userId: string, type: "spot" | "route", id: number) {
  // Check for duplicates first
  const existing = type === "spot"
    ? await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.spotId, id))).limit(1)
    : await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.routeId, id))).limit(1);
  if (existing.length > 0) return existing[0];

  const data = type === "spot"
    ? { userId, type, spotId: id }
    : { userId, type, routeId: id };
  const rows = await db.insert(favorites).values(data).returning();
  return rows[0];
}

export async function removeFavorite(userId: string, type: "spot" | "route", itemId: number) {
  if (type === "spot") {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.spotId, itemId)));
  } else {
    await db.delete(favorites).where(and(eq(favorites.userId, userId), eq(favorites.routeId, itemId)));
  }
}

export async function removeFavoriteById(id: number, userId: string) {
  await db.delete(favorites).where(and(eq(favorites.id, id), eq(favorites.userId, userId)));
}

export async function isFavorited(userId: string, type: "spot" | "route", itemId: number) {
  const rows = type === "spot"
    ? await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.spotId, itemId))).limit(1)
    : await db.select().from(favorites).where(and(eq(favorites.userId, userId), eq(favorites.routeId, itemId))).limit(1);
  return rows.length > 0 ? rows[0] : null;
}

// Visit records
export async function getVisitRecordsByUser(userId: string) {
  return db.select().from(visitRecords).where(eq(visitRecords.userId, userId)).orderBy(desc(visitRecords.visitedAt)).limit(50);
}

export async function createVisitRecord(userId: string, type: "spot" | "route", id: number) {
  const data = type === "spot"
    ? { userId, type, spotId: id }
    : { userId, type, routeId: id };
  const rows = await db.insert(visitRecords).values(data).returning();
  return rows[0];
}

export async function rateVisitRecord(id: number, userId: string, rating: number, notes?: string) {
  const rows = await db.update(visitRecords)
    .set({ rating, notes: notes ?? "", })
    .where(and(eq(visitRecords.id, id), eq(visitRecords.userId, userId)))
    .returning();
  return rows[0];
}

export async function getVisitStats(userId: string) {
  const records = await getVisitRecordsByUser(userId);
  const spotCount = new Set(records.filter((r) => r.type === "spot" && r.spotId).map((r) => r.spotId)).size;
  const routeCount = new Set(records.filter((r) => r.type === "route" && r.routeId).map((r) => r.routeId)).size;
  return { totalVisits: records.length, uniqueSpots: spotCount, uniqueRoutes: routeCount, records };
}

// User preferences
export async function getUserPreferences(userId: string) {
  const rows = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function upsertUserPreferences(userId: string, data: {
  interests?: string[]; preferredDuration?: number;
  accessibilityMode?: string; language?: string;
}) {
  const existing = await getUserPreferences(userId);
  if (existing) {
    const rows = await db.update(userPreferences).set({ ...data, updatedAt: new Date() }).where(eq(userPreferences.userId, userId)).returning();
    return rows[0];
  } else {
    const rows = await db.insert(userPreferences).values({ userId, ...data }).returning();
    return rows[0];
  }
}
