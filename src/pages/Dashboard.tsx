import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/db';
import { UserProfile } from '@/components/UserProfile';
import {
  BookOpen,
  Brain,
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  Zap,
  Calendar,
  LayoutDashboard,
  FileText,
} from 'lucide-react';

interface DashboardStats {
  totalWords: number;
  wordsReviewed: number;
  wordsToReview: number;
  notesCreated: number;
  studyStreak: number;
  weeklyProgress: number;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState<DashboardStats>({
    totalWords: 0,
    wordsReviewed: 0,
    wordsToReview: 0,
    notesCreated: 0,
    studyStreak: 0,
    weeklyProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch total flashcards
        const { count: totalFlashcards } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch reviewed flashcards (those with review_count > 0)
        const { count: reviewedFlashcards } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gt('review_count', 0);

        // Fetch flashcards due for review (next_review_at is in the past or null)
        const { count: dueFlashcards } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .or(`next_review_at.is.null,next_review_at.lte.${new Date().toISOString()}`);

        // Fetch total notes
        const { count: totalNotes } = await supabase
          .from('writing_notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Calculate weekly progress (flashcards reviewed this week)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: weeklyReviewed } = await supabase
          .from('flashcards')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('last_reviewed_at', oneWeekAgo.toISOString());

        setStats({
          totalWords: totalFlashcards || 0,
          wordsReviewed: reviewedFlashcards || 0,
          wordsToReview: dueFlashcards || 0,
          notesCreated: totalNotes || 0,
          studyStreak: 7, // Placeholder - would need more complex calculation
          weeklyProgress: Math.round(((weeklyReviewed || 0) / Math.max(totalFlashcards || 1, 1)) * 100),
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = stats.totalWords > 0
    ? Math.round((stats.wordsReviewed / stats.totalWords) * 100)
    : 0;

  return (
    <div className="relative min-h-screen bg-background">
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

      {/* Content Layer */}
      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <a href="/" className="text-xl font-bold text-primary">
                  Captur
                </a>
                <nav className="hidden md:flex items-center gap-1">
                  <Button
                    variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant={location.pathname === '/flashcards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/flashcards')}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Flashcards
                  </Button>
                  <Button
                    variant={location.pathname === '/notes' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/notes')}
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Notes
                  </Button>
                  <Button
                    variant={location.pathname === '/complaint' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate('/complaint')}
                    className="gap-2"
                  >
                    Feedback
                  </Button>
                </nav>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Learning Dashboard</h1>
          <p className="text-lg text-muted-foreground">Track your vocabulary progress and achievements</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Words */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Words</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalWords}</div>
              <p className="text-xs text-muted-foreground mt-1">Words captured</p>
            </CardContent>
          </Card>

          {/* Words Reviewed */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Reviewed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.wordsReviewed}</div>
              <p className="text-xs text-muted-foreground mt-1">{progressPercentage}% mastered</p>
            </CardContent>
          </Card>

          {/* Due for Review */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.wordsToReview}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready to review</p>
            </CardContent>
          </Card>

          {/* Study Streak */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Study Streak</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.studyStreak}</div>
              <p className="text-xs text-muted-foreground mt-1">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Overall Progress */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Overall Progress
              </CardTitle>
              <CardDescription>Your vocabulary mastery journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Words Mastered</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.wordsReviewed} / {stats.totalWords}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {progressPercentage}% of your vocabulary is mastered
                </p>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Weekly Goal</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.weeklyProgress}%
                  </span>
                </div>
                <Progress value={stats.weeklyProgress} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Keep up the great work!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="default"
                onClick={() => navigate('/flashcards')}
              >
                <Brain className="mr-2 h-4 w-4" />
                Review Flashcards ({stats.wordsToReview})
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/notes')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                View Notes ({stats.notesCreated})
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => window.open('https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc', '_blank')}
              >
                <Zap className="mr-2 h-4 w-4" />
                Capture New Words
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your learning activity this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.notesCreated > 0 ? (
                <>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Created {stats.notesCreated} notes</p>
                      <p className="text-sm text-muted-foreground">Keep capturing your learning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Reviewed {stats.wordsReviewed} words</p>
                      <p className="text-sm text-muted-foreground">Great progress this week!</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">Start your learning journey</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Install the Chrome extension to capture your first words
                  </p>
                  <Button onClick={() => window.open('https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc', '_blank')}>
                    Get Chrome Extension
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
