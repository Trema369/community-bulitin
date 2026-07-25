# --- BASE STAGE ---
FROM node:22-alpine AS base

# --- DEPS STAGE ---
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# --- BUILDER STAGE ---
FROM base AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# --- RUNNER STAGE ---
FROM node:22-alpine AS runner
WORKDIR /app

# Alpine ships without curl; Coolify's container healthcheck needs it to
# probe the app, otherwise the container is never marked healthy.
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3000

# 1. Copy public assets
COPY --from=builder /app/public ./public

# 2. Copy the standalone output
COPY --from=builder /app/.next/standalone ./

# 3. Copy static Next.js assets into .next/static
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
