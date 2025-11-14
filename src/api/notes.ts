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

export interface Note {
  id: string;
  content: string;
  tag: string;
  status: 'draft';
  createdAt: Date;
  updatedAt: Date;
  originalContent?: string | null;
  wordCount: number;
  url?: string | null; // Source URL for the note
  // Spaced repetition fields
  nextReviewAt?: Date | null;
  reviewCount?: number;
  easeFactor?: number;
  interval?: number;
  lastReviewedAt?: Date | null;
}

export interface WeeklyTags {
  id: string;
  tag1: string;
  tag2: string;
  weekStart: Date;
  weekEnd: Date;
}

export interface Vocabulary {
  english: string; // Primary key
  translatedLanguage: string;
  translatedTo: string;
  reviewedTime?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NoteContent {
  id: string;
  url: string;
  takeAways?: string[];
  reflections?: string[];
  markedSentences?: Array<{ text: string; category: string }>;
  difficultVocabularies?: string[]; // Array of english words
  tags?: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export const noteContentApi = {
  async upsertNoteContent(noteContent: Omit<NoteContent, 'id' | 'createdAt' | 'updatedAt'>): Promise<NoteContent> {
    // First check if record exists
    const { data: existing } = await supabase
      .from('note_content')
      .select('id')
      .eq('user_id', noteContent.userId)
      .eq('url', noteContent.url)
      .maybeSingle();

    let data, error;

    if (existing) {
      // Update existing record - REPLACE all fields
      const result = await supabase
        .from('note_content')
        .update({
          take_aways: noteContent.takeAways || [],
          reflections: noteContent.reflections || [],
          marked_sentences: noteContent.markedSentences || [],
          difficult_vocabularies: noteContent.difficultVocabularies || [],
          tags: noteContent.tags || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await supabase
        .from('note_content')
        .insert({
          url: noteContent.url,
          take_aways: noteContent.takeAways || [],
          reflections: noteContent.reflections || [],
          marked_sentences: noteContent.markedSentences || [],
          difficult_vocabularies: noteContent.difficultVocabularies || [],
          tags: noteContent.tags || [],
          user_id: noteContent.userId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      data = result.data;
      error = result.error;
    }

    if (error) throw error;

    return {
      id: data.id,
      url: data.url,
      takeAways: data.take_aways || [],
      reflections: data.reflections || [],
      markedSentences: data.marked_sentences || [],
      difficultVocabularies: data.difficult_vocabularies || [],
      tags: data.tags || [],
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getNoteContentByUrl(userId: string, url: string): Promise<NoteContent | null> {
    const { data, error } = await supabase
      .from('note_content')
      .select('*')
      .eq('user_id', userId)
      .eq('url', url)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      id: data.id,
      url: data.url,
      takeAways: data.take_aways || [],
      reflections: data.reflections || [],
      markedSentences: data.marked_sentences || [],
      difficultVocabularies: data.difficult_vocabularies || [],
      tags: data.tags || [],
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getAllNoteContent(userId: string): Promise<NoteContent[]> {
    const { data, error } = await supabase
      .from('note_content')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      id: item.id,
      url: item.url,
      takeAways: item.take_aways || [],
      reflections: item.reflections || [],
      markedSentences: item.marked_sentences || [],
      difficultVocabularies: item.difficult_vocabularies || [],
      tags: item.tags || [],
      userId: item.user_id,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  },

  async deleteNoteContent(id: string): Promise<void> {
    const { error } = await supabase
      .from('note_content')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

export const vocabularyApi = {
  async upsertVocabulary(vocab: Omit<Vocabulary, 'createdAt' | 'updatedAt'>): Promise<Vocabulary> {
    const { data, error } = await supabase
      .from('vocabulary')
      .upsert({
        english: vocab.english,
        translated_language: vocab.translatedLanguage,
        translated_to: vocab.translatedTo,
        reviewed_time: vocab.reviewedTime?.toISOString() || null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'english'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      english: data.english,
      translatedLanguage: data.translated_language,
      translatedTo: data.translated_to,
      reviewedTime: data.reviewed_time ? new Date(data.reviewed_time) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getVocabulary(english: string): Promise<Vocabulary | null> {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .eq('english', english)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      english: data.english,
      translatedLanguage: data.translated_language,
      translatedTo: data.translated_to,
      reviewedTime: data.reviewed_time ? new Date(data.reviewed_time) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async getAllVocabularies(): Promise<Vocabulary[]> {
    const { data, error } = await supabase
      .from('vocabulary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(item => ({
      english: item.english,
      translatedLanguage: item.translated_language,
      translatedTo: item.translated_to,
      reviewedTime: item.reviewed_time ? new Date(item.reviewed_time) : null,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  },

  async updateReviewTime(english: string, reviewedTime: Date): Promise<Vocabulary> {
    const { data, error} = await supabase
      .from('vocabulary')
      .update({
        reviewed_time: reviewedTime.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('english', english)
      .select()
      .single();

    if (error) throw error;

    return {
      english: data.english,
      translatedLanguage: data.translated_language,
      translatedTo: data.translated_to,
      reviewedTime: data.reviewed_time ? new Date(data.reviewed_time) : null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async deleteVocabulary(english: string): Promise<void> {
    const { error } = await supabase
      .from('vocabulary')
      .delete()
      .eq('english', english);

    if (error) throw error;
  }
};

export const notesApi = {
  async getAllNotes(userId: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('writing_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map(note => ({
      id: note.id,
      content: note.content,
      tag: note.tag,
      status: 'draft',
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
      originalContent: note.original_content,
      wordCount: note.word_count,
      url: note.url || null,
      nextReviewAt: note.next_review_at ? new Date(note.next_review_at) : null,
      reviewCount: note.review_count || 0,
      easeFactor: note.ease_factor ? parseFloat(note.ease_factor) : 2.5,
      interval: note.interval || 1,
      lastReviewedAt: note.last_reviewed_at ? new Date(note.last_reviewed_at) : null
    }));
  },

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { userId: string }): Promise<Note> {
    console.log('createNote', note);
    const wordCount = note.content.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Schedule first review for 1 day from now
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + 1);

    const { data, error } = await supabase
      .from('writing_notes')
      .insert({
        content: note.content,
        tag: note.tag,
        status: note.status,
        original_content: note.originalContent,
        word_count: wordCount,
        user_id: note.userId,
        next_review_at: nextReview.toISOString(),
        review_count: 0,
        ease_factor: 2.5,
        interval: 1
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      tag: data.tag,
      status: 'draft',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      originalContent: data.original_content,
      wordCount: data.word_count,
      url: data.url || null,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count || 0,
      easeFactor: data.ease_factor ? parseFloat(data.ease_factor) : 2.5,
      interval: data.interval || 1,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null
    };
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    const wordCount = updates.content
      ? updates.content.trim().split(/\s+/).filter(word => word.length > 0).length
      : undefined;

    const updateData: any = {};
    if (updates.content !== undefined) updateData.content = updates.content;
    if (updates.tag !== undefined) updateData.tag = updates.tag;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.originalContent !== undefined) updateData.original_content = updates.originalContent;
    if (wordCount !== undefined) updateData.word_count = wordCount;
    if (updates.nextReviewAt !== undefined) updateData.next_review_at = updates.nextReviewAt?.toISOString();
    if (updates.reviewCount !== undefined) updateData.review_count = updates.reviewCount;
    if (updates.easeFactor !== undefined) updateData.ease_factor = updates.easeFactor;
    if (updates.interval !== undefined) updateData.interval = updates.interval;
    if (updates.lastReviewedAt !== undefined) updateData.last_reviewed_at = updates.lastReviewedAt?.toISOString();

    const { data, error } = await supabase
      .from('writing_notes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      tag: data.tag,
      status: 'draft',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      originalContent: data.original_content,
      wordCount: data.word_count,
      url: data.url || null,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count || 0,
      easeFactor: data.ease_factor ? parseFloat(data.ease_factor) : 2.5,
      interval: data.interval || 1,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null
    };
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('writing_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCurrentWeeklyTags(userId: string): Promise<WeeklyTags | null> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('weekly_tags')
      .select('*')
      .eq('user_id', userId)
      .gte('week_start', oneWeekAgo.toISOString())
      .order('week_start', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    const result = data[0];
    return {
      id: result.id,
      tag1: result.tag1,
      tag2: result.tag2,
      weekStart: new Date(result.week_start),
      weekEnd: new Date(result.week_end)
    };
  },

  async createWeeklyTags(tags: Omit<WeeklyTags, 'id'> & { userId: string }): Promise<WeeklyTags> {
    const { data, error } = await supabase
      .from('weekly_tags')
      .insert({
        tag1: tags.tag1,
        tag2: tags.tag2,
        week_start: tags.weekStart.toISOString(),
        week_end: tags.weekEnd.toISOString(),
        user_id: tags.userId
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      tag1: data.tag1,
      tag2: data.tag2,
      weekStart: new Date(data.week_start),
      weekEnd: new Date(data.week_end)
    };
  },

  async updateWeeklyTags(id: string, updates: Partial<WeeklyTags>): Promise<WeeklyTags> {
    const updateData: any = {};
    if (updates.tag1 !== undefined) updateData.tag1 = updates.tag1;
    if (updates.tag2 !== undefined) updateData.tag2 = updates.tag2;
    if (updates.weekStart !== undefined) updateData.week_start = updates.weekStart.toISOString();
    if (updates.weekEnd !== undefined) updateData.week_end = updates.weekEnd.toISOString();
    
    const { data, error } = await supabase
      .from('weekly_tags')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      tag1: data.tag1,
      tag2: data.tag2,
      weekStart: new Date(data.week_start),
      weekEnd: new Date(data.week_end)
    };
  },

  // Spaced Repetition Methods
  async getDueForReview(userId: string): Promise<Note[]> {
    const now = new Date();

    const { data, error } = await supabase
      .from('writing_notes')
      .select('*')
      .eq('user_id', userId)
      .not('next_review_at', 'is', null)
      .lte('next_review_at', now.toISOString())
      .order('next_review_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(note => ({
      id: note.id,
      content: note.content,
      tag: note.tag,
      status: 'draft',
      createdAt: new Date(note.created_at),
      updatedAt: new Date(note.updated_at),
      originalContent: note.original_content,
      wordCount: note.word_count,
      url: note.url || null,
      nextReviewAt: note.next_review_at ? new Date(note.next_review_at) : null,
      reviewCount: note.review_count || 0,
      easeFactor: note.ease_factor ? parseFloat(note.ease_factor) : 2.5,
      interval: note.interval || 1,
      lastReviewedAt: note.last_reviewed_at ? new Date(note.last_reviewed_at) : null
    }));
  },

  async recordReview(id: string, quality: number): Promise<Note> {
    // Get current note
    const { data: currentNote, error: fetchError } = await supabase
      .from('writing_notes')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const currentEaseFactor = currentNote.ease_factor ? parseFloat(currentNote.ease_factor) : 2.5;
    const currentInterval = currentNote.interval || 1;

    // Calculate next review schedule
    const { easeFactor, interval, nextReviewDate } = calculateNextReview(
      currentEaseFactor,
      currentInterval,
      quality
    );

    // Update note with new schedule
    const { data, error } = await supabase
      .from('writing_notes')
      .update({
        next_review_at: nextReviewDate.toISOString(),
        ease_factor: easeFactor,
        interval: interval,
        review_count: (currentNote.review_count || 0) + 1,
        last_reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      tag: data.tag,
      status: 'draft',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      originalContent: data.original_content,
      wordCount: data.word_count,
      url: data.url || null,
      nextReviewAt: data.next_review_at ? new Date(data.next_review_at) : null,
      reviewCount: data.review_count || 0,
      easeFactor: data.ease_factor ? parseFloat(data.ease_factor) : 2.5,
      interval: data.interval || 1,
      lastReviewedAt: data.last_reviewed_at ? new Date(data.last_reviewed_at) : null
    };
  }
};