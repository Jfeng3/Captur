import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Play, RefreshCw, CheckCircle2, AlertCircle, Webhook, MessageCircle, Clock, Mail, FileText, MousePointer } from 'lucide-react';

interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  triggerType?: 'webhook' | 'chat' | 'manual' | 'schedule' | 'email' | 'form' | 'other';
  triggerName?: string;
}

interface ExecutionResult {
  success: boolean;
  workflowId: string;
  executionId?: string;
  message?: string;
}

export default function RunWorkflow() {
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [executionResults, setExecutionResults] = useState<Record<string, ExecutionResult>>({});

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/n8n-workflows');

      if (!response.ok) {
        throw new Error(`Failed to load workflows: ${response.statusText}`);
      }

      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workflows');
      console.error('Load workflows error:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string, workflowName: string) => {
    setExecuting(workflowId);
    setError(null);

    try {
      const response = await fetch('/api/n8n-workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflowId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to execute workflow: ${response.statusText}`);
      }

      const result = await response.json();

      setExecutionResults((prev) => ({
        ...prev,
        [workflowId]: {
          success: true,
          workflowId,
          executionId: result.executionId || result.id,
          message: `Workflow "${workflowName}" executed successfully`,
        },
      }));

      // Clear success message after 5 seconds
      setTimeout(() => {
        setExecutionResults((prev) => {
          const updated = { ...prev };
          delete updated[workflowId];
          return updated;
        });
      }, 5000);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Execution failed';
      setExecutionResults((prev) => ({
        ...prev,
        [workflowId]: {
          success: false,
          workflowId,
          message: errorMessage,
        },
      }));
      console.error('Execute workflow error:', err);
    } finally {
      setExecuting(null);
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    const iconProps = { className: "h-5 w-5 shrink-0" };

    switch (triggerType) {
      case 'webhook':
        return <Webhook {...iconProps} className="h-5 w-5 shrink-0 text-blue-600" />;
      case 'chat':
        return <MessageCircle {...iconProps} className="h-5 w-5 shrink-0 text-green-600" />;
      case 'manual':
        return <MousePointer {...iconProps} className="h-5 w-5 shrink-0 text-purple-600" />;
      case 'schedule':
        return <Clock {...iconProps} className="h-5 w-5 shrink-0 text-orange-600" />;
      case 'email':
        return <Mail {...iconProps} className="h-5 w-5 shrink-0 text-red-600" />;
      case 'form':
        return <FileText {...iconProps} className="h-5 w-5 shrink-0 text-indigo-600" />;
      default:
        return <Play {...iconProps} className="h-5 w-5 shrink-0 text-gray-600" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    const labels: Record<string, string> = {
      webhook: 'Webhook Trigger',
      chat: 'Chat Message',
      manual: 'Manual Click',
      schedule: 'Scheduled',
      email: 'Email Trigger',
      form: 'Form Submission',
      other: 'Other Trigger',
    };
    return labels[triggerType] || 'Unknown Trigger';
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
            <a href="/research" className="text-sm text-muted-foreground hover:text-primary">
              Research
            </a>
            <a href="/n8n" className="text-sm font-semibold text-primary">
              n8n
            </a>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">n8n Workflows</h1>
            <p className="text-muted-foreground">
              Manage and execute your n8n automation workflows
            </p>
          </div>
          <Button
            onClick={loadWorkflows}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <p className="text-destructive">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && !workflows.length && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Workflows List */}
        {!loading && workflows.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No workflows found. Make sure your n8n instance is running and API key is configured.
              </p>
            </CardContent>
          </Card>
        )}

        {workflows.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => {
              const executionResult = executionResults[workflow.id];
              const isExecuting = executing === workflow.id;

              return (
                <Card key={workflow.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {workflow.active ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Trigger Type */}
                    {workflow.triggerType && (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        {getTriggerIcon(workflow.triggerType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">
                            {getTriggerLabel(workflow.triggerType)}
                          </p>
                          {workflow.triggerName && (
                            <p className="text-xs text-muted-foreground truncate">
                              {workflow.triggerName}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Workflow Info */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>ID: {workflow.id}</p>
                      {workflow.tags && workflow.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {workflow.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Execution Result */}
                    {executionResult && (
                      <div
                        className={`flex items-start gap-2 p-3 rounded-md ${
                          executionResult.success
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        {executionResult.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs ${
                              executionResult.success ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {executionResult.message}
                          </p>
                          {executionResult.executionId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Execution ID: {executionResult.executionId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Execute Button */}
                    <Button
                      onClick={() => executeWorkflow(workflow.id, workflow.name)}
                      disabled={isExecuting || !workflow.active}
                      className="w-full gap-2"
                      variant={workflow.active ? 'default' : 'secondary'}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4" />
                          Execute Workflow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Setup Instructions */}
        {!loading && workflows.length === 0 && !error && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Configure Environment Variables</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add these to your Vercel environment variables or local .env file:
                </p>
                <pre className="bg-muted p-3 rounded-md text-xs">
                  N8N_URL=https://your-n8n-instance.com{'\n'}
                  N8N_API_KEY=your_api_key_here
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2. Get Your n8n API Key</h3>
                <p className="text-sm text-muted-foreground">
                  In your n8n instance, go to Settings → API → Generate API Key
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3. Enable API Access</h3>
                <p className="text-sm text-muted-foreground">
                  Make sure your n8n instance has the public API enabled in settings
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-semibold mb-2">Need Help?</p>
                <p className="text-xs text-muted-foreground">
                  Check the n8n documentation at{' '}
                  <a
                    href="https://docs.n8n.io/api/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    docs.n8n.io/api
                  </a>
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
