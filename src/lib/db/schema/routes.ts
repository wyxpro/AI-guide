import { pgTable, serial, text, timestamp, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const routes = pgTable("routes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  interest: text("interest").notNull().default("history"), // history | nature | cultural | family
  duration: integer("duration").notNull().default(120), // minutes
  difficulty: text("difficulty").notNull().default("easy"), // easy | medium | hard
  spotIds: jsonb("spot_ids").$type<number[]>().default([]),
  highlights: jsonb("highlights").$type<string[]>().default([]),
  totalDistance: text("total_distance").default(""),
  imageUrl: text("image_url").default(""),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type Route = InferSelectModel<typeof routes>;
