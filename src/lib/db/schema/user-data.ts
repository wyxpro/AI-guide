import { pgTable, serial, text, timestamp, integer, jsonb, unique } from "drizzle-orm/pg-core";
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
}, (table) => [
  unique("user_spot_route_unique").on(table.userId, table.spotId, table.routeId)
]);

export type Favorite = InferSelectModel<typeof favorites>;

// Merchants table
export const merchants = pgTable("merchants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  description: text("description").notNull().default(""),
  location: text("location").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Merchant = InferSelectModel<typeof merchants>;

// Coupons table
export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  merchantId: integer("merchant_id").references(() => merchants.id),
  title: text("title").notNull(),
  discountValue: text("discount_value").notNull(), // e.g. "9折" or "满100减20"
  expiryDate: text("expiry_date").notNull(), // YYYY-MM-DD
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Coupon = InferSelectModel<typeof coupons>;

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

// Search queries
export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  userId: text("user_id").default("anonymous"),
  query: text("query").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SearchQuery = InferSelectModel<typeof searchQueries>;
