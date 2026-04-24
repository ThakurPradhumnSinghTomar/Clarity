FROM node:20-alpine

WORKDIR /app

# Root configs
COPY package.json package-lock.json ./
COPY turbo.json ./

# Copy app + packages
COPY apps/web/package.json ./apps/web/
COPY packages ./packages

# Install deps
RUN npm install

# Copy source
COPY apps/web ./apps/web

# Build shared types (safe)
RUN npm run build --workspace=@repo/types || true

# Build Next app
RUN npm run build --workspace=web

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=web"]