# Daily Notes Writer

A minimal React application for content creators to write and manage daily notes with AI assistance.

## Overview

Daily Notes Writer helps content creators capture, refine, and organize their thoughts through:
- **Two-stage workflow**: Draft → Ready to Post
- **AI-powered assistance**: Rephrasing, feedback, and phrase suggestions  
- **Voice transcription**: Convert speech to text
- **Weekly focus tags**: Organize notes by weekly themes
- **300-word limit**: Keep notes concise and focused

## Quick Start

### Option 1: Single Command (Recommended)
```bash
pnpm install
pnpm dev:backend
```
Access your app at: **http://localhost:3000**

### Option 2: Separate Processes
```bash
# Terminal 1: Backend
pnpm dev:backend

# Terminal 2: Frontend  
pnpm dev
```
Access your app at: **http://localhost:8080**

## Development Environment

### How It Works

Your webapp has **two parts** working together:

1. **Frontend (React App)**: User interface in `src/` folder
2. **Backend (API Functions)**: Server logic in `api/` folder

### CLI Commands

| Command | What It Does | Port |
|---------|--------------|------|
| `pnpm dev:backend` | Runs both frontend & backend together | 3000 |
| `pnpm dev` | Runs frontend only with proxy | 8080 |
| `pnpm build` | Builds frontend for production | - |
| `pnpm deploy` | Deploys to Vercel | - |

### Request Flow

**Single Process (Port 3000):**
```
Browser → http://localhost:3000 → Vercel Dev Server
                                      ↓
                    Frontend (React) OR API Function
```

**Separate Processes:**
```
Browser → http://localhost:8080 → Vite Dev Server
                                      ↓
        Frontend (React) OR Proxy to port 3000
                                      ↓
                              Vercel Functions
```

### File Compilation

- **Frontend** (`src/*.tsx`): Vite compiles → Browser
- **Backend** (`api/*.ts`): Vercel compiles → Node.js

### API Requests Example
```javascript
// In React component
fetch('/api/rephrase', {
  method: 'POST', 
  body: JSON.stringify({ content: 'text to rephrase' })
})
```

## Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React + Vite + TypeScript | User interface |
| Backend | Vercel Functions + Node.js | API endpoints |
| Database | Supabase (PostgreSQL) | Data storage |
| AI | OpenAI GPT-4 | Text processing |
| Styling | Tailwind CSS + shadcn/ui | UI components |
| State | Zustand | Global state management |
| Deployment | Vercel | Hosting platform |

## Features

- ✅ **Note Management** - Create, edit, organize notes
- ✅ **AI Rephrasing** - Improve text with conversational tone
- ✅ **Voice Transcription** - Speech-to-text conversion
- ✅ **AI Feedback** - Get writing suggestions and scores
- ✅ **Phrase Bank** - Smart phrase improvement suggestions
- ✅ **Weekly Tags** - Focus themes for organization
- ✅ **Two-stage Workflow** - Draft and Ready to Post columns
- ✅ **Word Count Tracking** - 300-word limit enforcement
- ✅ **Chrome Extension** - Capture notes from any webpage

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/rephrase` | POST | Rephrase text with AI |
| `/api/critic` | POST | Get writing feedback |
| `/api/phrase-bank` | POST | Get phrase suggestions |
| `/api/transcribe` | POST | Convert audio to text |
| `/api/notes` | POST | Save notes from Chrome extension |

## Testing

All tests are organized in the `tests/` directory:

```bash
# Run all integration tests
pnpm test

# Run specific tests
pnpm test:api          # Test local API
pnpm test:prod         # Test production API
pnpm test:rephrase     # Test rephrase flow
pnpm test:openai       # Test OpenAI configuration
```

See [tests/README.md](tests/README.md) for detailed testing documentation.

## Environment Setup

Create `.env.local` file:
```env
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
```bash
# Generate database schema
pnpm db:generate

# Push schema to Supabase
pnpm db:push

# Open database studio
pnpm db:studio
```

## Architecture

### Module System
- **ESM**: Uses `"type": "module"` in package.json
- **Node.js Resolution**: TypeScript configured with `"moduleResolution": "NodeNext"`
- **Import Extensions**: API files use `.js` extensions for Node.js compatibility

### State Management
- **Zustand Store**: `src/stores/notesStore.ts` manages all application state
- **Pessimistic Updates**: Waits for database confirmation before UI updates
- **No Real-time**: Doesn't listen for external database changes

### Data Flow
```
React Components → API Functions → Supabase Database → UI Updates
```

## Chrome Extension

### Development

The Chrome extension allows users to capture notes from any webpage.

```bash
# Install dependencies
cd chrome-extension
pnpm install

# Build extension
pnpm build

# Development mode
pnpm dev
```

### Features

- **Quick Capture**: Save selected text via right-click context menu
- **Keyboard Shortcut**: Ctrl/Cmd + Shift + S to save selection
- **Popup Interface**: Click extension icon to write notes
- **Auto-capture**: Automatically captures selected text

### Installation (Development)

1. Build the extension: `cd chrome-extension && pnpm build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the `chrome-extension/dist` folder

### Publishing to Chrome Web Store

1. **Prepare Assets**:
   - Create icon files: 16x16, 48x48, 128x128 PNG
   - Take screenshots: 1280x800 or 640x400
   - Create promotional images if needed

2. **Update Configuration**:
   - Set production API URL in `chrome-extension/src/config.ts`
   - Update version in `manifest.json`
   - Build production version: `pnpm build`

3. **Create ZIP Package**:
   ```bash
   cd chrome-extension/dist
   zip -r ../daily-notes-writer-extension.zip .
   ```

4. **Submit to Chrome Web Store**:
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - Pay one-time developer fee ($5)
   - Click "New Item"
   - Upload ZIP file
   - Fill in:
     - Store listing (description, category, language)
     - Screenshots and promotional images
     - Privacy policy URL
     - Single purpose description
   - Submit for review

5. **Review Process**:
   - Usually takes 1-3 business days
   - Fix any policy violations if rejected
   - Once approved, extension will be live

### Extension Configuration

Update `chrome-extension/src/config.ts`:
```typescript
const PROD_API_URL = 'https://your-app.vercel.app';
```

## Development Guidelines

1. **Keep it simple** - Minimal changes, no over-engineering
2. **300-word limit** - Enforce concise content
3. **Two-stage workflow** - Draft → Ready to Post
4. **AI enhancement** - Improve but preserve user voice
5. **Weekly focus** - Use tags for organization

## Deployment

```bash
# Deploy to production
pnpm deploy
```

**What happens:**
1. Vercel builds React frontend → Static files on CDN
2. Vercel compiles TypeScript API functions → Serverless functions  
3. Everything served from one domain: `yourapp.vercel.app`

## Troubleshooting

### Common Issues

**Module not found errors:**
- API functions need `.js` extensions in imports
- Frontend files don't need extensions (bundled by Vite)

**Port conflicts:**
- Use `pnpm dev:backend` for single process
- Or run separate processes on different ports

**Build failures:**
- Check TypeScript compilation: `pnpm build`
- Verify environment variables are set

### Development Tips

- Use `pnpm dev:backend` for simplest setup
- API functions run in Node.js, need proper ESM imports
- Frontend uses Vite bundling, more flexible imports
- Check `ai_docs/discussions/` for detailed technical notes

That's it! Simple, focused, and ready for content creation.