CREATE TABLE "flashcards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"front" text NOT NULL,
	"back" text,
	"source_url" text,
	"tag" text DEFAULT 'vocabulary',
	"user_id" text DEFAULT 'default' NOT NULL,
	"next_review_at" timestamp with time zone,
	"review_count" integer DEFAULT 0,
	"ease_factor" numeric DEFAULT '2.5',
	"interval" integer DEFAULT 1,
	"last_reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vocabulary" ALTER COLUMN "translated_language" SET DEFAULT 'zh-CN';