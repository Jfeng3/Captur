#!/bin/bash
cd /Users/jiefeng/WebstormProjects/miniflow

echo "Running pnpm build..."
pnpm build

if [ $? -ne 0 ]; then
    echo "Build failed! Please fix errors before committing."
    exit 1
fi

echo "Build successful!"

# Check git status
echo "Checking git status..."
git status

# Stage all changes
echo "Staging all changes..."
git add .

# Commit changes
echo "Committing changes..."
git commit -m "feat: Redesign Index page with shadcn design system

- Update entire Index.tsx to follow shadcn_design_system.md specifications
- Implement chatbox-style writing panel with proper dimensions and padding
- Add semantic color system with ring-based borders and alpha transparency
- Apply typography improvements with text-balance and responsive sizing
- Create suggestion pills with hover/active states following design system
- Update header with backdrop blur and glass morphism effects
- Implement proper button styling with size-8, complex ring colors
- Add sophisticated micro-interactions and transitions (200ms, scale-98)
- Update notes board with consistent design tokens
- Follow all subtle design elements from style.html

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

if [ $? -ne 0 ]; then
    echo "Commit failed!"
    exit 1
fi

# Push to current branch
echo "Pushing to feature branch..."
git push origin feature/redesign-index-page

if [ $? -ne 0 ]; then
    echo "Push failed! Trying to set upstream..."
    git push -u origin feature/redesign-index-page
fi

echo "Successfully pushed to feature/redesign-index-page!"
echo "You can now create a pull request to merge into main."