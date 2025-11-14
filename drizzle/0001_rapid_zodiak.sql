CREATE TABLE "activation_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"exercise_type" text NOT NULL,
	"user_response" text NOT NULL,
	"is_correct" boolean,
	"feedback" text,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" text
);
--> statement-breakpoint
CREATE TABLE "note_content" (
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
--> statement-breakpoint
CREATE TABLE "vocabulary_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"status" text DEFAULT 'passive' NOT NULL,
	"activation_score" integer DEFAULT 0,
	"last_activation_date" timestamp with time zone,
	"activation_count" integer DEFAULT 0,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "url" text;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "next_review_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "review_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "ease_factor" numeric DEFAULT '2.5';--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "interval" integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE "notes" ADD COLUMN "last_reviewed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "activation_exercises" ADD CONSTRAINT "activation_exercises_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vocabulary_status" ADD CONSTRAINT "vocabulary_status_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;