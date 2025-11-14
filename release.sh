#!/bin/bash

# Release script for Chrome Extension
# This script:
# 1. Bumps the version number in chrome-extension/package.json and manifest.json
# 2. Builds the extension with release environment (.env.release)
# 3. Creates a zip file for Chrome Web Store upload

set -e  # Exit on error

echo "🚀 Starting release process..."

# Step 1: Bump version number
echo ""
echo "📦 Step 1: Bump version number"
cd chrome-extension

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

# Ask which version to bump
echo ""
echo "Which version to bump?"
echo "1) patch (1.0.0 -> 1.0.1)"
echo "2) minor (1.0.0 -> 1.1.0)"
echo "3) major (1.0.0 -> 2.0.0)"
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    pnpm version patch --no-git-tag-version
    ;;
  2)
    pnpm version minor --no-git-tag-version
    ;;
  3)
    pnpm version major --no-git-tag-version
    ;;
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Version bumped to: $NEW_VERSION"

# Update manifest.json version
echo "📝 Updating manifest.json..."
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
manifest.version = '$NEW_VERSION';
fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');
"
echo "✅ manifest.json updated"

# Step 2: Build the chrome extension
echo ""
echo "🏗️  Step 2: Building chrome extension..."
echo "Extension ID will be: lnekkglefccomljmeholclnllpijhdlc (Chrome Web Store)"

pnpm build  # Build the chrome extension
echo "✅ Build complete"

# Step 3: Create zip file
echo ""
echo "📦 Step 3: Creating zip file for Chrome Web Store..."
cd dist
ZIP_NAME="../captur-extension-v${NEW_VERSION}.zip"
rm -f "$ZIP_NAME"  # Remove if exists
zip -r "$ZIP_NAME" . -x "*.DS_Store"
cd ..
echo "✅ Zip file created: chrome-extension/captur-extension-v${NEW_VERSION}.zip"

# Summary
echo ""
echo "════════════════════════════════════════"
echo "✅ Release complete!"
echo "════════════════════════════════════════"
echo "Version: $NEW_VERSION"
echo "Extension ID: lnekkglefccomljmeholclnllpijhdlc"
echo "Zip file: chrome-extension/captur-extension-v${NEW_VERSION}.zip"
echo ""
echo "Next steps:"
echo "1. Test the extension by loading chrome-extension/dist"
echo "2. Upload captur-extension-v${NEW_VERSION}.zip to Chrome Web Store"
echo "3. Commit the version changes: git add . && git commit -m \"Release v${NEW_VERSION}\""
echo "════════════════════════════════════════"
