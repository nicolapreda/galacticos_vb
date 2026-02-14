#!/bin/sh
set -e

echo "🚀 Starting Galacticos VB container..."

# Optional: Detect new gallery folders on startup
if [ "$DETECT_GALLERY_FOLDERS_ON_STARTUP" = "true" ]; then
  echo "📁 Detecting gallery folders..."
  node scripts/detect-gallery-folders.js || true
fi

# Optional: Sync gallery on startup
if [ "$SYNC_GALLERY_ON_STARTUP" = "true" ]; then
  echo "📸 Syncing gallery..."
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser node scripts/sync-gallery.js || true
fi

# Start gallery sync cron job in background (if enabled)
if [ "$ENABLE_GALLERY_SYNC_CRON" = "true" ]; then
  echo "⏰ Starting gallery sync cron job..."
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser node scripts/sync-gallery-cron.js &
  CRON_PID=$!
  echo "✅ Cron job started (PID: $CRON_PID)"
fi

# Start Next.js server
echo "🌐 Starting Next.js server..."
npm run start
