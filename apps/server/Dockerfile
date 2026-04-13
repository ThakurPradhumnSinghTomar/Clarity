# Use Node.js base image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# -------------------------------
# STEP 1: Copy dependency files
# -------------------------------

RUN mkdir -p apps/server

    # Copy root package files (for monorepo)
COPY package.json package-lock.json ./

    # Copy backend package.json
COPY apps/server/package.json ./apps/server

# Copy shared packages (important for turborepo)
COPY packages ./packages

# -------------------------------
# STEP 2: Install dependencies
# -------------------------------
RUN npm install


# -------------------------------
# STEP 3: Copy full project
# -------------------------------
COPY . .

# -------------------------------
# STEP 4: Build backend
# -------------------------------
# This runs: prisma generate + tsc
RUN npm run build --workspace=server

# -------------------------------
# STEP 5: Set environment
# -------------------------------
ENV NODE_ENV=production

# -------------------------------
# STEP 6: Expose port
# -------------------------------
EXPOSE 5000

# -------------------------------
# STEP 7: Run server
# -------------------------------
CMD ["node", "apps/server/dist/index.js"]