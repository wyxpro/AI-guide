import { eq, desc } from "drizzle-orm";
import { db } from "../client";
import { knowledgeDocs, avatarConfigs, analyticsDaily } from "../schema/admin";

// Knowledge docs
export async function getAllKnowledgeDocs() {
  return db.select().from(knowledgeDocs).orderBy(desc(knowledgeDocs.updatedAt));
}

export async function createKnowledgeDoc(data: {
  title: string; category: string; content: string;
  fileType?: string; tags?: string[];
}) {
  const rows = await db.insert(knowledgeDocs).values(data).returning();
  return rows[0];
}

export async function updateKnowledgeDoc(id: number, data: Partial<{
  title: string; category: string; content: string; status: string; tags: string[];
}>) {
  const rows = await db.update(knowledgeDocs).set({ ...data, updatedAt: new Date() }).where(eq(knowledgeDocs.id, id)).returning();
  return rows[0];
}

export async function deleteKnowledgeDoc(id: number) {
  await db.delete(knowledgeDocs).where(eq(knowledgeDocs.id, id));
}

// Avatar configs
export async function getAllAvatarConfigs() {
  return db.select().from(avatarConfigs).where(eq(avatarConfigs.isActive, true)).orderBy(desc(avatarConfigs.createdAt));
}

export async function getDefaultAvatarConfig() {
  const rows = await db.select().from(avatarConfigs).where(eq(avatarConfigs.isDefault, true)).limit(1);
  return rows[0] ?? null;
}

export async function updateAvatarConfig(id: number, data: Partial<{
  avatarStyle: string; voiceStyle: string; speechRate: number;
  pitch: number; greeting: string; isDefault: boolean;
}>) {
  if (data.isDefault) {
    await db.update(avatarConfigs).set({ isDefault: false });
  }
  const rows = await db.update(avatarConfigs).set({ ...data, updatedAt: new Date() }).where(eq(avatarConfigs.id, id)).returning();
  return rows[0];
}

export async function createAvatarConfig(data: {
  name: string; avatarStyle: string; voiceStyle: string;
  speechRate: number; pitch: number; greeting: string;
}) {
  const rows = await db.insert(avatarConfigs).values(data).returning();
  return rows[0];
}

// Analytics
export async function getRecentAnalytics(days: number = 7) {
  return db.select().from(analyticsDaily).orderBy(desc(analyticsDaily.date)).limit(days);
}

export async function getTodayAnalytics() {
  const today = new Date().toISOString().split("T")[0];
  const rows = await db.select().from(analyticsDaily).where(eq(analyticsDaily.date, today)).limit(1);
  return rows[0] ?? null;
}

export async function upsertDailyAnalytics(date: string, data: Partial<{
  totalVisitors: number; totalSessions: number; totalQuestions: number;
  satisfactionScore: number; sentimentPositive: number; sentimentNeutral: number; sentimentNegative: number;
}>) {
  const existing = await db.select().from(analyticsDaily).where(eq(analyticsDaily.date, date)).limit(1);
  if (existing[0]) {
    const rows = await db.update(analyticsDaily).set(data).where(eq(analyticsDaily.date, date)).returning();
    return rows[0];
  } else {
    const rows = await db.insert(analyticsDaily).values({ date, ...data }).returning();
    return rows[0];
  }
}
