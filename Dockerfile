# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app

# Build-time args for NEXT_PUBLIC env vars (baked into client bundle)
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner ----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install Chromium for Puppeteer (gallery sync script)
RUN apk add --no-cache chromium

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/next.config.ts ./next.config.ts
# include helper scripts at runtime so we can run initialization/migration inside container
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/src/data ./src/data

# Create logs directory for cron output
RUN mkdir -p /app/logs

# Create entrypoint script
RUN echo '#!/bin/sh\n\
set -e\n\
echo "🚀 Starting Galacticos VB container..."\n\
\n\
# Optional: Detect new gallery folders on startup\n\
if [ "$DETECT_GALLERY_FOLDERS_ON_STARTUP" = "true" ]; then\n\
  echo "📁 Detecting gallery folders..."\n\
  node scripts/detect-gallery-folders.js || true\n\
fi\n\
\n\
# Optional: Sync gallery on startup\n\
if [ "$SYNC_GALLERY_ON_STARTUP" = "true" ]; then\n\
  echo "📸 Syncing gallery..."\n\
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser node scripts/sync-gallery.js || true\n\
fi\n\
\n\
# Start gallery sync cron job in background (if enabled)\n\
if [ "$ENABLE_GALLERY_SYNC_CRON" = "true" ]; then\n\
  echo "⏰ Starting gallery sync cron job..."\n\
  PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser node scripts/sync-gallery-cron.js &\n\
  CRON_PID=$!\n\
  echo "✅ Cron job started (PID: $CRON_PID)"\n\
fi\n\
\n\
# Start Next.js server\n\
echo "🌐 Starting Next.js server..."\n\
npm run start\n\
' > /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 3003

ENTRYPOINT ["/entrypoint.sh"]
