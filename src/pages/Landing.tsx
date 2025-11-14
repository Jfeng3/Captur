import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Clock,
  Brain,
  Heart,
  X,
  Check,
  Zap,
  BookOpen,
  Volume2,
  FolderOpen,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Star,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { UserProfile } from '../components/UserProfile';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check if coming from extension
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // If ?auth=login parameter exists, show auth modal immediately
    if (params.get('auth') === 'login') {
      console.log('🔐 Auth requested from extension');
      setShowAuthModal(true);

      // Store flag that we came from extension
      if (params.get('source') === 'extension') {
        sessionStorage.setItem('authSource', 'extension');
      }
    }
  }, []);

  const handleLoginClick = () => {
    console.log('Login button clicked');
    setShowAuthModal(true);
    console.log('showAuthModal set to:', true);
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="fixed inset-0 z-0 opacity-30"
        style={{
          backgroundImage: "url(/watercolor-background.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="relative z-10">
        {/* Header Navigation */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              Captur
            </a>
            <div className="hidden md:flex items-center space-x-8">
              <Button variant="ghost" size="sm" asChild>
                <a href="#how-it-works">Features</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#benefits">Benefits</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#testimonials">Testimonials</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/complaint">Feedback</a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <UserProfile />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoginClick}
                  className="whitespace-nowrap"
                >
                  Log In
                </Button>
              )}
              <Button size="sm" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Download Extension</a>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-6 text-sm">
                For ESL Students & Professionals
              </Badge>
              <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Build Vocabulary from Content You Love
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Turn your favorite YouTube videos, articles, and blogs into systematic vocabulary learning. Click to save as flashcard.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                    Start Building Your Vocabulary
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
              <div className="mt-12">
                <Card className="overflow-hidden border-2">
                  <div className="bg-muted p-8">
                    <video
                      src="/product_demo.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      controls
                      className="rounded-lg shadow-2xl w-full"
                      aria-label="Captur demo video showing vocabulary capture from websites"
                      onLoadedMetadata={(e) => {
                        // Ensure autoplay works on all browsers
                        const video = e.currentTarget;
                        video.play().catch((err) => {
                          console.log('Autoplay prevented:', err);
                        });
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Your Vocabulary Isn't Growing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                You consume 10+ hours of English content weekly—YouTube, articles, podcasts—but vocabulary growth doesn't match time invested
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Dictionary Lookup Kills Flow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Pausing to look up words breaks immersion. Switching between content → dictionary → notes wastes 15+ minutes per hour.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Manual Tracking is Tedious</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Writing words in notebooks takes 2-3 minutes per word. Creating flashcards manually is even slower—friction kills consistency.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">No Systematic Review</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Without spaced repetition, you forget 90% of new words within a week. Your favorite content becomes wasted learning opportunities.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Why Current Solutions Fail
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Existing tools either help you look up words OR save them OR review them—but never create a seamless learn-from-content workflow
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {/* Flashcard Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">Flashcard Apps (Anki, Quizlet)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Creating cards manually is tedious (3-5 minutes per word)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Disconnected from your actual content consumption</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Can't capture while watching YouTube or reading articles</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Language Learning Apps */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">Language Apps (Duolingo, Babbel)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Generic vocabulary lists—not personalized to your interests</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Can't learn from YOUR favorite YouTube channels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Boring compared to content you actually enjoy</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Dictionary Extensions */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">Dictionary Extensions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No saving or review system—look up same word repeatedly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Doesn't help with retention—instant lookup then forget</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No spaced repetition or systematic review</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Manual Notebooks */}
              <Card>
                <CardHeader>
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                    <FolderOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl text-center">Notebooks & Google Docs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Extremely tedious—breaks flow every time you encounter new word</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">No spaced repetition—just static lists never reviewed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Lists pile up but don't turn into retained vocabulary</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Can't practice pronunciation or recall</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <X className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">Capture without practice doesn't build fluency</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            <div className="mt-12 text-center">
              <p className="text-lg font-semibold text-foreground">
                You can't outsource credibility. Build internalized fluency that AI can't give you.
              </p>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section id="how-it-works" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                How It Works
              </Badge>
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Build Vocabulary from Content You Love
              </h2>
              <p className="mt-4 text-xl text-primary">Capture terms from favorite YouTubers, blogs, topics you're passionate about. 30x faster translation. 600x faster flashcard creation.</p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 1: Partial Translation - Image Left, Text Right */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/hover-translate-demo.png"
                    alt="Hover to translate difficult words only"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Hover to Translate (Difficult Words Only)</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Select any word → hover over teal dot</li>
                    <li>• Instant inline translation appears</li>
                    <li>• Only difficult words are highlighted</li>
                    <li>• Stay in the language context while learning</li>
                    <li>• 30x faster than dictionary lookup</li>
                  </ul>
                </div>
              </div>

              {/* Feature 2: One-Click Save + Spaced Repetition - Text Left, Image Right */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">One-Click Save + Spaced Repetition</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Click vocabulary button → green checkmark</li>
                    <li>• Word saved to flashcards instantly</li>
                    <li>• Review at optimal intervals: 1d, 3d, 1w, 2w, 1m</li>
                    <li>• 600x faster than manual card creation</li>
                    <li>• 80%+ retention guaranteed</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/flashcard-save-demo.png"
                    alt="One-click save with spaced repetition"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Feature 3: YouTube Transcript + Key Takeaways - Image Left, Text Right */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/youtube-transscript-demo3.png"
                    alt="YouTube transcript with key takeaways"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">YouTube Transcript + Key Takeaways</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Watch video + read synchronized transcript</li>
                    <li>• Auto-highlighted difficult words</li>
                    <li>• "Key Takeaways" extracts 10-15 challenging terms</li>
                    <li>• Save any word as flashcard instantly</li>
                  </ul>
                </div>
              </div>

              {/* Feature 4: Sticky Notes on Any Webpage - Text Left, Image Right */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-2xl font-semibold mb-4">Sticky Notes on Any Webpage</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• Attach notes, reflections, and key takeaways</li>
                    <li>• Works on any webpage you visit</li>
                    <li>• Vocabulary and insights stay with content</li>
                    <li>• Return anytime to review in original context</li>
                  </ul>
                </div>
                <div className="order-1 lg:order-2">
                  <img
                    src="/sticky-note-demo.png"
                    alt="Sticky notes attached to webpages"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>

              {/* Feature 5: Key Takeaways with Custom Prompts - Image Left, Text Right */}
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                <div>
                  <img
                    src="/key-takeaways.png"
                    alt="Key Takeaways feature with custom prompts"
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-4">Key Takeaways with Custom Prompts</h3>
                  <ul className="space-y-3 text-lg text-muted-foreground">
                    <li>• AI extracts key insights from any article or video</li>
                    <li>• Save important quotes to "Marked" sentences</li>
                    <li>• Write reflections and personal notes</li>
                    <li>• Organize all insights in one floating widget</li>
                    <li>• Works seamlessly on any webpage you visit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Learn Smarter, Not Harder
              </h2>
            </div>
            <div className="mt-12 grid gap-12 text-center sm:grid-cols-3">
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Zap className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">30x Faster Lookup</h3>
                <p className="mt-2 text-muted-foreground">
                  Traditional dictionary: 15-20 seconds per word. Hover to translate: 0.5 seconds. Zero context switching, zero interruption.
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">80% Retention</h3>
                <p className="mt-2 text-muted-foreground">
                  Spaced repetition increases long-term retention from 10% to 80%+ after 30 days. Visual buttons create stronger memory associations.
                </p>
              </div>
              <div>
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/20">
                  <Volume2 className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Learn from Topics You Love</h3>
                <p className="mt-2 text-muted-foreground">
                  Build vocabulary from content you actually enjoy. Tech videos, business articles, hobby blogs, entertainment content—whatever matches your interests. Not generic word lists.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="testimonials" className="px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                What English Learners Say
              </h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Maria"
                      alt="Maria Kim"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">Maria Kim</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "Captur has been a game-changer for my IELTS prep. I can finally remember all the academic words I need!"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=James"
                      alt="James Chen"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">James Chen</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "The browser extension is pure genius. I capture words while reading articles and they're automatically added to my study list. So easy!"
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                      alt="Sarah Park"
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <CardTitle className="text-base">Sarah Park</CardTitle>
                      <div className="flex text-yellow-500">
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    "I've tried many apps, but this is the first one that actually works. The spaced repetition system is incredibly effective."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-muted px-6 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Frequently Asked Questions
              </h2>
            </div>
            <div className="mt-12 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How is this different from Anki?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anki requires manual flashcard creation and shows isolated words. Captur captures words
                    instantly with full context preserved, and includes pronunciation practice. No manual card creation
                    needed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need to install anything?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You need to install the Chrome browser extension. Once installed, you can use hover-to-translate,
                    one-click save, and AI assistance features on any webpage. All data automatically syncs to captur.academy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I use this on mobile?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! Captur is fully responsive and works on all devices. Capture vocabulary on your
                    phone while reading, then review on your desktop.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How does pronunciation practice work?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Click any saved word or sentence to hear it read aloud using text-to-speech technology. Practice as
                    many times as you need to build confidence.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's the 300-word limit?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Each note can contain up to 300 words to keep your vocabulary organized by theme or topic. This
                    prevents overwhelming lists and encourages focused review sessions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">Choose the plan that's right for your learning goals.</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
              <Card className="w-full lg:w-1/3 border-border">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    $0<span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Up to 100 words</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Basic Spaced Repetition</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Browser Extension</span>
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Download Free</a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="w-full lg:w-1/3 border-2 border-primary shadow-2xl relative">
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Most Popular</Badge>
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                  <div className="text-4xl font-bold my-4 text-foreground">
                    $7<span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4 my-8">
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Unlimited Words</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Advanced Spaced Repetition</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Full Context & Examples</span>
                    </li>
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">Advanced Progress Tracking</span>
                    </li>
                  </ul>
                  <Button className="w-full" asChild>
                    <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">Go Pro</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="bg-muted px-6 py-20 sm:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Build Vocabulary from Content You Love
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Stop wasting time on boring language apps with generic word lists. Turn your favorite YouTube videos, articles, and blogs into systematic vocabulary learning. Click to save as flashcard—with zero manual effort.
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-lg" asChild>
                <a href="https://chromewebstore.google.com/detail/captur/lnekkglefccomljmeholclnllpijhdlc?hl=en-US" target="_blank" rel="noopener noreferrer">
                  Start Building Your Vocabulary Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>30x faster translation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>600x faster flashcard creation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" />
                <span>Works on YouTube, articles, blogs</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-background">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-bold text-primary">Captur</p>
                <p className="text-sm text-muted-foreground">Capture vocabulary. Build fluency.</p>
              </div>
              <div className="flex space-x-6 text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">Blog</a>
                <a href="#" className="hover:text-primary transition-colors">Contact</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms</a>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center">
              <div className="mb-4 flex justify-center gap-4 text-sm text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors font-semibold">English</a>
                <span>•</span>
                <a href="/fr" className="hover:text-primary transition-colors">Français</a>
                <span>•</span>
                <a href="/zh-CN" className="hover:text-primary transition-colors">简体中文</a>
                <span>•</span>
                <a href="/zh-TW" className="hover:text-primary transition-colors">繁體中文</a>
              </div>
              <p className="text-sm text-muted-foreground">© 2025 Captur. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}
