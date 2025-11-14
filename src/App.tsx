import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectName, setProjectName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Create project
  const createProject = async () => {
    if (!projectName) return;
    
    const response = await fetch(`http://localhost:8000/projects?name=${encodeURIComponent(projectName)}`, {
      method: 'POST'
    });
    
    if (response.ok) {
      const project = await response.json();
      setProjects([...projects, project]);
      setProjectName('');
    }
  };

  // Upload file
  const uploadFile = async () => {
    if (!selectedFile) return;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData
    });
    
    if (response.ok) {
      alert('File uploaded successfully');
      setSelectedFile(null);
    }
  };

  // Generate AI content
  const generateContent = async (type: string) => {
    if (!prompt) return;
    
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, type })
    });
    
    if (response.ok) {
      const result = await response.json();
      alert(`Generation started: ${result.id}`);
      setPrompt('');
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold">Video Creation Studio</h1>

          {/* Create Project */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create Project</h2>
            <div className="flex gap-2">
              <Input
                placeholder="Project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />
              <Button onClick={createProject}>Create</Button>
            </div>

            {/* Project List */}
            <div className="mt-4 space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="p-2 bg-gray-100 rounded">
                  {project.name}
                </div>
              ))}
            </div>
          </Card>

          {/* Upload File */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
            <div className="flex gap-2">
              <Input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <Button onClick={uploadFile} disabled={!selectedFile}>
                Upload
              </Button>
            </div>
          </Card>

          {/* AI Generation */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">AI Generation</h2>
            <Input
              placeholder="Enter your prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={() => generateContent('image')}>
                Generate Image
              </Button>
              <Button onClick={() => generateContent('video')}>
                Generate Video
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <Analytics />
    </>
  );
}

export default App;