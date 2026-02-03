# Clarity (Rebuild)

Clarity is a student-focused productivity platform designed to help learners rebuild discipline and stay on track. It combines deep-focus study sessions, private or public study rooms, and clear progress insights so students can build consistent habits without the noise of social apps.

## Highlights

- **Deep focus sessions** to log intentional work time and track consistency.
- **Study rooms** for private or public accountability with room membership and join requests.
- **Progress insights** including daily and weekly focus summaries.
- **Secure authentication** with email/password and OAuth flows.

## Tech Stack

- **Web app:** Next.js (App Router), TypeScript, shared UI components.
- **API server:** Express + TypeScript.
- **Database:** MongoDB via Prisma.
- **Monorepo tooling:** Turborepo with shared packages for UI, types, and configuration.

## Repository Structure

- `apps/web` — Next.js client application.
- `apps/server` — Express API server.
- `packages/ui` — Shared UI components.
- `packages/context-providers` — Theme/session providers.
- `packages/types` — Shared TypeScript types.
- `packages/db` — Prisma schema and database tooling.

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file for the API server and provide a MongoDB connection string and JWT secret:

```bash
# apps/server/.env
DATABASE_URL="mongodb://localhost:27017/clarity"
JWT_SECRET="replace-with-a-secure-secret"
```

### 3) Run the apps

From the repository root, run everything at once:

```bash
npm run dev
```

Or run a single app with a Turborepo filter:

```bash
npm run dev -- --filter=web
npm run dev -- --filter=server
```

- Web app runs at `http://localhost:3000`.
- API server runs at `http://localhost:4000`.

## Useful Scripts

- `npm run dev` — Run all apps in development mode.
- `npm run build` — Build all apps and packages.
- `npm run lint` — Run linting across the repo.
- `npm run check-types` — Type check all packages.

## Contributing

If you add new endpoints or UI modules, keep shared types in `packages/types` and shared UI in `packages/ui` to avoid duplication.
