import { pgTable, serial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

// Chat/QA sessions
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("导览对话"),
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ChatSession = InferSelectModel<typeof chatSessions>;

// User favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  spotId: integer("spot_id"),
  routeId: integer("route_id"),
  type: text("type").notNull().default("spot"), // spot | route
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Favorite = InferSelectModel<typeof favorites>;

// Visit records
export const visitRecords = pgTable("visit_records", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  spotId: integer("spot_id"),
  routeId: integer("route_id"),
  type: text("type").notNull().default("spot"), // spot | route
  visitedAt: timestamp("visited_at").notNull().defaultNow(),
  durationMinutes: integer("duration_minutes").default(0),
  rating: integer("rating"), // 1-5
  notes: text("notes").default(""),
});

export type VisitRecord = InferSelectModel<typeof visitRecords>;

// User preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  interests: jsonb("interests").$type<string[]>().default([]),
  preferredDuration: integer("preferred_duration").default(120),
  accessibilityMode: text("accessibility_mode").default("normal"), // normal | elder | child
  language: text("language").default("zh"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type UserPreference = InferSelectModel<typeof userPreferences>;
