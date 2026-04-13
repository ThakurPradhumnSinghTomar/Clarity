# -------- STAGE 1: BUILD --------
# Use full Node image (has tools needed for build like npm, etc.)
FROM node:18 AS builder

# Set working directory inside container
WORKDIR /app


# -------- STEP 1: COPY DEPENDENCY FILES --------
# Copy root package.json (monorepo root dependencies)
COPY package.json package-lock.json ./

# Copy backend package.json (workspace-specific dependencies)
COPY apps/server/package.json ./apps/server/

# Copy shared packages (used by backend)
#COPY packages ./packages <-- i think no use of this in backend


# -------- STEP 2: INSTALL ALL DEPENDENCIES --------
# Installs EVERYTHING (dev + prod) because we need build tools
RUN npm install


# -------- STEP 3: COPY BACKEND SOURCE CODE --------
# Copy only backend code (not entire monorepo)
COPY apps/server ./apps/server

RUN npx prisma generate --schema=apps/server/prisma/schema.prisma --no-engine

# -------- STEP 4: BUILD THE PROJECT --------
# Runs build script (e.g., tsc + prisma generate)
RUN npm run build --workspace=server


# -------- STAGE 2: PRODUCTION --------
# Use lightweight image for final container
FROM node:18-alpine

# Set working directory again (fresh container)
WORKDIR /app


# -------- STEP 5: COPY ONLY REQUIRED FILES --------
# Copy package files again (needed to install runtime deps)
COPY package.json package-lock.json ./
COPY apps/server/package.json ./apps/server/


# -------- STEP 6: INSTALL ONLY PRODUCTION DEPENDENCIES --------
# This skips dev dependencies → HUGE SIZE REDUCTION
RUN npm ci --omit=dev --workspace=server \
  && npm cache clean --force \
  && rm -rf /root/.npm /tmp/*


# -------- STEP 7: COPY BUILT OUTPUT FROM BUILDER --------
# Only copy compiled code (no source, no dev files)
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma


# -------- STEP 8: ENVIRONMENT --------
# Set production mode
ENV NODE_ENV=production


# -------- STEP 9: EXPOSE PORT --------
# Backend runs on port 5000
EXPOSE 5000


# -------- STEP 10: START SERVER --------
# Run compiled backend
CMD ["node", "apps/server/dist/index.js"]