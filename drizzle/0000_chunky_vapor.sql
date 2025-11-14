CREATE TABLE "discovered_tweets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tweet_id" text NOT NULL,
	"user_id" text NOT NULL,
	"author_id" text NOT NULL,
	"author_username" text NOT NULL,
	"author_name" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"likes_count" integer DEFAULT 0,
	"retweets_count" integer DEFAULT 0,
	"replies_count" integer DEFAULT 0,
	"relevance_score" integer DEFAULT 0,
	"status" text DEFAULT 'discovered',
	"discovered_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "discovered_tweets_tweet_id_unique" UNIQUE("tweet_id")
);
--> statement-breakpoint
CREATE TABLE "memo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text DEFAULT 'jfeng1115@gmail.com' NOT NULL,
	"text_memo" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text NOT NULL,
	"tag" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"original_content" text,
	"word_count" integer NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"x_account_name" text,
	"persona_name" text,
	"persona_desc" text,
	"brand_voice" text,
	"brand_style" text,
	"logo" text,
	"color_palette" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "replies" (
	"id" bigint PRIMARY KEY NOT NULL,
	"original_text" text,
	"image_url" text,
	"reply" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"status" text DEFAULT 'wait for review',
	"updated_at" timestamp with time zone DEFAULT now(),
	"text" text,
	"author_name" text,
	"author_username" text,
	"likes_count" integer DEFAULT 0,
	"retweets_count" integer DEFAULT 0,
	"replies_count" integer DEFAULT 0,
	"url" text,
	"relevance_score" numeric DEFAULT '0.0'
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_key" text NOT NULL,
	"memo_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email" text DEFAULT 'jfeng1115@gmail.com'
);
--> statement-breakpoint
CREATE TABLE "tweet_selection_criteria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"include_keywords" text[] DEFAULT '{}',
	"exclude_keywords" text[] DEFAULT '{}',
	"hashtags" text[] DEFAULT '{}',
	"min_likes" integer DEFAULT 5,
	"min_retweets" integer DEFAULT 1,
	"min_replies" integer DEFAULT 0,
	"max_age_hours" integer DEFAULT 24,
	"check_frequency_minutes" integer DEFAULT 60,
	"language" text DEFAULT 'en',
	"verified_only" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "weekly_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag1" text NOT NULL,
	"tag2" text NOT NULL,
	"week_start" timestamp with time zone NOT NULL,
	"week_end" timestamp with time zone NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "x_token" (
	"id" bigint PRIMARY KEY NOT NULL,
	"x_account_name" text NOT NULL,
	"access_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "x_token_x_account_name_unique" UNIQUE("x_account_name")
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_memo_id_memo_id_fk" FOREIGN KEY ("memo_id") REFERENCES "public"."memo"("id") ON DELETE no action ON UPDATE no action;