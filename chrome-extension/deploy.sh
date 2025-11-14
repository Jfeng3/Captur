#!/bin/bash
cd /Users/jiefeng/WebstormProjects/miniflow/chrome-extension

echo "Building extension..."
pnpm build

if [ $? -ne 0 ]; then
    echo "Build failed! Please fix errors before committing."
    exit 1
fi

echo "Build successful! Proceeding with commit..."

# Remove old duplicate files if they exist
rm -rf src/content/components src/content/index.ts 2>/dev/null || true

# Check git status
echo "Git status:"
git status

# Stage all changes
git add .

# Commit with detailed message
git commit -m "refactor: Componentize tooltip and popup, restore matches/all structure

- Extract popup into React components: NoteEditor, SaveButton, MessageDisplay
- Create tooltip component system for content script with vanilla JS/TS
- Move all content script components to src/content/matches/all/components/
- Add TooltipManager to coordinate tooltip components
- Restore original matches/all directory structure for extensibility
- Improve separation of concerns and maintainability
- Add proper TypeScript interfaces and error handling
- Update build system to support original component structure

Both popup (React) and content script (vanilla) now use component-based architecture 
while maintaining the original matches/all structure for future extension support.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
    echo "Commit failed!"
    exit 1
fi

echo "Pushing to main..."
git push origin main

echo "Done! Extension built, committed, and pushed successfully."