import { supabase } from '../lib/db';

// Spaced Repetition Algorithm (simplified SM-2)
export function calculateNextReview(
  currentEaseFactor: number,
  currentInterval: number,
  quality: number // 0-5, where 0=failed, 3=good, 5=perfect
): { easeFactor: number; interval: number; nextReviewDate: Date } {
  // Update ease factor based on quality
  let newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor should not go below 1.3
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  // Calculate new interval
  let newInterval: number;
  if (quality < 3) {
    // Failed - restart
    newInterval = 1;
  } else {
    // Passed - increase interval
    if (currentInterval === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back?: string | null;
  sourceUrl?: string | null;
  tag: string;
  userId: string;
  nextReviewAt?: Date | null;
  reviewCount: number;
  easeFactor: number;
  interval: number;
  lastReviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export const flashcardsApi = {
  async createFlashcard(flashcard: {
    front: string;
    back?: string;
    sourceUrl?: string;
    tag?: string;
    userId: string;
  }): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .insert({
        front: flashcard.front,
        back: flashcard.back || null,
        source_url: flashcard.sourceUrl || null,
        tag: flashcard.tag || 'vocabulary',
        user_id: flashcard.userId,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      sourceUrl: data.source_url,
      tag: data.tag,
      userId: data.user_id,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count,
      easeFactor: parseFloat(data.ease_factor),
      interval: data.interval,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async getAllFlashcards(userId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      front: item.front,
      back: item.back,
      sourceUrl: item.source_url,
      tag: item.tag,
      userId: item.user_id,
      nextReviewAt: item.next_review_at ? new Date(item.next_review_at) : null,
      reviewCount: item.review_count,
      easeFactor: parseFloat(item.ease_factor),
      interval: item.interval,
      lastReviewedAt: item.last_reviewed_at ? new Date(item.last_reviewed_at) : null,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  },

  async getFlashcard(id: string): Promise<Flashcard> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      sourceUrl: data.source_url,
      tag: data.tag,
      userId: data.user_id,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count,
      easeFactor: parseFloat(data.ease_factor),
      interval: data.interval,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async updateFlashcard(id: string, updates: Partial<Omit<Flashcard, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Flashcard> {
    const updateData: any = {};

    if (updates.front !== undefined) updateData.front = updates.front;
    if (updates.back !== undefined) updateData.back = updates.back;
    if (updates.sourceUrl !== undefined) updateData.source_url = updates.sourceUrl;
    if (updates.tag !== undefined) updateData.tag = updates.tag;
    if (updates.nextReviewAt !== undefined) updateData.next_review_at = updates.nextReviewAt;
    if (updates.reviewCount !== undefined) updateData.review_count = updates.reviewCount;
    if (updates.easeFactor !== undefined) updateData.ease_factor = updates.easeFactor;
    if (updates.interval !== undefined) updateData.interval = updates.interval;
    if (updates.lastReviewedAt !== undefined) updateData.last_reviewed_at = updates.lastReviewedAt;

    const { data, error } = await supabase
      .from('flashcards')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      sourceUrl: data.source_url,
      tag: data.tag,
      userId: data.user_id,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count,
      easeFactor: parseFloat(data.ease_factor),
      interval: data.interval,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  },

  async deleteFlashcard(id: string): Promise<void> {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async recordReview(id: string, quality: number): Promise<Flashcard> {
    // Get current flashcard
    const flashcard = await this.getFlashcard(id);

    // Calculate next review using SM-2 algorithm
    const { easeFactor, interval, nextReviewDate } = calculateNextReview(
      flashcard.easeFactor,
      flashcard.interval,
      quality
    );

    // Update flashcard with new values
    return this.updateFlashcard(id, {
      easeFactor,
      interval,
      nextReviewAt: nextReviewDate,
      reviewCount: flashcard.reviewCount + 1,
      lastReviewedAt: new Date(),
    });
  },

  async getDueForReview(userId: string): Promise<Flashcard[]> {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId)
      .or(`next_review_at.is.null,next_review_at.lte.${now}`)
      .order('next_review_at', { ascending: true });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      front: item.front,
      back: item.back,
      sourceUrl: item.source_url,
      tag: item.tag,
      userId: item.user_id,
      nextReviewAt: item.next_review_at ? new Date(item.next_review_at) : null,
      reviewCount: item.review_count,
      easeFactor: parseFloat(item.ease_factor),
      interval: item.interval,
      lastReviewedAt: item.last_reviewed_at ? new Date(item.last_reviewed_at) : null,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));
  },
};
