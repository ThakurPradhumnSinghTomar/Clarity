# -------------------------------
# 1️⃣ Builder stage
# -------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
COPY turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

RUN npm install

COPY apps/web ./apps/web

# Build shared packages if needed
RUN npm run build --workspace=@repo/types || true

# Build Next app
RUN npm run build --workspace=web


# -------------------------------
# 2️⃣ Runner stage (lightweight)
# -------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built app
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/packages ./packages

# 🔥 move into correct folder
WORKDIR /app/apps/web


EXPOSE 3000

CMD ["npm", "run", "start"]