# =============================================================================
# TheGreenSpa Frontend - Multi-stage Dockerfile
# =============================================================================

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for public env vars (Next.js inlines NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_BASEURL
ARG NEXT_PUBLIC_SIGNALR_URL
ARG NEXT_PUBLIC_KIOSK_API_KEY
ARG NEXT_PUBLIC_ELEVENLABS_API_KEY
ARG NEXT_PUBLIC_DISABLE_AUTH
ENV NEXT_PUBLIC_BASEURL=${NEXT_PUBLIC_BASEURL}
ENV NEXT_PUBLIC_SIGNALR_URL=${NEXT_PUBLIC_SIGNALR_URL}
ENV NEXT_PUBLIC_KIOSK_API_KEY=${NEXT_PUBLIC_KIOSK_API_KEY}
ENV NEXT_PUBLIC_ELEVENLABS_API_KEY=${NEXT_PUBLIC_ELEVENLABS_API_KEY}
ENV NEXT_PUBLIC_DISABLE_AUTH=${NEXT_PUBLIC_DISABLE_AUTH}


# Build the application
RUN npm run build && ls -la /app/.next/

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=30s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["npm", "start"]
