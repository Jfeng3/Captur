import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DocMetadata {
  title?: string;
  version?: string;
  author?: string;
  last_updated?: string;
  [key: string]: any;
}

type DocType = 'json' | 'markdown';

export default function Docs() {
  const { '*': docPath } = useParams();
  const navigate = useNavigate();
  const [docData, setDocData] = useState<any>(null);
  const [docType, setDocType] = useState<DocType>('json');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDoc();
  }, [docPath]);

  const loadDoc = async () => {
    if (!docPath) {
      setError('No document path provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try to fetch .md file first, then fall back to .json
      let response = await fetch(`/docs/${docPath}.md`);
      let type: DocType = 'markdown';

      if (!response.ok) {
        // Try .json if .md doesn't exist
        response = await fetch(`/docs/${docPath}.json`);
        type = 'json';

        if (!response.ok) {
          throw new Error(`Document not found: ${docPath}`);
        }
      }

      setDocType(type);

      if (type === 'markdown') {
        const text = await response.text();
        setDocData(text);
      } else {
        const data = await response.json();
        setDocData(data);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const renderValue = (value: any, key?: string): JSX.Element => {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="pl-4 border-l-2 border-blue-200">
              {renderValue(item)}
            </div>
          ))}
        </div>
      );
    }

    // Handle objects
    if (typeof value === 'object') {
      return (
        <div className="space-y-4">
          {Object.entries(value).map(([k, v]) => (
            <div key={k}>
              <h4 className="font-semibold text-gray-700 capitalize mb-2">
                {k.replace(/_/g, ' ')}
              </h4>
              <div className="pl-4">{renderValue(v, k)}</div>
            </div>
          ))}
        </div>
      );
    }

    // Handle strings with special formatting
    if (typeof value === 'string') {
      // Multi-line strings
      if (value.includes('\n')) {
        return (
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {value}
          </div>
        );
      }

      // URLs
      if (value.startsWith('http://') || value.startsWith('https://')) {
        return (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {value}
          </a>
        );
      }

      // Regular strings
      return <p className="text-gray-700 leading-relaxed">{value}</p>;
    }

    // Handle primitives (numbers, booleans)
    return <span className="text-gray-700">{String(value)}</span>;
  };

  const renderSection = (key: string, value: any) => {
    // Skip metadata section as it's shown in header
    if (key === 'metadata') return null;

    // Determine heading level based on nesting
    const isTopLevel = true;
    const headingClass = isTopLevel
      ? 'text-2xl font-bold text-gray-900 mt-8 mb-4'
      : 'text-xl font-semibold text-gray-800 mt-6 mb-3';

    return (
      <section key={key} className="mb-8">
        <h2 className={headingClass}>
          {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h2>
        <div className="space-y-4">{renderValue(value, key)}</div>
      </section>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading document...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4 text-gray-900">Document Not Found</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!docData) {
    return null;
  }

  // Render markdown documents
  if (docType === 'markdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Markdown Document Card */}
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown>{docData}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-gray-600 text-sm">
            <p>Document Path: /docs/{docPath}.md</p>
          </div>
        </div>
      </div>
    );
  }

  // Render JSON documents
  const metadata: DocMetadata = docData.metadata || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Document Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-3xl">
              {metadata.title || docPath}
            </CardTitle>
            {metadata.version && (
              <div className="text-blue-100 text-sm mt-2">
                Version {metadata.version}
              </div>
            )}
            {(metadata.author || metadata.last_updated) && (
              <div className="flex gap-4 text-blue-100 text-sm mt-2">
                {metadata.author && <span>By {metadata.author}</span>}
                {metadata.last_updated && (
                  <span>Last updated: {metadata.last_updated}</span>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-8">
            <div className="prose prose-lg max-w-none">
              {Object.entries(docData)
                .filter(([key]) => key !== 'metadata')
                .map(([key, value]) => renderSection(key, value))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Document Path: /docs/{docPath}.json</p>
        </div>
      </div>
    </div>
  );
}
