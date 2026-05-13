# Rebuild

Rebuild is a student-focused productivity platform designed to help learners rebuild discipline and stay on track. It combines deep-focus study sessions, private or public study rooms, and clear progress insights so students can build consistent habits without the noise of social apps.

---

## Highlights

* **Deep focus sessions** to log intentional work time and track consistency
* **Study rooms** for private or public accountability with room membership and join requests
* **Progress insights** including daily and weekly focus summaries
* **Secure authentication** with email/password and OAuth flows

---

---
## Live Demo
rebuild-with-pradhumn.vercel.app

## Demo Video
[![Watch Demo]([https://www.youtube.com/watch?v=VIDEO_ID](https://youtu.be/IMKhFS7MJcU))]

---

## Tech Stack

* **Web app:** Next.js (App Router), TypeScript, shared UI components
* **API server:** Express + TypeScript
* **Database:** MongoDB via Prisma
* **Monorepo tooling:** Turborepo with shared packages

---

## Repository Structure

* `apps/web` — Next.js client application
* `apps/server` — Express API server
* `packages/ui` — Shared UI components
* `packages/context-providers` — Theme/session providers
* `packages/types` — Shared TypeScript types
* `packages/db` — Prisma schema and database tooling

---

# 🧑‍💻 Running Locally (Development)

### 1) Install dependencies

```bash
npm install
```

---

### 2) Configure environment variables

#### Backend (`apps/server/.env`)

```env
DATABASE_URL="mongodb://localhost:27017/rebuild"
JWT_SECRET="replace-with-a-secure-secret"
```

#### Frontend (`apps/web/.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

---

### 3) Run the apps

```bash
npm run dev
```

Or run individually:

```bash
npm run dev -- --filter=web
npm run dev -- --filter=server
```

---

### 🌐 Access

* Web: http://localhost:3000
* API: http://localhost:4000

---

# 🐳 Running with Docker (Production-like)

## 🔧 Prerequisites

* Docker installed
* Docker Compose installed

---

## 1) Setup environment variables

### Backend

```env
# apps/server/.env
DATABASE_URL="mongodb://host.docker.internal:27017/rebuild"
JWT_SECRET="replace-with-a-secure-secret"
```

### Frontend

```env
# apps/web/.env.local
NEXT_PUBLIC_BACKEND_URL=http://server:4000
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
```

---

## 2) Run the full system

```bash
docker-compose up --build
```

---

## 🌐 Access

* Frontend → http://localhost:3000
* Backend → http://localhost:5000

---

## 🧠 Notes

* `server` is the internal Docker network name (used by frontend to call backend)
* MongoDB can run locally or be added as a Docker service
* First build may take several minutes due to dependency installation

---

# 🐳 (Optional) Using Prebuilt Images

If Docker images are published:

```yaml
services:
  web:
    image: yourname/frontend
  server:
    image: yourname/backend
```

Then run:

```bash
docker-compose up
```

---

# 🛠 Useful Scripts

* `npm run dev` — Run all apps in development mode
* `npm run build` — Build all apps and packages
* `npm run lint` — Run linting across the repo
* `npm run check-types` — Type check all packages

---

# 🤝 Contributing

If you add new endpoints or UI modules:

* keep shared types in `packages/types`
* keep shared UI in `packages/ui`
* avoid duplication across apps

---

# 🚀 Future Improvements

* Add database container to Docker Compose
* Add Nginx reverse proxy
* Deploy to cloud (AWS / GCP / Railway)

---

# 🧠 Summary

* Dev mode → `npm run dev`
* Production-like → `docker-compose up`

---

> One command. Full system. No excuses.
