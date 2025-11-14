CREATE TABLE "vocabulary" (
	"english" text PRIMARY KEY NOT NULL,
	"translated_language" text DEFAULT 'Chinese' NOT NULL,
	"translated_to" text NOT NULL,
	"reviewed_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "note_content" ADD COLUMN "difficult_vocabularies" text[] DEFAULT '{}';