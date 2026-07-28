# -------------------------------
# 1️⃣ Builder
# -------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

RUN npm ci

COPY apps/web ./apps/web

RUN npm run build --workspace=@repo/types || true
RUN npm run build --workspace=web


# -------------------------------
# 2️⃣ Runner
# -------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the ENTIRE standalone output (includes node_modules with 'next')
COPY --from=builder /app/apps/web/.next/standalone ./
# Then overlay static assets and public folder
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public


EXPOSE 3000

CMD ["node", "apps/web/server.js"]