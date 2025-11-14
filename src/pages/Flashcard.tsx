import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { flashcardsApi, type Flashcard } from '../api/flashcards';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

export default function Flashcard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadFlashcards(user.id);
    }
  }, [user]);

  const loadFlashcards = async (userId: string) => {
    try {
      setLoading(true);
      const allFlashcards = await flashcardsApi.getAllFlashcards(userId);
      setFlashcards(allFlashcards);
    } catch (error) {
      console.error('Error loading flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentCard = flashcards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleReview = async (quality: number) => {
    if (!currentCard) return;

    try {
      await flashcardsApi.recordReview(currentCard.id, quality);
      handleNext();
    } catch (error) {
      console.error('Error recording review:', error);
    }
  };

  // Function to highlight the vocabulary word in the back content
  const renderBackContent = (back: string | null, front: string) => {
    if (!back) {
      return <div className="whitespace-pre-line text-foreground">{front}</div>;
    }

    console.log('Rendering back content:', { back, front });

    // Split by "Example: " to find the example sentence
    const parts = back.split(/Example:\s*/i);
    if (parts.length < 2) {
      // No example sentence found, just return the content with preserved whitespace
      console.log('No example found, showing back as-is');
      return <div className="whitespace-pre-line text-foreground">{back}</div>;
    }

    const beforeExample = parts[0];
    const exampleSentence = parts.slice(1).join('Example: ');

    console.log('Split content:', { beforeExample, exampleSentence });

    // Escape special regex characters in the front word
    const escapedWord = front.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Create regex to find the word (case insensitive, word boundaries)
    const regex = new RegExp(`\\b(${escapedWord})\\b`, 'gi');

    // Highlight the word in the example sentence
    const highlightedExample = exampleSentence.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 font-semibold">$1</mark>');

    console.log('Highlighted example:', highlightedExample);

    return (
      <div className="text-foreground">
        <div className="whitespace-pre-line">{beforeExample}</div>
        <div className="mt-2">
          <span className="text-muted-foreground">Example: </span>
          <span dangerouslySetInnerHTML={{ __html: highlightedExample }} />
        </div>
      </div>
    );
  };

  // Show loading state while authenticating or loading flashcards
  if (authLoading || loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Watercolor background */}
        <div
          className="fixed inset-0 z-0 opacity-30"
          style={{
            backgroundImage: "url(/watercolor-background.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (will redirect)
  if (!user) {
    return null;
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        {/* Watercolor background */}
        <div
          className="fixed inset-0 z-0 opacity-30"
          style={{
            backgroundImage: "url(/watercolor-background.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <Card className="relative z-10 max-w-md w-full mx-4 border-2 shadow-lg">
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">No Flashcards Yet</h1>
            <p className="text-muted-foreground mb-6">
              Go to Notes and check the vocabularies to create flashcards.
            </p>
            <Button onClick={() => window.location.href = '/notes'}>
              Go to Notes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Watercolor background */}
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url(/watercolor-background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Vocabulary Flashcards
          </h1>
          <Button variant="outline" onClick={() => window.location.href = '/notes'}>
            Go to Notes
          </Button>
        </nav>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress indicator */}
        <div className="text-center space-y-2">
          <p className="text-muted-foreground text-lg">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>

        {/* Flashcard */}
        <div className="perspective-1000" onClick={handleFlip}>
          <div
            className="relative cursor-pointer transition-transform duration-500"
            style={{
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* Front of card */}
            <Card
              className="min-h-[400px] hover:scale-[1.02] transition-transform border-2 shadow-2xl bg-card"
              style={{
                backfaceVisibility: 'hidden',
              }}
            >
              <CardContent className="p-12 flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-4">
                  <p className="text-4xl font-bold text-foreground">
                    {currentCard.front}
                  </p>
                  <p className="text-sm text-muted-foreground">Click to reveal</p>
                </div>
              </CardContent>
            </Card>

            {/* Back of card */}
            <Card
              className="absolute inset-0 min-h-[400px] border-2 shadow-2xl bg-card"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <CardContent className="p-12 flex items-center justify-center min-h-[400px]">
                <div className="space-y-4 w-full">
                  <div className="text-xl leading-relaxed text-foreground">
                    {renderBackContent(currentCard.back, currentCard.front)}
                  </div>
                  {currentCard.tag && (
                    <div className="pt-4 border-t">
                      <span className="inline-flex items-center px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                        #{currentCard.tag}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={flashcards.length === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button onClick={handleFlip} variant="ghost">
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={flashcards.length === 1}
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Review Buttons (shown after flip) */}
        {isFlipped && (
          <Card className="border-2 shadow-lg bg-card">
            <CardContent className="p-6 space-y-4">
              <p className="text-center text-sm text-muted-foreground font-medium">How well did you know this?</p>
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReview(0)}
                  className="hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
                >
                  Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(3)}
                  className="hover:bg-yellow-500/10 hover:border-yellow-500 hover:text-yellow-700"
                >
                  Hard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(4)}
                  className="hover:bg-blue-500/10 hover:border-blue-500 hover:text-blue-700"
                >
                  Good
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(5)}
                  className="hover:bg-green-500/10 hover:border-green-500 hover:text-green-700"
                >
                  Easy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </div>
  );
}
