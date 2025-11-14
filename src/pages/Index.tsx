import { useEffect, useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotesStore } from '../stores/notesStore';
import Sidebar from '../components/Sidebar';
import AIResponseModal from '../components/AIResponseModal';
import { TextEditor } from '../components/TextEditor';
import { ComparisonTextEditor } from '../components/ComparisonTextEditor';
import { RephraseBox } from '../components/RephraseBox';
import { NoteCard } from '../components/NoteCard';
import { ActivationExerciseModal } from '../components/ActivationExerciseModal';
import { getCriticFeedback, getRephraseOptions } from '../api/openai';
import { notesApi, noteContentApi, type Note, type NoteContent } from '../api/notes';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function Index() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    notes,
    weeklyTags,
    isWriting,
    currentNote,
    selectedTag,
    wordCount,
    editingNote,
    loading,
    error,
    filterStatus,
    filterTag,
    sidebarCollapsed,
    setUserId,
    loadNotes,
    loadWeeklyTags,
    createNote,
    updateNote,
    deleteNote,
    setIsWriting,
    setCurrentNote,
    setSelectedTag,
    setEditingNote,
    setFilterStatus,
    setFilterTag,
    setSidebarCollapsed,
    setError,
    filteredNotes
  } = useNotesStore();

  // Note content from chrome extension
  const [noteContents, setNoteContents] = useState<NoteContent[]>([]);

  // AI Assistant state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiModalType, setAiModalType] = useState<'critic'>('critic');
  const [aiResponse, setAiResponse] = useState<any>({});
  const [aiLoading, setAiLoading] = useState(false);
  
  // Inline rephrase state
  const [rephraseResponse, setRephraseResponse] = useState<any>(null);
  const [rephraseLoading, setRephraseLoading] = useState(false);

  // Expanded notes state
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Activation exercise state
  const [activationModalOpen, setActivationModalOpen] = useState(false);
  const [activationNote, setActivationNote] = useState<any>(null);

  // Review state
  const [reviewNotes, setReviewNotes] = useState<Note[]>([]);
  const [reviewingNote, setReviewingNote] = useState<Note | null>(null);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Set userId in store when user loads
  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user, setUserId]);

  // Load notes and weekly tags when user is authenticated
  useEffect(() => {
    if (user) {
      loadNotes(user.id);
      loadWeeklyTags(user.id);
      loadReviewNotes(user.id);
      loadNoteContents(user.id);
    }
  }, [user]);

  const loadNoteContents = async (userId: string) => {
    try {
      const contents = await noteContentApi.getAllNoteContent(userId);
      setNoteContents(contents);
    } catch (error) {
      console.error('Error loading note contents:', error);
    }
  };

  const loadReviewNotes = async (userId: string) => {
    try {
      const dueNotes = await notesApi.getDueForReview(userId);
      setReviewNotes(dueNotes);
    } catch (error) {
      console.error('Error loading review notes:', error);
    }
  };

  // Set default tag when weekly tags are loaded
  useEffect(() => {
    if (!selectedTag && weeklyTags.tag1) {
      setSelectedTag(weeklyTags.tag1);
    }
  }, [weeklyTags.tag1, selectedTag, setSelectedTag]);

  const handleNewNote = () => {
    setCurrentNote('');
    setSelectedTag(weeklyTags.tag1);
    setEditingNote(null);
  };

  const handleSaveNote = async () => {
    if (!user) return;

    if (currentNote.trim() && wordCount <= 300) {
      console.log('createNote', currentNote, selectedTag, wordCount);
      await createNote({
        content: currentNote,
        tag: selectedTag || weeklyTags.tag1,
        status: 'draft',
        wordCount
      }, user.id);
    }
  };

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      setEditingNote(noteId);
      setCurrentNote(note.content);
      setSelectedTag(note.tag);
    }
  };

  const handleUpdateNote = async () => {
    if (editingNote && wordCount <= 300) {
      await updateNote(editingNote, {
        content: currentNote,
        tag: selectedTag,
        wordCount
      });
    }
  };


  const handleCritic = async () => {
    if (!currentNote.trim()) return;
    
    setAiLoading(true);
    setAiModalType('critic');
    setAiModalOpen(true);
    
    try {
      const response = await getCriticFeedback(currentNote);
      setAiResponse(response);
    } catch (error) {
      setError('Failed to get AI feedback. Please try again.');
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRephrase = async () => {
    if (!currentNote.trim()) return;
    
    setRephraseLoading(true);
    setRephraseResponse(null);
    
    try {
      const response = await getRephraseOptions(currentNote);
      setRephraseResponse(response);
    } catch (error) {
      setError('Failed to get AI rephrase options. Please try again.');
      setRephraseResponse(null);
    } finally {
      setRephraseLoading(false);
    }
  };

  const handleApplyRephrase = (content: string) => {
    setCurrentNote(content);
    setRephraseResponse(null);
  };

  const handleCloseRephrase = () => {
    setRephraseResponse(null);
  };

  const toggleNoteExpanded = (noteId: string) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  const isNoteExpanded = (noteId: string) => expandedNotes.has(noteId);

  const handleReview = async (quality: number) => {
    if (!reviewingNote || !user) return;

    try {
      await notesApi.recordReview(reviewingNote.id, quality);
      setReviewingNote(null);
      // Reload review notes
      await loadReviewNotes(user.id);
      await loadNotes(user.id);
    } catch (error) {
      setError('Failed to record review');
      console.error('Error recording review:', error);
    }
  };

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (!user) {
    return null;
  }

  // Apply filters
  const filtered = filteredNotes();
  const draftNotes = filtered.filter(n => n.status === 'draft');

  return (
    <div className="relative min-h-screen flex">
      {/* Watercolor Background */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url(/watercolor-background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex w-full">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
            <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-primary">
                Miniflow Notebook
              </h1>
              <div className="h-6 w-px bg-foreground/10"></div>
              <div className="text-sm text-muted-foreground">
                This Week:
                <span className="ml-2 rounded-full bg-transparent px-3 h-8 inline-flex items-center text-xs ring-1 ring-foreground/10 hover:bg-card/50 transition-colors">
                  {weeklyTags.tag1}
                </span>
                <span className="mx-1 text-muted-foreground">&</span>
                <span className="rounded-full bg-transparent px-3 h-8 inline-flex items-center text-xs ring-1 ring-foreground/10 hover:bg-card/50 transition-colors">
                  {weeklyTags.tag2}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Filter indicator */}
              {(filterStatus !== 'all' || filterTag) && (
                <div className="flex items-center gap-2 px-3 py-2 bg-card ring-1 ring-foreground/10 rounded-lg">
                  <span className="text-sm font-medium text-foreground">Filters:</span>
                  {filterStatus !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground">
                      {filterStatus}
                    </span>
                  )}
                  {filterTag && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-accent text-accent-foreground">
                      #{filterTag}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilterStatus('all');
                      setFilterTag(null);
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => {
                  setEditingNote(null);
                  setCurrentNote('');
                }}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
                New Note
              </Button>
            </div>
          </nav>
        </header>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 max-w-7xl mx-auto">
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                {error}
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-destructive hover:text-destructive/80 transition-colors"
                >
                  ×
                </button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="space-y-12">
          {/* Writing Panel - Chatbox Style */}
          <div className="w-full">
            <Card className="overflow-hidden border-2">
              <div className={`transition-all duration-200 ${rephraseResponse || rephraseLoading ? 'divide-y' : ''}`}>
                {/* Main textarea section */}
                <div>
                  {rephraseResponse || rephraseLoading ? (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <ComparisonTextEditor
                          value={currentNote}
                          onChange={setCurrentNote}
                          placeholder="Save a new word or sentence you learned today..."
                          onCritic={handleCritic}
                          onRephrase={handleRephrase}
                          onApplyStyle={() => console.log('Apply style')}
                          onSubmit={() => {
                            if (editingNote) {
                              handleUpdateNote();
                            } else {
                              handleSaveNote();
                            }
                          }}
                          disabled={loading}
                          isLoading={aiLoading}
                          showComparison={true}
                          wordCount={wordCount}
                          className="min-h-16 bg-transparent resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 field-sizing-content max-h-[6lh] focus-visible:ring-0 w-full text-base md:text-sm placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="flex-1">
                        <RephraseBox
                          rephraseResponse={rephraseResponse}
                          isLoading={rephraseLoading}
                          onApply={handleApplyRephrase}
                          onPartialApply={(updated) => {
                            setCurrentNote(updated);
                          }}
                          onClose={handleCloseRephrase}
                          originalText={currentNote}
                          baseText={currentNote}
                        />
                      </div>
                    </div>
                  ) : (
                    <TextEditor
                      value={currentNote}
                      onChange={setCurrentNote}
                      placeholder="Save a new word or sentence you learned today..."
                      onCritic={handleCritic}
                      onRephrase={handleRephrase}
                      onApplyStyle={() => console.log('Apply style')}
                      onSubmit={() => {
                        if (editingNote) {
                          handleUpdateNote();
                        } else {
                          handleSaveNote();
                        }
                      }}
                      disabled={loading}
                      isLoading={aiLoading}
                      wordCount={wordCount}
                      className="min-h-16 bg-transparent resize-none rounded-none border-none p-3 shadow-none outline-none ring-0 field-sizing-content max-h-[6lh] focus-visible:ring-0 w-full text-base md:text-sm placeholder:text-muted-foreground"
                    />
                  )}
                </div>

                {/* Button bar - only shown when not comparing */}
                {!rephraseResponse && !rephraseLoading && (
                  <div className="flex items-center justify-between p-1">
                    <div className="flex items-center gap-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-lg hover:bg-accent hover:text-accent-foreground [&:first-child]:rounded-bl-xl transition-all duration-200"
                        onClick={handleCritic}
                        disabled={loading || !currentNote.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="h-8 px-2.5 py-2 gap-1.5 rounded-lg hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                        onClick={handleRephrase}
                        disabled={loading || !currentNote.trim()}
                      >
                        <span className="text-sm">Rephrase</span>
                      </Button>
                    </div>
                    <Button
                      className="absolute bottom-1 right-1 size-8 bg-primary text-primary-foreground shadow-md border-[0.5px] border-white/25 ring-1 ring-(--ring-color) [--ring-color:color-mix(in_oklab,var(--color-foreground)15%,var(--color-primary))] [&_svg]:drop-shadow-sm shadow-black/25 disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => {
                        if (editingNote) {
                          handleUpdateNote();
                        } else {
                          handleSaveNote();
                        }
                      }}
                      disabled={loading || !currentNote.trim() || wordCount > 300}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m5 12 7-7 7 7"></path>
                        <path d="M12 19V5"></path>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Suggestion Pills */}
          <div className="w-full">
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentNote("Ephemeral - lasting for a very short time")}
              >
                Save a word
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentNote("The phenomenon was ephemeral, disappearing almost as quickly as it appeared.")}
              >
                Save a sentence
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentNote("Practice pronunciation: ephemeral")}
              >
                Practice pronunciation
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentNote("Words learned today:\n- Ephemeral: temporary\n- Ubiquitous: everywhere")}
              >
                Vocabulary list
              </Button>
            </div>
          </div>

          {/* Review Section */}
          {reviewNotes.length > 0 && (
            <div className="w-full">
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Clock className="h-6 w-6 text-primary" />
                      Due for Review
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {reviewNotes.length} note{reviewNotes.length !== 1 ? 's' : ''} waiting
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {reviewingNote ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-background rounded-lg border-2">
                        <p className="text-lg mb-4">{reviewingNote.content}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>#{reviewingNote.tag}</span>
                          <span>•</span>
                          <span>Reviewed {reviewingNote.reviewCount} times</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground text-center mb-2">
                          How well did you remember this?
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleReview(0)}
                            className="hover:bg-destructive/10 hover:border-destructive"
                          >
                            Forgot
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReview(3)}
                            className="hover:bg-yellow-500/10 hover:border-yellow-500"
                          >
                            Hard
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReview(4)}
                            className="hover:bg-blue-500/10 hover:border-blue-500"
                          >
                            Good
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleReview(5)}
                            className="hover:bg-green-500/10 hover:border-green-500"
                          >
                            Easy
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {reviewNotes.slice(0, 3).map(note => (
                        <div
                          key={note.id}
                          className="p-4 bg-background rounded-lg border hover:border-primary/50 transition-colors cursor-pointer"
                          onClick={() => setReviewingNote(note)}
                        >
                          <p className="text-sm line-clamp-2">{note.content}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                            <span>#{note.tag}</span>
                            {note.reviewCount && note.reviewCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{note.reviewCount} reviews</span>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      {reviewNotes.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center pt-2">
                          +{reviewNotes.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notes Board */}
          <div className="w-full">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Your Vocabulary Notes
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {draftNotes.length + noteContents.length} saved
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Display note_content from chrome extension */}
                  {noteContents.map(noteContent => {
                    // Convert NoteContent to Note format for NoteCard
                    const convertedNote: Note = {
                      id: noteContent.id,
                      content: '', // Will be built from sections
                      tag: noteContent.tags?.[0] || 'reading',
                      status: 'draft',
                      createdAt: noteContent.createdAt,
                      updatedAt: noteContent.updatedAt,
                      url: noteContent.url,
                      wordCount: 0
                    };

                    // Build content in markdown format
                    let content = '';
                    if (noteContent.takeAways && noteContent.takeAways.length > 0) {
                      content += '# Key Takeaways\n\n';
                      noteContent.takeAways.forEach((t, i) => {
                        content += `${i + 1}. ${t}\n`;
                      });
                      content += '\n';
                    }
                    if (noteContent.reflections && noteContent.reflections.length > 0) {
                      content += '# Reflections\n\n';
                      noteContent.reflections.forEach((r, i) => {
                        content += `${i + 1}. ${r}\n`;
                      });
                      content += '\n';
                    }
                    if (noteContent.markedSentences && noteContent.markedSentences.length > 0) {
                      content += '# Marked Sentences\n\n';
                      noteContent.markedSentences.forEach(s => {
                        content += `- ${s.text}\n`;
                      });
                    }
                    convertedNote.content = content;

                    return (
                      <NoteCard
                        key={noteContent.id}
                        note={convertedNote}
                        isExpanded={isNoteExpanded(noteContent.id)}
                        onToggleExpand={() => toggleNoteExpanded(noteContent.id)}
                        onEdit={() => {
                          // TODO: Implement edit for note_content
                          console.log('Edit note_content not yet implemented');
                        }}
                        onDelete={async () => {
                          try {
                            await noteContentApi.deleteNoteContent(noteContent.id);
                            if (user) loadNoteContents(user.id);
                          } catch (error) {
                            console.error('Error deleting note content:', error);
                          }
                        }}
                      />
                    );
                  })}

                  {draftNotes.length === 0 && noteContents.length === 0 && (
                    <div className="text-center py-16">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                        <Plus className="h-10 w-10 text-primary" />
                      </div>
                      <p className="text-foreground text-xl font-semibold mb-2">No vocabulary saved yet</p>
                      <p className="text-muted-foreground text-lg">Save your first word or sentence to start building your vocabulary!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </div>

      {/* AI Response Modal */}
      <AIResponseModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        type={aiModalType}
        response={aiResponse}
        isLoading={aiLoading}
      />

      {/* Activation Exercise Modal */}
      <ActivationExerciseModal
        isOpen={activationModalOpen}
        onClose={() => {
          setActivationModalOpen(false);
          setActivationNote(null);
        }}
        note={activationNote}
        onComplete={() => {
          // Reload notes to update any status changes
          if (user) loadNotes(user.id);
        }}
      />
      </div>
      </div>
    </div>
  );
}