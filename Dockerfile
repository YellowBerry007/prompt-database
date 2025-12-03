# Multi-stage build for optimized image size
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
# Force Prisma to use OpenSSL 3.0 binary
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-arm64-openssl-3.0.x
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install OpenSSL 1.1 compatibility for Prisma
# Try to install openssl1.1-compat, fallback to openssl if not available
RUN apk add --no-cache openssl openssl-dev || true
RUN apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/v3.19/main openssl1.1-compat 2>/dev/null || \
    (echo "Note: openssl1.1-compat not available, using system openssl" && true)

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/docker-entrypoint.sh ./docker-entrypoint.sh
RUN mkdir -p ./public || true
RUN chmod +x ./docker-entrypoint.sh

# Create data directory for database with proper permissions
RUN mkdir -p /app/data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:/app/data/prod.db"

# Start the application using the standalone server with entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
