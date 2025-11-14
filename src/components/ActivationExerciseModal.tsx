import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Loader2, CheckCircle2, AlertCircle, Target, TrendingUp } from 'lucide-react';
import { activationApi, type ExerciseType, type GeneratedExercise } from '../api/activation';
import { Note } from '../api/notes';

interface ActivationExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onComplete?: () => void;
}

export const ActivationExerciseModal = ({
  isOpen,
  onClose,
  note,
  onComplete
}: ActivationExerciseModalProps) => {
  const [exercise, setExercise] = useState<GeneratedExercise | null>(null);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [vocabularyStatus, setVocabularyStatus] = useState<any>(null);

  useEffect(() => {
    if (isOpen && note) {
      loadExercise();
      loadVocabularyStatus();
    } else {
      resetState();
    }
  }, [isOpen, note]);

  const resetState = () => {
    setExercise(null);
    setUserResponse('');
    setError(null);
    setIsCompleted(false);
  };

  const loadVocabularyStatus = async () => {
    if (!note) return;

    try {
      const status = await activationApi.getVocabularyStatus(note.id);
      setVocabularyStatus(status);
    } catch (err) {
      console.error('Failed to load vocabulary status:', err);
    }
  };

  const loadExercise = async () => {
    if (!note) return;

    setIsLoading(true);
    setError(null);

    try {
      // Default to write_sentences exercise
      const generatedExercise = await activationApi.generateExercise(note.content, 'write_sentences');
      setExercise(generatedExercise);
    } catch (err) {
      console.error('Failed to generate exercise:', err);
      setError('Failed to generate exercise. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!note || !exercise || !userResponse.trim()) return;

    setIsSaving(true);
    setError(null);

    try {
      // Save the exercise completion
      await activationApi.saveExerciseCompletion(
        note.id,
        exercise.exerciseType,
        userResponse
      );

      // Increase activation score (20 points per completed exercise)
      await activationApi.recordActivation(note.id, 20);

      // Reload status
      await loadVocabularyStatus();

      setIsCompleted(true);

      if (onComplete) {
        onComplete();
      }

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to save exercise:', err);
      setError('Failed to save your response. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getExerciseTypeLabel = (type: ExerciseType): string => {
    const labels: Record<ExerciseType, string> = {
      write_sentences: 'Write Sentences',
      fill_blank: 'Fill in the Blanks',
      email_completion: 'Email Completion',
      scenario: 'Workplace Scenario'
    };
    return labels[type] || type;
  };

  const renderExerciseContent = () => {
    if (!exercise) return null;

    const { exercise: exerciseData } = exercise;

    switch (exercise.exerciseType) {
      case 'write_sentences':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-medium text-blue-900">{exerciseData.instruction}</p>
            </div>

            {exerciseData.scenarios && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Context Suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  {exerciseData.scenarios.map((scenario: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{scenario}</li>
                  ))}
                </ul>
              </div>
            )}

            {exerciseData.example && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Example:</p>
                <p className="text-sm text-gray-700 italic">{exerciseData.example}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your 3 Sentences:</label>
              <Textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Write your 3 sentences here, one per line..."
                className="min-h-[200px]"
                disabled={isCompleted}
              />
              <p className="text-xs text-gray-500">
                Tip: Try to use the vocabulary in different professional contexts to reinforce active usage.
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{exerciseData.instruction || 'Complete the exercise below'}</p>
            <Textarea
              value={userResponse}
              onChange={(e) => setUserResponse(e.target.value)}
              placeholder="Your response..."
              className="min-h-[200px]"
              disabled={isCompleted}
            />
          </div>
        );
    }
  };

  if (!note) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Activate Your Vocabulary
            </DialogTitle>
            {vocabularyStatus && (
              <Badge variant={vocabularyStatus.status === 'active' ? 'default' : 'secondary'}>
                {vocabularyStatus.status === 'active' ? 'Active' : 'Passive'}
              </Badge>
            )}
          </div>
          <DialogDescription>
            Practice using this vocabulary to move it from passive recognition to active use.
          </DialogDescription>
        </DialogHeader>

        {/* Vocabulary Being Practiced */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 my-4">
          <p className="text-sm font-medium text-gray-500 mb-1">Vocabulary:</p>
          <p className="text-gray-900">{note.content}</p>
        </div>

        {/* Progress Bar */}
        {vocabularyStatus && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Activation Progress</span>
              <span className="font-medium text-gray-900">{vocabularyStatus.activationScore}%</span>
            </div>
            <Progress value={vocabularyStatus.activationScore} className="h-2" />
            <p className="text-xs text-gray-500">
              {vocabularyStatus.activationCount} practice{vocabularyStatus.activationCount !== 1 ? 's' : ''} completed
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Generating exercise...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Exercise Content */}
        {exercise && !isLoading && renderExerciseContent()}

        {/* Completion State */}
        {isCompleted && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Great work!</p>
              <p className="text-sm text-green-700">
                You've practiced using this vocabulary. Keep using it in real situations to make it truly active!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {exercise && !isLoading && !isCompleted && (
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmit}
              disabled={!userResponse.trim() || isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Complete Exercise
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
