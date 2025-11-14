import { supabase } from '../lib/db';

export type VocabularyStatus = 'passive' | 'active';
export type ExerciseType = 'write_sentences' | 'fill_blank' | 'email_completion' | 'scenario';

export interface VocabStatus {
  id: string;
  noteId: string;
  status: VocabularyStatus;
  activationScore: number;
  lastActivationDate: Date | null;
  activationCount: number;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivationExercise {
  id: string;
  noteId: string;
  exerciseType: ExerciseType;
  userResponse: string;
  isCorrect: boolean | null;
  feedback: string | null;
  completedAt: Date;
  userId?: string;
}

export interface GeneratedExercise {
  exerciseType: ExerciseType;
  exercise: any; // Varies by exercise type
}

export const activationApi = {
  // Get vocabulary status for a note
  async getVocabularyStatus(noteId: string): Promise<VocabStatus | null> {
    const { data, error } = await supabase
      .from('vocabulary_status')
      .select('*')
      .eq('note_id', noteId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data ? {
      id: data.id,
      noteId: data.note_id,
      status: data.status,
      activationScore: data.activation_score,
      lastActivationDate: data.last_activation_date ? new Date(data.last_activation_date) : null,
      activationCount: data.activation_count,
      userId: data.user_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    } : null;
  },

  // Create or update vocabulary status
  async upsertVocabularyStatus(noteId: string, status: VocabularyStatus, activationScore?: number): Promise<VocabStatus> {
    const existing = await this.getVocabularyStatus(noteId);

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('vocabulary_status')
        .update({
          status,
          activation_score: activationScore ?? existing.activationScore,
          updated_at: new Date().toISOString(),
        })
        .eq('note_id', noteId)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        noteId: data.note_id,
        status: data.status,
        activationScore: data.activation_score,
        lastActivationDate: data.last_activation_date ? new Date(data.last_activation_date) : null,
        activationCount: data.activation_count,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } else {
      // Create new
      const { data, error } = await supabase
        .from('vocabulary_status')
        .insert({
          note_id: noteId,
          status,
          activation_score: activationScore ?? 0,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        noteId: data.note_id,
        status: data.status,
        activationScore: data.activation_score,
        lastActivationDate: data.last_activation_date ? new Date(data.last_activation_date) : null,
        activationCount: data.activation_count,
        userId: data.user_id,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    }
  },

  // Increment activation count and update score
  async recordActivation(noteId: string, scoreIncrease: number): Promise<void> {
    const { error } = await supabase.rpc('increment_activation', {
      p_note_id: noteId,
      p_score_increase: scoreIncrease,
    });

    if (error) {
      // Fallback if RPC doesn't exist - manual update
      const status = await this.getVocabularyStatus(noteId);
      if (status) {
        const newScore = Math.min(100, status.activationScore + scoreIncrease);
        const newStatus: VocabularyStatus = newScore >= 70 ? 'active' : 'passive';

        await supabase
          .from('vocabulary_status')
          .update({
            activation_count: status.activationCount + 1,
            activation_score: newScore,
            status: newStatus,
            last_activation_date: new Date().toISOString(),
          })
          .eq('note_id', noteId);
      }
    }
  },

  // Get all vocabulary grouped by status
  async getVocabularyByStatus(status: VocabularyStatus): Promise<VocabStatus[]> {
    const { data, error } = await supabase
      .from('vocabulary_status')
      .select('*')
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      noteId: d.note_id,
      status: d.status,
      activationScore: d.activation_score,
      lastActivationDate: d.last_activation_date ? new Date(d.last_activation_date) : null,
      activationCount: d.activation_count,
      userId: d.user_id,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  },

  // Generate activation exercise via API
  async generateExercise(content: string, exerciseType?: ExerciseType): Promise<GeneratedExercise> {
    const response = await fetch('/api/generate-activation-exercise', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, exerciseType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate exercise');
    }

    return await response.json();
  },

  // Save exercise completion
  async saveExerciseCompletion(
    noteId: string,
    exerciseType: ExerciseType,
    userResponse: string,
    isCorrect?: boolean,
    feedback?: string
  ): Promise<ActivationExercise> {
    const { data, error } = await supabase
      .from('activation_exercises')
      .insert({
        note_id: noteId,
        exercise_type: exerciseType,
        user_response: userResponse,
        is_correct: isCorrect ?? null,
        feedback: feedback ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      noteId: data.note_id,
      exerciseType: data.exercise_type,
      userResponse: data.user_response,
      isCorrect: data.is_correct,
      feedback: data.feedback,
      completedAt: new Date(data.completed_at),
      userId: data.user_id,
    };
  },

  // Get exercise history for a note
  async getExerciseHistory(noteId: string): Promise<ActivationExercise[]> {
    const { data, error } = await supabase
      .from('activation_exercises')
      .select('*')
      .eq('note_id', noteId)
      .order('completed_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      noteId: d.note_id,
      exerciseType: d.exercise_type,
      userResponse: d.user_response,
      isCorrect: d.is_correct,
      feedback: d.feedback,
      completedAt: new Date(d.completed_at),
      userId: d.user_id,
    }));
  },

  // Get daily activation queue (passive vocabulary that needs practice)
  async getDailyActivationQueue(limit: number = 10): Promise<VocabStatus[]> {
    const { data, error } = await supabase
      .from('vocabulary_status')
      .select('*')
      .eq('status', 'passive')
      .order('last_activation_date', { ascending: true, nullsFirst: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(d => ({
      id: d.id,
      noteId: d.note_id,
      status: d.status,
      activationScore: d.activation_score,
      lastActivationDate: d.last_activation_date ? new Date(d.last_activation_date) : null,
      activationCount: d.activation_count,
      userId: d.user_id,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at),
    }));
  },

  // Get activation statistics
  async getActivationStats(): Promise<{
    totalVocabulary: number;
    activeCount: number;
    passiveCount: number;
    activationRate: number;
    averageScore: number;
  }> {
    const { data, error } = await supabase
      .from('vocabulary_status')
      .select('status, activation_score');

    if (error) throw error;

    const total = data?.length || 0;
    const active = data?.filter(d => d.status === 'active').length || 0;
    const passive = data?.filter(d => d.status === 'passive').length || 0;
    const avgScore = total > 0
      ? data.reduce((sum, d) => sum + (d.activation_score || 0), 0) / total
      : 0;

    return {
      totalVocabulary: total,
      activeCount: active,
      passiveCount: passive,
      activationRate: total > 0 ? (active / total) * 100 : 0,
      averageScore: avgScore,
    };
  },
};
