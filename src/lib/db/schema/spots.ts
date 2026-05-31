import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const spots = pgTable("spots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull().default("cultural"), // cultural | nature | history | family
  description: text("description").notNull().default(""),
  imageUrl: text("image_url").default(""),
  audioGuide: text("audio_guide").default(""),
  duration: integer("duration").notNull().default(30), // minutes
  distance: text("distance").default(""), // e.g. "500m from entrance"
  tags: jsonb("tags").$type<string[]>().default([]),
  rating: integer("rating").notNull().default(45), // out of 50
  visitCount: integer("visit_count").notNull().default(0),
  location: jsonb("location").$type<{ lat: number; lng: number }>().default({ lat: 0, lng: 0 }),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Spot = InferSelectModel<typeof spots>;
