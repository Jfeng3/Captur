import { pgTable, text, timestamp, integer, numeric, uuid, boolean, jsonb, bigint, unique } from 'drizzle-orm/pg-core';

export const replies = pgTable('replies', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  originalText: text('original_text'),
  imageUrl: text('image_url'),
  reply: text('reply'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  status: text('status').default('wait for review'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  text: text('text'),
  authorName: text('author_name'),
  authorUsername: text('author_username'),
  likesCount: integer('likes_count').default(0),
  retweetsCount: integer('retweets_count').default(0),
  repliesCount: integer('replies_count').default(0),
  url: text('url'),
  relevanceScore: numeric('relevance_score').default('0.0'),
});

export const personas = pgTable('personas', {
  id: uuid('id').primaryKey().defaultRandom(),
  xAccountName: text('x_account_name'),
  personaName: text('persona_name'),
  personaDesc: text('persona_desc'),
  brandVoice: text('brand_voice'),
  brandStyle: text('brand_style'),
  logo: text('logo'),
  colorPalette: jsonb('color_palette'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const tweetSelectionCriteria = pgTable('tweet_selection_criteria', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull(),
  includeKeywords: text('include_keywords').array().default([]),
  excludeKeywords: text('exclude_keywords').array().default([]),
  hashtags: text('hashtags').array().default([]),
  minLikes: integer('min_likes').default(5),
  minRetweets: integer('min_retweets').default(1),
  minReplies: integer('min_replies').default(0),
  maxAgeHours: integer('max_age_hours').default(24),
  checkFrequencyMinutes: integer('check_frequency_minutes').default(60),
  language: text('language').default('en'),
  verifiedOnly: boolean('verified_only').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const discoveredTweets = pgTable('discovered_tweets', {
  id: uuid('id').primaryKey().defaultRandom(),
  tweetId: text('tweet_id').notNull().unique(),
  userId: text('user_id').notNull(),
  authorId: text('author_id').notNull(),
  authorUsername: text('author_username').notNull(),
  authorName: text('author_name').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  likesCount: integer('likes_count').default(0),
  retweetsCount: integer('retweets_count').default(0),
  repliesCount: integer('replies_count').default(0),
  relevanceScore: integer('relevance_score').default(0),
  status: text('status').default('discovered'),
  discoveredAt: timestamp('discovered_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const xToken = pgTable('x_token', {
  id: bigint('id', { mode: 'number' }).primaryKey().notNull(),
  xAccountName: text('x_account_name').notNull().unique(),
  accessToken: text('access_token').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const memo = pgTable('memo', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().default('jfeng1115@gmail.com'),
  textMemo: text('text_memo'),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tagKey: text('tag_key').notNull(),
  memoId: uuid('memo_id').notNull().references(() => memo.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  email: text('email').default('jfeng1115@gmail.com'),
});

// Daily Notes Writer Tables
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  tag: text('tag').notNull(),
  status: text('status').notNull().default('draft'), // only 'draft' status now
  originalContent: text('original_content'), // For storing content before AI styling
  wordCount: integer('word_count').notNull(),
  userId: text('user_id').notNull(), // Required - user who owns this note
  url: text('url'), // Source URL for the note
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  // Spaced repetition fields
  nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
  reviewCount: integer('review_count').default(0),
  easeFactor: numeric('ease_factor').default('2.5'), // SM-2 algorithm ease factor
  interval: integer('interval').default(1), // Days until next review
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
});

export const weeklyTags = pgTable('weekly_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  tag1: text('tag1').notNull(),
  tag2: text('tag2').notNull(),
  weekStart: timestamp('week_start', { withTimezone: true }).notNull(),
  weekEnd: timestamp('week_end', { withTimezone: true }).notNull(),
  userId: text('user_id').notNull(), // Required - user who owns these tags
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Active vs Passive Vocabulary Tracking
export const vocabularyStatus = pgTable('vocabulary_status', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('passive'), // 'passive' | 'active'
  activationScore: integer('activation_score').default(0), // 0-100 score
  lastActivationDate: timestamp('last_activation_date', { withTimezone: true }),
  activationCount: integer('activation_count').default(0),
  userId: text('user_id').notNull(), // Required - user who owns this status
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Activation Exercise Completions
export const activationExercises = pgTable('activation_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  exerciseType: text('exercise_type').notNull(), // 'write_sentences' | 'fill_blank' | 'email_completion' | 'scenario'
  userResponse: text('user_response').notNull(),
  isCorrect: boolean('is_correct'),
  feedback: text('feedback'),
  completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  userId: text('user_id').notNull(), // Required - user who completed this exercise
});

// Vocabulary - Individual vocabulary items with translations and review tracking
export const vocabulary = pgTable('vocabulary', {
  english: text('english').primaryKey(),
  translatedLanguage: text('translated_language').notNull().default('zh-CN'), // ISO 639-1 language code
  translatedTo: text('translated_to').notNull(),
  reviewedTime: timestamp('reviewed_time', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Note Content - Structured content from chrome extension
export const noteContent = pgTable('note_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  takeAways: jsonb('take_aways'), // Array of takeaway strings
  reflections: jsonb('reflections'), // Array of reflection strings
  markedSentences: jsonb('marked_sentences'), // Array of marked sentence objects with text and category
  difficultVocabularies: text('difficult_vocabularies').array().default([]), // Array of english words (references vocabulary.english)
  tags: text('tags').array().default([]), // Array of tag strings
  userId: text('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  // Unique constraint on userId + url combination
  userUrlUnique: unique().on(table.userId, table.url),
}));

// Flashcards - Vocabulary flashcards for spaced repetition
export const flashcards = pgTable('flashcards', {
  id: uuid('id').primaryKey().defaultRandom(),
  front: text('front').notNull(), // The vocabulary word/phrase (question)
  back: text('back'), // Definition, translation, or example sentence (answer)
  sourceUrl: text('source_url'), // Where the vocabulary came from
  tag: text('tag').default('vocabulary'), // Category/tag for organizing
  userId: text('user_id').notNull(), // Required - user who owns this flashcard
  // Spaced repetition fields (SM-2 algorithm)
  nextReviewAt: timestamp('next_review_at', { withTimezone: true }),
  reviewCount: integer('review_count').default(0),
  easeFactor: numeric('ease_factor').default('2.5'),
  interval: integer('interval').default(1), // Days until next review
  lastReviewedAt: timestamp('last_reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});