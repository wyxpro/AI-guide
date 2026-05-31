CREATE TABLE "analytics_daily" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"total_visitors" integer DEFAULT 0 NOT NULL,
	"total_sessions" integer DEFAULT 0 NOT NULL,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"satisfaction_score" integer DEFAULT 45 NOT NULL,
	"top_spot_ids" jsonb DEFAULT '[]'::jsonb,
	"top_questions" jsonb DEFAULT '[]'::jsonb,
	"sentiment_positive" integer DEFAULT 0 NOT NULL,
	"sentiment_neutral" integer DEFAULT 0 NOT NULL,
	"sentiment_negative" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "avatar_configs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar_style" text DEFAULT 'default' NOT NULL,
	"voice_style" text DEFAULT 'warm' NOT NULL,
	"speech_rate" integer DEFAULT 100 NOT NULL,
	"pitch" integer DEFAULT 100 NOT NULL,
	"greeting" text DEFAULT '您好，欢迎来到翠玉景区，我是您的AI导览小玉，请问有什么可以帮助您？',
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"image_url" text DEFAULT '',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"file_type" text DEFAULT 'text',
	"file_url" text DEFAULT '',
	"file_size" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"vectorized" boolean DEFAULT false NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"email" varchar(256),
	"name" text,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "spots" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'cultural' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image_url" text DEFAULT '',
	"audio_guide" text DEFAULT '',
	"duration" integer DEFAULT 30 NOT NULL,
	"distance" text DEFAULT '',
	"tags" jsonb DEFAULT '[]'::jsonb,
	"rating" integer DEFAULT 45 NOT NULL,
	"visit_count" integer DEFAULT 0 NOT NULL,
	"location" jsonb DEFAULT '{"lat":0,"lng":0}'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"interest" text DEFAULT 'history' NOT NULL,
	"duration" integer DEFAULT 120 NOT NULL,
	"difficulty" text DEFAULT 'easy' NOT NULL,
	"spot_ids" jsonb DEFAULT '[]'::jsonb,
	"highlights" jsonb DEFAULT '[]'::jsonb,
	"total_distance" text DEFAULT '',
	"image_url" text DEFAULT '',
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text DEFAULT '导览对话' NOT NULL,
	"messages" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"spot_id" integer,
	"route_id" integer,
	"type" text DEFAULT 'spot' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"interests" jsonb DEFAULT '[]'::jsonb,
	"preferred_duration" integer DEFAULT 120,
	"accessibility_mode" text DEFAULT 'normal',
	"language" text DEFAULT 'zh',
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "visit_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"spot_id" integer,
	"route_id" integer,
	"type" text DEFAULT 'spot' NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"duration_minutes" integer DEFAULT 0,
	"rating" integer,
	"notes" text DEFAULT ''
);
--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");