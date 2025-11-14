import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './contexts/AuthContext'
import Flashcard from './pages/Flashcard.tsx'
import Notes from './pages/Notes.tsx'
import Landing from './pages/Landing.tsx'
import LandingZhCN from './pages/LandingZhCN.tsx'
import LandingZhTW from './pages/LandingZhTW.tsx'
import LandingFr from './pages/LandingFr.tsx'
import Privacy from './pages/Privacy.tsx'
import Research from './pages/Research.tsx'
import RunWorkflow from './pages/RunWorkflow.tsx'
import Docs from './pages/Docs.tsx'
import Complaint from './pages/Complaint.tsx'
import AuthCallback from './pages/AuthCallback.tsx'
import Dashboard from './pages/Dashboard.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/zh-CN" element={<LandingZhCN />} />
        <Route path="/zh-TW" element={<LandingZhTW />} />
        <Route path="/fr" element={<LandingFr />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flashcards" element={<Flashcard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/research" element={<Research />} />
        <Route path="/n8n" element={<RunWorkflow />} />
        <Route path="/docs/*" element={<Docs />} />
        <Route path="/complaint" element={<Complaint />} />
      </Routes>
      <Analytics />
    </AuthProvider>
  </BrowserRouter>
);
