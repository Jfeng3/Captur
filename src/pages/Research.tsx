import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Search, Copy, CheckCircle2 } from 'lucide-react';

interface ResearchResult {
  topic: string;
  insights: string[];
  sources: string[];
  timestamp: string;
}

interface ResearchOutput {
  date: string;
  researchResults: ResearchResult[];
  postIdeas: string[];
  totalTopics: number;
  totalPosts: number;
}

export default function Research() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResearchOutput | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runResearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/research-agent', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Failed to run research: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run research');
      console.error('Research error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyPost = async (post: string, index: number) => {
    await navigator.clipboard.writeText(post);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-bold text-primary">
            Captur
          </a>
          <div className="flex items-center gap-4">
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">
              Home
            </a>
            <a href="/research" className="text-sm font-semibold text-primary">
              Research
            </a>
            <a href="/n8n" className="text-sm text-muted-foreground hover:text-primary">
              n8n
            </a>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Daily Research Agent</h1>
          <p className="text-muted-foreground">
            Discover trending topics and generate X post ideas automatically
          </p>
        </div>

        {/* Run Research Button */}
        <div className="mb-8">
          <Button
            onClick={runResearch}
            disabled={loading}
            size="lg"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Run Research Now
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            This runs automatically every day at 9 AM UTC
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-8">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Research Summary - {results.date}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Topics Researched</p>
                    <p className="text-3xl font-bold">{results.totalTopics}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Posts Generated</p>
                    <p className="text-3xl font-bold">{results.totalPosts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Research Insights */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Research Insights</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {results.researchResults.map((result, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">{result.topic}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold mb-2">Insights:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {result.insights.map((insight, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {result.sources.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold mb-1">Sources:</p>
                          <p className="text-xs text-muted-foreground">
                            {result.sources.join(', ')}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* X Post Ideas */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">X Post Ideas</h2>
              <div className="space-y-3">
                {results.postIdeas.map((post, index) => (
                  <Card key={index} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm flex-1">{post}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyPost(post, index)}
                          className="shrink-0"
                        >
                          {copiedIndex === index ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {post.length} characters
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!results && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Automated Daily Research</h3>
                <p className="text-sm text-muted-foreground">
                  The research agent runs every day at 9 AM UTC, searching for trending topics
                  related to ESL learning, professional English, and vocabulary building.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Research Topics</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Latest ESL learning trends</li>
                  <li>Professional English vocabulary challenges</li>
                  <li>Career advancement English tips</li>
                  <li>Interview preparation expressions</li>
                  <li>Business English communication trends</li>
                  <li>LinkedIn professional writing tips</li>
                  <li>Non-native speaker career stories</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Generated Content</h3>
                <p className="text-sm text-muted-foreground">
                  Based on the research, the agent generates 10 ready-to-post X (Twitter) ideas
                  that resonate with your target audience of ESL professionals.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Click "Run Research Now" to test</p>
                <p className="text-xs text-muted-foreground">
                  The agent typically takes 30-60 seconds to complete research and generate posts.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background mt-16">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Captur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
