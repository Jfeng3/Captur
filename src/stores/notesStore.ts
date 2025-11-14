import { create } from 'zustand';
import { notesApi, type Note, type WeeklyTags } from '../api/notes';

interface NotesStore {
  // Core Data
  notes: Note[];
  weeklyTags: WeeklyTags;
  userId: string | null;

  // UI State
  isWriting: boolean;
  currentNote: string;
  selectedTag: string;
  wordCount: number;
  editingNote: string | null;

  // App State
  loading: boolean;
  error: string | null;

  // Filters
  filterStatus: 'all' | 'draft';
  filterTag: string | null;
  sidebarCollapsed: boolean;

  // Data Actions
  setUserId: (userId: string | null) => void;
  loadNotes: (userId: string) => Promise<void>;
  loadWeeklyTags: (userId: string) => Promise<void>;
  createNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>, userId: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  
  // Tag Actions
  canCreateNewTag: () => boolean;
  createNewTag: (tagName: string) => Promise<boolean>;
  
  // UI Actions
  setIsWriting: (writing: boolean) => void;
  setCurrentNote: (note: string) => void;
  setSelectedTag: (tag: string) => void;
  setEditingNote: (id: string | null) => void;
  setFilterStatus: (status: 'all' | 'draft') => void;
  setFilterTag: (tag: string | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed Properties
  filteredNotes: () => Note[];
}

export const useNotesStore = create<NotesStore>((set, get) => ({
  // Initial State
  notes: [],
  weeklyTags: {
    id: '',
    tag1: 'productivity',
    tag2: 'creativity',
    weekStart: new Date(),
    weekEnd: new Date()
  },
  userId: null,

  // UI State
  isWriting: false,
  currentNote: '',
  selectedTag: '',
  wordCount: 0,
  editingNote: null,

  // App State
  loading: false,
  error: null,

  // Filters
  filterStatus: 'all',
  filterTag: null,
  sidebarCollapsed: false,

  // Data Actions
  setUserId: (userId) => set({ userId }),

  loadNotes: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const fetchedNotes = await notesApi.getAllNotes(userId);
      set({ notes: fetchedNotes, loading: false });
    } catch (err) {
      set({ error: 'Failed to load notes', loading: false });
      console.error('Error loading notes:', err);
    }
  },

  loadWeeklyTags: async (userId: string) => {
    try {
      const tags = await notesApi.getCurrentWeeklyTags(userId);
      if (tags) {
        set({ weeklyTags: tags });
      } else {
        // Create default weekly tags
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        const newTags = await notesApi.createWeeklyTags({
          tag1: 'productivity',
          tag2: 'creativity',
          weekStart,
          weekEnd,
          userId
        });
        set({ weeklyTags: newTags });
      }
    } catch (err) {
      console.error('Error loading weekly tags:', err);
    }
  },

  createNote: async (noteData, userId: string) => {
    try {
      set({ loading: true, error: null });
      const newNote = await notesApi.createNote({ ...noteData, userId });
      set(state => ({
        notes: [...state.notes, newNote],
        loading: false,
        isWriting: false,
        currentNote: '',
        wordCount: 0
      }));
    } catch (err) {
      set({ error: 'Failed to save note', loading: false });
      console.error('Error saving note:', err);
    }
  },
  
  updateNote: async (id, updates) => {
    try {
      set({ loading: true, error: null });
      const updatedNote = await notesApi.updateNote(id, updates);
      set(state => ({
        notes: state.notes.map(note => 
          note.id === id ? updatedNote : note
        ),
        loading: false,
        editingNote: null
      }));
    } catch (err) {
      set({ error: 'Failed to update note', loading: false });
      console.error('Error updating note:', err);
    }
  },
  
  deleteNote: async (id) => {
    try {
      set({ loading: true, error: null });
      await notesApi.deleteNote(id);
      set(state => ({
        notes: state.notes.filter(note => note.id !== id),
        loading: false
      }));
    } catch (err) {
      set({ error: 'Failed to delete note', loading: false });
      console.error('Error deleting note:', err);
    }
  },
  
  // Tag Actions
  canCreateNewTag: () => {
    const { weeklyTags } = get();
    const now = new Date();
    const weekStart = new Date(weeklyTags.weekStart);
    
    // Check if we're in a new week
    const currentWeekStart = new Date(now);
    currentWeekStart.setDate(now.getDate() - now.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    const storedWeekStart = new Date(weekStart);
    storedWeekStart.setHours(0, 0, 0, 0);
    
    // If we're in a new week, we can create up to 2 tags
    if (currentWeekStart > storedWeekStart) {
      return true;
    }
    
    // Within the same week, check if we have available slots
    const currentTags = [weeklyTags.tag1, weeklyTags.tag2].filter(tag => tag && tag.trim());
    return currentTags.length < 2;
  },
  
  createNewTag: async (tagName: string) => {
    try {
      const { weeklyTags, userId } = get();
      if (!userId) {
        set({ error: 'User not authenticated' });
        return false;
      }

      const now = new Date();

      // Check if we need to reset for a new week
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(currentWeekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const storedWeekStart = new Date(weeklyTags.weekStart);
      storedWeekStart.setHours(0, 0, 0, 0);

      let updatedTags: WeeklyTags;

      if (currentWeekStart > storedWeekStart) {
        // New week - create fresh tags
        updatedTags = await notesApi.createWeeklyTags({
          tag1: tagName,
          tag2: '',
          weekStart: currentWeekStart,
          weekEnd: weekEnd,
          userId
        });
      } else {
        // Same week - update existing tags
        const updates: Partial<WeeklyTags> = {};
        if (!weeklyTags.tag1 || !weeklyTags.tag1.trim()) {
          updates.tag1 = tagName;
        } else if (!weeklyTags.tag2 || !weeklyTags.tag2.trim()) {
          updates.tag2 = tagName;
        } else {
          // Both slots are full - cannot create more tags this week
          set({ error: 'No more tag slots available this week. Wait until Monday for new slots.' });
          return false;
        }

        updatedTags = await notesApi.updateWeeklyTags(weeklyTags.id, updates);
      }

      set({ weeklyTags: updatedTags, selectedTag: tagName });
      return true;
    } catch (err) {
      console.error('Error creating new tag:', err);
      set({ error: 'Failed to create new tag' });
      return false;
    }
  },
  
  // UI Actions
  setIsWriting: (writing) => set({ isWriting: writing }),
  
  setCurrentNote: (note) => {
    const words = note.trim().split(/\s+/).filter(word => word.length > 0);
    set({ currentNote: note, wordCount: words.length });
  },
  
  setSelectedTag: (tag) => set({ selectedTag: tag }),
  
  setEditingNote: (id) => set({ editingNote: id }),
  
  
  setFilterStatus: (status) => set({ filterStatus: status }),
  
  setFilterTag: (tag) => set({ filterTag: tag }),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setError: (error) => set({ error }),
  
  // Computed Properties
  filteredNotes: () => {
    const { notes, filterStatus, filterTag } = get();
    return notes.filter(note => {
      const statusMatch = filterStatus === 'all' || note.status === filterStatus;
      const tagMatch = !filterTag || note.tag === filterTag;
      return statusMatch && tagMatch;
    });
  }
}));