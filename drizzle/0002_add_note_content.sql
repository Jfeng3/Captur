CREATE TABLE IF NOT EXISTS "note_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"take_aways" jsonb,
	"reflections" jsonb,
	"marked_sentences" jsonb,
	"tags" text[] DEFAULT '{}',
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "note_content_user_id_url_unique" UNIQUE("user_id","url")
);
