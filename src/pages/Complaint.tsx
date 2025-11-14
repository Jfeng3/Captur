import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { MessageSquare, Send, CheckCircle2, AlertCircle, Mail, User, Calendar, Filter, Loader2 } from 'lucide-react';
import { supabase } from '../lib/db';

interface Feedback {
  id: string;
  name: string | null;
  email: string | null;
  feedback: string;
  created_at: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature_request' | 'complaint' | 'compliment' | 'other';
  user_agent: string | null;
  notes: string | null;
}

export default function Complaint() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allFeedback, setAllFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Fetch all feedback on component mount
  useEffect(() => {
    fetchAllFeedback();
  }, []);

  const fetchAllFeedback = async () => {
    try {
      setIsLoading(true);
      const { data, error: fetchError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setAllFeedback(data || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Submit to Supabase
      const { error: submitError } = await supabase
        .from('feedback')
        .insert([
          {
            name: name.trim() || null,
            email: email.trim() || null,
            feedback: feedback.trim(),
            user_agent: navigator.userAgent,
            category: 'other', // Default category
          }
        ]);

      if (submitError) {
        throw submitError;
      }

      setIsSubmitted(true);

      // Refresh feedback list
      fetchAllFeedback();

      // Reset form after 3 seconds
      setTimeout(() => {
        setName('');
        setEmail('');
        setFeedback('');
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again or email us at support@captur.academy');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter feedback based on status and category
  const filteredFeedback = allFeedback.filter(item => {
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'medium': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'high': return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'urgent': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bug': return 'bg-red-50 text-red-700 border-red-200';
      case 'feature_request': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'complaint': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'compliment': return 'bg-green-50 text-green-700 border-green-200';
      case 'other': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
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
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
          <nav className="mx-auto max-w-7xl px-6 py-4 flex justify-between items-center">
            <a href="/" className="text-2xl font-bold text-primary">
              Captur
            </a>
            <Button variant="ghost" size="sm" asChild>
              <a href="/">Back to Home</a>
            </Button>
          </nav>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center mb-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              We'd Love Your Feedback
            </h1>
            <p className="text-lg text-muted-foreground">
              Help us improve Captur by sharing your thoughts, suggestions, or reporting issues.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Form Section */}
            <div className="lg:col-span-1">
              <Card className="border-2 sticky top-24">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Your feedback is valuable to us.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {isSubmitted ? (
                    <div className="py-12 text-center">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        Thank You!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your feedback has been submitted.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name (Optional)</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback">
                          Your Feedback <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                          id="feedback"
                          placeholder="Tell us what's on your mind..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          required
                          rows={6}
                          className="resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isSubmitting || !feedback.trim()}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="animate-pulse">Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Feedback
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* All Feedback Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">All Feedback</h2>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm bg-background"
                  >
                    <option value="all">All Categories</option>
                    <option value="bug">Bug</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="complaint">Complaint</option>
                    <option value="compliment">Compliment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <p className="text-sm text-muted-foreground">
                  Showing {filteredFeedback.length} of {allFeedback.length} feedback items
                </p>
              </div>

              {/* Feedback Cards */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredFeedback.length === 0 ? (
                <Card className="border-2">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No feedback found.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.map((item) => (
                    <Card key={item.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {item.name && (
                                <div className="flex items-center gap-1 text-sm">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-medium">{item.name}</span>
                                </div>
                              )}
                              {item.email && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span>{item.email}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(item.created_at)}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(item.status)}`}>
                              {item.status.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(item.category)}`}>
                              {item.category.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground whitespace-pre-wrap">{item.feedback}</p>
                        {item.notes && (
                          <div className="mt-4 p-3 bg-muted/50 rounded-md">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Internal Notes:</p>
                            <p className="text-sm text-foreground">{item.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t bg-background mt-16">
          <div className="mx-auto max-w-7xl px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-lg font-bold text-primary">Captur</p>
                <p className="text-sm text-muted-foreground">Capture vocabulary. Build fluency.</p>
              </div>
              <div className="flex space-x-6 text-muted-foreground">
                <a href="/" className="hover:text-primary transition-colors">Home</a>
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                <a href="mailto:support@captur.academy" className="hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 border-t pt-6 text-center">
              <p className="text-sm text-muted-foreground">© 2024 Captur. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
