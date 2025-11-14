# Google Docs Floating Selector

## Overview
Floating action buttons for Google Docs text selection using Selection API, viewport-relative positioning, and Shadow DOM isolation to avoid conflicts with Google's dynamic CSS.

## Core Functionality
- **Selection API**: `document.getSelection().toString()` captures visible text in editor frame
- **Positioning**: `getClientRects()/getBoundingClientRect()` provides viewport-relative coordinates  
- **Isolation**: Shadow DOM prevents Google Docs CSS interference
- **Frame Support**: `all_frames: true` ensures script runs in editable iframe

## User Flow
1. User selects text → `selectionchange` event fires in focused frame
2. Floating buttons appear above/right of selection using fixed positioning
3. User clicks Save/Rephrase → Extension processes selected text reliably