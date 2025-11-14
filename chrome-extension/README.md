# Captur Chrome Extension - Developer Setup

Chrome extension for capturing vocabulary and expressions from web pages.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Chrome browser

## Project Structure

```
chrome-extension/
├── src/
│   ├── background/         # Service worker (background script)
│   ├── content/           # Content scripts (runs on web pages)
│   │   └── matches/all/   # Scripts for all URLs
│   ├── popup/             # Extension popup UI (React)
│   ├── lib/               # Shared utilities (auth, supabase)
│   └── components/        # Shared React components
├── public/                # Static assets (icons, popup.html)
├── dist/                  # Build output (gitignored)
└── manifest.json          # Extension manifest
```

## Setup

1. **Install dependencies**
   ```bash
   cd chrome-extension
   pnpm install
   ```

2. **Build the extension**
   ```bash
   pnpm build
   ```
   This creates a `dist/` folder with the compiled extension.

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `chrome-extension/dist` folder

## Development

### Watch mode
```bash
pnpm dev
```
Watches for file changes and rebuilds automatically. You'll need to click "Reload" on `chrome://extensions/` after changes.

### Build commands
- `pnpm dev` - Watch mode (development)
- `pnpm build` - Production build
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI

## Key Files

- **`manifest.json`** - Extension configuration (permissions, scripts)
- **`src/background/index.ts`** - Background service worker
- **`src/content/matches/all/index.ts`** - Content script entry point
- **`src/popup/SimplePopup.tsx`** - Popup UI
- **`src/lib/supabase.ts`** - Supabase client setup
- **`src/lib/auth.ts`** - Authentication utilities

## Environment

The extension connects to:
- **Production**: `https://www.captur.academy`
- **Local dev**: `http://localhost:5173` (web app dev server)

These are configured in `manifest.json` under `externally_connectable`.

## Manifest V3

This extension uses Manifest V3:
- Service worker instead of background page
- `chrome.scripting` API for dynamic scripts
- Promises-based Chrome APIs

## Testing

Run unit tests:
```bash
pnpm test
```

## Troubleshooting

**Extension not loading?**
- Check for errors in `chrome://extensions/`
- Ensure `dist/` folder exists after build
- Verify all required files are in `dist/`

**Changes not showing?**
- Click "Reload" on the extension card in `chrome://extensions/`
- Hard refresh the webpage (Cmd+Shift+R / Ctrl+Shift+R)

**Build errors?**
- Delete `node_modules` and `dist`, then reinstall: `pnpm install`
- Check Node.js version (requires 18+)
