import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

// Knowledge base documents
export const knowledgeDocs = pgTable("knowledge_docs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull().default("general"), // general | spot | faq | history | transport
  content: text("content").notNull().default(""),
  fileType: text("file_type").default("text"), // text | pdf | word
  fileUrl: text("file_url").default(""),
  fileSize: integer("file_size").default(0), // bytes
  status: text("status").notNull().default("active"), // active | inactive | processing
  vectorized: boolean("vectorized").notNull().default(false),
  embedding: jsonb("embedding").$type<number[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type KnowledgeDoc = InferSelectModel<typeof knowledgeDocs>;

// Digital human avatar configurations
export const avatarConfigs = pgTable("avatar_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  avatarStyle: text("avatar_style").notNull().default("default"), // default | ancient | modern | cartoon
  voiceStyle: text("voice_style").notNull().default("warm"), // warm | professional | lively
  speechRate: integer("speech_rate").notNull().default(100), // 50-200 percentage
  pitch: integer("pitch").notNull().default(100), // 50-200 percentage
  greeting: text("greeting").default("您好，欢迎来到翠玉景区，我是您的AI导览小玉，请问有什么可以帮助您？"),
  isDefault: boolean("is_default").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  imageUrl: text("image_url").default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AvatarConfig = InferSelectModel<typeof avatarConfigs>;

// Analytics / statistics snapshots
export const analyticsDaily = pgTable("analytics_daily", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  totalVisitors: integer("total_visitors").notNull().default(0),
  totalSessions: integer("total_sessions").notNull().default(0),
  totalQuestions: integer("total_questions").notNull().default(0),
  satisfactionScore: integer("satisfaction_score").notNull().default(45), // out of 50
  topSpotIds: jsonb("top_spot_ids").$type<number[]>().default([]),
  topQuestions: jsonb("top_questions").$type<string[]>().default([]),
  sentimentPositive: integer("sentiment_positive").notNull().default(0),
  sentimentNeutral: integer("sentiment_neutral").notNull().default(0),
  sentimentNegative: integer("sentiment_negative").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AnalyticsDaily = InferSelectModel<typeof analyticsDaily>;

// QA conversation logs for B-end drill-down
export const qaLogs = pgTable("qa_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sentiment: text("sentiment").notNull().default("neutral"), // positive | neutral | negative
  rating: integer("rating"), // user rating/feedback if any (1-5)
  date: text("date").notNull(), // YYYY-MM-DD
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QaLog = InferSelectModel<typeof qaLogs>;
