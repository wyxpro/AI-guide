import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { routes } from "../schema/routes";

export async function getAllRoutes() {
  return db.select().from(routes).where(eq(routes.isPublic, true)).orderBy(desc(routes.createdAt));
}

export async function getRouteById(id: number) {
  const rows = await db.select().from(routes).where(eq(routes.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getRoutesByInterest(interest: string) {
  return db.select().from(routes).where(eq(routes.interest, interest)).orderBy(desc(routes.createdAt));
}

export async function createRoute(data: {
  name: string; description: string; interest: string;
  duration: number; spotIds: number[]; highlights: string[];
  totalDistance: string; difficulty: string;
}) {
  const rows = await db.insert(routes).values({ ...data, isPublic: true }).returning();
  return rows[0];
}
