<div align="center">

<img src="frontend/src/app/icon.svg" alt="CarePlus" width="72" height="72" />

# CarePlus

### Enterprise Hospital Management System

**A full-stack, production-grade healthcare ERP built on a modern TypeScript monorepo.**
Next.js 15 · Express 4 · MongoDB · Docker · Nginx · Fully typed end-to-end.

<br />

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4-404D59?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?style=flat-square&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-A855F7?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Monorepo Layout](#monorepo-layout)
- [Clinical Modules](#clinical-modules)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [Security](#security)
- [Code Quality](#code-quality)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

CarePlus is a **production-ready, role-based Hospital Management System** designed as an enterprise ERP for clinical, operational, and financial workflows. It ships as a **single npm workspace monorepo** with a clear separation between the Next.js frontend and the Express REST API backend, both written in strict TypeScript with zero `any`.

**Key capabilities at a glance:**

| Pillar            | Detail                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| **Clinical**      | Patient 360 EMR, appointment token queue, 4-stage lab pipeline, bed matrix |
| **Pharmacy**      | FEFO batch drug dispenser with atomic charge posting to billing            |
| **Finance**       | Consolidated invoicing, TPA claims, paise-exact totals                     |
| **Operations**    | 3-shift ward roster, consumables ledger, low-stock alerts                  |
| **Governance**    | Immutable audit trail, RBAC (6 roles), JWT rotation, rate limiting         |
| **Observability** | Structured Pino logs, `/health` liveness, `/ready` readiness, Swagger UI   |

---

## Architecture

```
                     +-------------------------------------------+
                     |              Nginx  :80 / :443            |
                     |       (TLS termination + reverse proxy)   |
                     +---------------+---------------+-----------+
                                     |               |
                     +---------------v---+   +--------v--------------+
                     |  Next.js  :3000   |   |  Express API  :4000   |
                     |  App Router       |   |  REST  /api/v1/*      |
                     |  React 19         |   |  Swagger /docs        |
                     |  Redux + Query    |<->|  JWT + RBAC + Zod     |
                     +-------------------+   +-----------+-----------+
                                                         |
                                             +-----------v-----------+
                                             |    MongoDB  7         |
                                             |  (auth-protected)     |
                                             +-----------------------+
```

The stack runs as **four Docker services** on a shared bridge network (`careplus_net`): `mongo`, `api`, `web`, and `nginx`. A fifth `seed` service (profile: `tools`) populates demo data and exits cleanly.

---

## Tech Stack

### Frontend — `@careplus/frontend`

| Layer            | Technology                                            |
| ---------------- | ----------------------------------------------------- |
| **Framework**    | Next.js 15 (App Router, Turbopack, RSC)               |
| **Language**     | TypeScript 5.7 — strict, zero `any`                   |
| **UI System**    | shadcn/ui · Radix UI primitives · Tailwind CSS 3      |
| **Forms**        | React Hook Form 7 + Zod schemas                       |
| **Server State** | TanStack Query 5 (caching, optimistic mutations)      |
| **Data Grids**   | TanStack Table 8 (virtualized, sortable, filterable)  |
| **Client State** | Redux Toolkit 2 (auth slice, ops)                     |
| **Real-time**    | Liveblocks 2 (clinical presence, live bed board sync) |
| **Animations**   | Motion 12 (page transitions, micro-interactions)      |
| **HTTP Client**  | Axios with JWT refresh interceptor                    |
| **E2E Testing**  | Cypress 13                                            |
| **Scroll**       | Lenis (smooth scroll over dense medical timelines)    |

### Backend — `@careplus/backend`

| Layer          | Technology                                                            |
| -------------- | --------------------------------------------------------------------- |
| **Framework**  | Express 4 + TypeScript 5.7                                            |
| **Database**   | MongoDB 7 via Mongoose 9                                              |
| **Auth**       | JSON Web Tokens (access 15 m / refresh 7 d, httpOnly cookie rotation) |
| **Validation** | Zod at every API boundary                                             |
| **Security**   | Helmet, CORS allowlist, express-rate-limit, bcryptjs                  |
| **API Docs**   | Swagger UI · frozen OpenAPI 3.1 snapshot                              |
| **Logging**    | Pino (structured JSON) + Morgan HTTP logs                             |
| **Testing**    | Vitest 5 + Supertest + mongodb-memory-server                          |
| **Process**    | tsx (dev watch) -> tsc -> node dist/ (prod)                           |

---

## Monorepo Layout

```
CarePlus/
+-- frontend/                         # @careplus/frontend  (Next.js 15)
|   +-- src/
|   |   +-- app/
|   |   |   +-- (dashboard)/          # 14 protected workstation routes
|   |   |   |   +-- appointments/
|   |   |   |   +-- billing/
|   |   |   |   +-- dashboard/
|   |   |   |   +-- departments/
|   |   |   |   +-- desk/
|   |   |   |   +-- doctors/
|   |   |   |   +-- inventory/
|   |   |   |   +-- lab-reports/
|   |   |   |   +-- patients/
|   |   |   |   +-- pharmacy/
|   |   |   |   +-- reports/
|   |   |   |   +-- settings/
|   |   |   |   +-- staff/
|   |   |   |   +-- team/
|   |   |   +-- login/
|   |   |   +-- portal/
|   |   |   +-- change-password/
|   |   |   +-- forgot-password/
|   |   +-- components/
|   |   |   +-- ui/                   # shadcn/ui primitives
|   |   |   +-- clinical/             # TriageModal, EPrescriptionPad, VitalsChart
|   |   |   +-- layout/               # Sidebar, TopBar, NotificationsPopover
|   |   |   +-- shared/
|   |   |   +-- auth/
|   |   +-- store/                    # Redux Toolkit (authSlice)
|   |   +-- hooks/                    # Custom React & TanStack Query hooks
|   |   +-- lib/                      # Axios instance, Liveblocks client, utils
|   |   +-- types/                    # Domain TypeScript definitions
|   +-- Dockerfile
|   +-- package.json
|
+-- backend/                          # @careplus/backend  (Express REST API :4000)
|   +-- src/
|   |   +-- routes/                   # 16 route modules
|   |   |   +-- auth.ts               # Login, refresh, logout
|   |   |   +-- patients.ts
|   |   |   +-- appointments.ts
|   |   |   +-- beds.ts
|   |   |   +-- pharmacy.ts
|   |   |   +-- lab.ts
|   |   |   +-- billing.ts
|   |   |   +-- doctors.ts
|   |   |   +-- departments.ts
|   |   |   +-- inventory.ts
|   |   |   +-- staff.ts
|   |   |   +-- users.ts
|   |   |   +-- settings.ts
|   |   |   +-- audit.ts
|   |   |   +-- dashboard.ts
|   |   |   +-- public.ts
|   |   +-- models/                   # 15 Mongoose schemas
|   |   +-- repos/                    # Repository layer (auditRepo, etc.)
|   |   +-- services/                 # Business logic services
|   |   +-- docs/                     # OpenAPI spec & Swagger router
|   |   +-- middleware.ts             # JWT auth, RBAC, Zod validate, error envelope
|   |   +-- app.ts                    # Express factory
|   |   +-- config.ts                 # Env-validated config
|   |   +-- db.ts                     # Mongoose connection
|   |   +-- errors.ts                 # ApiError class
|   |   +-- logger.ts                 # Pino structured logger
|   |   +-- paginate.ts               # Cursor/offset pagination helper
|   |   +-- store.ts                  # In-memory repository (swap for Prisma)
|   |   +-- seed.ts                   # Demo data seeder
|   +-- tests/                        # Vitest integration tests (10 suites)
|   +-- Dockerfile
|   +-- package.json
|
+-- nginx/
|   +-- nginx.conf                    # Reverse proxy + TLS config
+-- docs/
|   +-- API_CONTRACT.md               # Full API contract specification
|   +-- ROADMAP.md                    # Architecture & feature roadmap
|   +-- openapi.snapshot.json         # Frozen OpenAPI 3.1 contract
+-- docker-compose.yml                # 5-service orchestration
+-- package.json                      # npm workspaces root (scripts only)
+-- SECURITY.md                       # Security policy & accepted-risk log
+-- README.md
```

---

## Clinical Modules

### `/appointments` — Token Queue & Schedule

Live appointment queue with a triage status machine. Guarded state transitions prevent illegal status jumps (e.g., jumping from Scheduled directly to Completed without intermediate states).

### `/patients` — Patient 360 EMR

Master patient index powered by TanStack Table. Each patient record aggregates live visits, lab orders, prescriptions, and billing invoices into a single cohesive view.

### `/departments/beds` — Real-Time Bed Board

Visual bed matrix with Liveblocks presence sync. Supports admit, intra-ward transfer, and release operations with live occupancy tracking across all wards simultaneously.

### `/pharmacy` — FEFO Drug Dispenser

First-Expiry-First-Out batch drug dispensing. Each dispense is atomic — stock is decremented and a charge line is posted to billing in a single operation, preventing partial state.

### `/lab-reports` — 4-Stage Pathology Pipeline

Forward-only pipeline: **Ordered -> Sample Collected -> Processing -> Completed**. Each stage transition is role-gated and results cannot regress to earlier states, ensuring data integrity.

### `/billing` — Consolidated Invoicing

Paise-exact integer arithmetic eliminates floating-point rounding errors. Supports multi-department line items, TPA claim generation, and atomic payment collection.

### `/inventory` — Consumables Ledger

Hospital consumables and equipment tracking with configurable low-stock alert thresholds and full movement audit history.

### `/staff` — Ward Roster Matrix

3-shift (Morning / Evening / Night) roster with department assignment, role tracking, and shift management across all hospital wards.

### `/settings` — RBAC & Audit Trail

Hospital profile management, role-based permission configuration, and an immutable append-only `Audit` collection recording every mutating authenticated request with IP, user, role, and action.

---

## API Reference

**Base URL:** `http://localhost:4000/api/v1`

**Response envelope:**

```jsonc
// Success
{ "data": T, "meta"?: { "total": 120, "page": 1, "limit": 20 } }

// Error
{ "error": { "code": "UNAUTHORIZED", "message": "...", "details": null, "requestId": "uuid" } }
```

| Method               | Route                     | Auth                 | Notes                                                      |
| -------------------- | ------------------------- | -------------------- | ---------------------------------------------------------- |
| `GET`                | `/health`                 | —                    | Liveness probe — always 200 if process is alive            |
| `GET`                | `/ready`                  | —                    | Readiness probe — 503 when MongoDB is disconnected         |
| `GET`                | `/docs`                   | —                    | Swagger UI                                                 |
| `GET`                | `/api/v1/openapi.json`    | —                    | Frozen OpenAPI 3.1 contract                                |
| `POST`               | `/api/v1/auth/login`      | —                    | `{email, password}` -> `{token, refreshToken, role, name}` |
| `POST`               | `/api/v1/auth/refresh`    | —                    | Rotates token pair; sets httpOnly refresh cookie           |
| `POST`               | `/api/v1/auth/logout`     | —                    | Revokes refresh token                                      |
| `GET / POST`         | `/api/v1/patients`        | JWT / Admin, Nurse   | Paginated with filters                                     |
| `GET`                | `/api/v1/patients/:id`    | JWT                  | Full patient record incl. visits, lab orders, bills        |
| `GET / POST / PATCH` | `/api/v1/appointments`    | JWT / roles          | Guarded status machine                                     |
| `GET / PATCH`        | `/api/v1/beds`            | JWT / roles          | Admit, transfer, release + occupancy                       |
| `GET / POST`         | `/api/v1/pharmacy`        | JWT / roles          | Atomic dispense; posts charge to billing                   |
| `GET / POST / PATCH` | `/api/v1/lab`             | JWT / roles          | Forward-only 4-stage pipeline                              |
| `GET / POST`         | `/api/v1/billing`         | JWT / Admin, Cashier | Paise-exact totals; atomic collect                         |
| `GET`                | `/api/v1/doctors`         | JWT                  | Paginated                                                  |
| `GET`                | `/api/v1/departments`     | JWT                  | Paginated                                                  |
| `GET`                | `/api/v1/inventory`       | JWT                  | Paginated                                                  |
| `GET`                | `/api/v1/staff`           | JWT                  | Paginated                                                  |
| `GET`                | `/api/v1/audit`           | JWT / Admin          | Paginated immutable log                                    |
| `GET`                | `/api/v1/dashboard/stats` | JWT                  | Aggregated KPI snapshot                                    |

Full contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md)  
Live interactive docs: `http://localhost:4000/docs`

**Test login (seeded dev account):**

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@careplus.local","password":"Admin@123"}'

# Use the returned token on subsequent requests:
# Authorization: Bearer <token>
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20 LTS
- **npm** >= 10 (workspaces support)
- **Docker + Docker Compose v2** _(for the containerized setup)_

### Local Development (Without Docker)

```bash
# 1. Clone the repository and install all workspace dependencies
git clone <repo-url>
cd CarePlus
npm install

# 2. Configure the backend environment
cp backend/.env.example backend/.env
# Edit backend/.env
# Required: JWT_SECRET (min 32 chars), JWT_ACCESS_SECRET, MONGODB_URI

# 3. Configure the frontend environment
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local
# Required: NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

# 4. Start both services concurrently
npm run dev
# api  ->  http://localhost:4000
# web  ->  http://localhost:3000

# Run services independently if preferred:
npm run dev:backend
npm run dev:frontend
```

### Root-Level Scripts

| Script                   | Description                              |
| ------------------------ | ---------------------------------------- |
| `npm run dev`            | Start frontend and backend concurrently  |
| `npm run dev:frontend`   | Frontend only (port 3000, Turbopack HMR) |
| `npm run dev:backend`    | Backend only (port 4000, tsx watch)      |
| `npm run build`          | Production build — both workspaces       |
| `npm run build:frontend` | Production build — frontend only         |
| `npm run build:backend`  | Production build — backend only          |
| `npm run typecheck`      | `tsc --noEmit` in both workspaces        |
| `npm run format`         | Auto-format all files with Prettier      |
| `npm run format:check`   | Verify formatting without writing        |
| `npm run lint`           | ESLint on the backend workspace          |

### Service URLs

| Service          | URL                                         |
| ---------------- | ------------------------------------------- |
| **Frontend**     | `http://localhost:3000`                     |
| **REST API**     | `http://localhost:4000/api/v1`              |
| **Swagger UI**   | `http://localhost:4000/docs`                |
| **OpenAPI JSON** | `http://localhost:4000/api/v1/openapi.json` |
| **Liveness**     | `http://localhost:4000/health`              |
| **Readiness**    | `http://localhost:4000/ready`               |

---

## Environment Variables

### Backend — `backend/.env`

| Variable                 | Required     | Default            | Description                                |
| ------------------------ | ------------ | ------------------ | ------------------------------------------ |
| `PORT`                   | No           | `4000`             | HTTP server port                           |
| `NODE_ENV`               | No           | `development`      | Runtime environment                        |
| `MONGODB_URI`            | Yes          | —                  | Full MongoDB connection string             |
| `MONGO_ROOT_USER`        | Yes (Docker) | —                  | MongoDB admin username                     |
| `MONGO_ROOT_PASSWORD`    | Yes (Docker) | —                  | MongoDB admin password                     |
| `JWT_SECRET`             | Yes          | —                  | HMAC signing secret (min 32 chars)         |
| `JWT_ACCESS_SECRET`      | Yes          | —                  | Access token signing secret (min 32 chars) |
| `JWT_EXPIRES_IN`         | No           | `15m`              | Access token TTL                           |
| `JWT_REFRESH_EXPIRES_IN` | No           | `7d`               | Refresh token TTL                          |
| `FRONTEND_URL`           | No           | `http://localhost` | CORS allowlist origin                      |

> **Fail-fast design:** The server exits at startup (`exit 1`) if `JWT_SECRET` or `JWT_ACCESS_SECRET` are absent or shorter than 32 characters. Docker Compose also refuses to start without these variables being explicitly set.

### Frontend — `frontend/.env.local`

| Variable              | Required | Description                                           |
| --------------------- | -------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Yes      | Backend base URL, e.g. `http://localhost:4000/api/v1` |

---

## Docker Deployment

All services share the `careplus_net` bridge network. Each container enforces hard CPU and memory limits, writes structured JSON logs with file-based rotation.

```bash
# 1. Prepare secrets
cp backend/.env.example backend/.env
# Set: MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, JWT_SECRET, JWT_ACCESS_SECRET

# 2. Build images and start all four services
docker compose up --build

# 3. Seed demo data (first boot — one-shot, exits after completion)
docker compose --profile tools run --rm seed

# Stop services
docker compose down

# Stop and wipe all persistent data
docker compose down -v
```

### Service Map

| Service | Image                        | Exposed Port | Resource Limit     |
| ------- | ---------------------------- | ------------ | ------------------ |
| `nginx` | nginx:1.27-alpine            | `80`, `443`  | 0.5 CPU / 128 MB   |
| `web`   | Custom (frontend/Dockerfile) | Internal     | 1.0 CPU / 512 MB   |
| `api`   | Custom (backend/Dockerfile)  | Internal     | 1.0 CPU / 512 MB   |
| `mongo` | mongo:7                      | Internal     | 1.0 CPU / 512 MB   |
| `seed`  | Reuses api image             | —            | Tools profile only |

**Startup dependency chain:**
`mongo` (mongosh ping health check) -> `api` -> `web` -> `nginx`

---

## Testing

### Backend — Integration Tests

All tests run against an in-memory MongoDB instance (`mongodb-memory-server`). No external database is required to run the full test suite.

```bash
# Run all backend tests
npm run test -w @careplus/backend

# Run a specific suite
npx vitest run tests/auth.test.ts
```

| Suite                        | Coverage Area                                                         |
| ---------------------------- | --------------------------------------------------------------------- |
| `auth.test.ts`               | Login, refresh, logout, token rotation, rate-limit bypass in test env |
| `patients.test.ts`           | Patient CRUD, pagination, role guards                                 |
| `appointments.test.ts`       | Token queue, status-machine transitions                               |
| `pharmacy-lab.test.ts`       | Drug dispense, lab pipeline stage advancement                         |
| `billing-pagination.test.ts` | Invoice creation, atomic collect, cursor pagination                   |
| `enterprise.test.ts`         | Cross-module workflows, audit trail integrity                         |
| `health.test.ts`             | Liveness and readiness probes                                         |
| `settings.test.ts`           | Hospital profile, RBAC configuration                                  |

### Frontend — E2E Tests (Cypress)

```bash
# Open Cypress interactive runner
npm run cypress -w @careplus/frontend

# Headless CI mode
npm run cypress:run -w @careplus/frontend
```

---

## Security

CarePlus applies a **defense-in-depth** approach across the full stack:

| Control              | Implementation                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **JWT rotation**     | Short-lived access tokens (15 min) + httpOnly refresh tokens (7 d); multi-secret rotation via config array                                 |
| **RBAC**             | 6 roles enforced at every protected route via `requireRole()` middleware; Admins pass all role checks                                      |
| **Rate limiting**    | Credential endpoints: 20 req / 15 min; token refresh: 180 req / 15 min; self-disabled in test env                                          |
| **NoSQL injection**  | Express `query parser` set to `simple` — `?field[$ne]=x` is treated as a literal string, never reaching Mongoose                           |
| **Input validation** | Zod schemas parse every request body before it touches the database layer                                                                  |
| **Payload limit**    | JSON bodies capped at 100 KB                                                                                                               |
| **HTTP hardening**   | Helmet (CSP, HSTS, X-Frame-Options, Referrer-Policy, and more)                                                                             |
| **Audit trail**      | Every mutating authenticated request is asynchronously written to an append-only `Audit` collection; audit writes never block the response |
| **Secrets**          | `.env` files are git-ignored; server fails fast on missing or weak secrets; Docker Compose enforces required vars                          |
| **Dependency audit** | CI runs `npm audit --omit=dev --audit-level=critical`; all open risks documented in `SECURITY.md`                                          |

Full vulnerability log and accepted-risk register: [`SECURITY.md`](SECURITY.md)

---

## Code Quality

**Pre-commit hooks** (Husky + lint-staged) enforce quality on every commit:

```bash
prettier --write       # Format changed files
eslint --fix           # Auto-fix lint violations
tsc --noEmit           # Full type-check — must pass in both workspaces
```

**Manual quality checks:**

```bash
npm run typecheck      # Type-check both workspaces
npm run format:check   # Verify formatting without writing files
npm run lint           # Lint backend source
```

**Project-wide conventions:**

- Strict TypeScript throughout — zero `any`, zero `ts-ignore` in both workspaces.
- Zod schemas at every API boundary: request bodies, query parameters, and environment config.
- Repository pattern on the backend — `store.ts` is an in-memory DB interface engineered for a drop-in Prisma or native Mongoose repository replacement.
- All frontend API calls are centralized through `frontend/src/lib/apiClient.ts` pointing to `NEXT_PUBLIC_API_URL`.
- `node_modules`, `.next`, `dist`, and `.env` files are git-ignored and have never been committed.

---

## Roadmap

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full architecture decision record and feature specification.

| Phase                         | Target                                        | Status   |
| ----------------------------- | --------------------------------------------- | -------- |
| Core HMS modules              | All 14 workstations + complete REST API       | Complete |
| Docker production stack       | Nginx + TLS + resource limits + health checks | Complete |
| Backend integration tests     | 10 test suites with mongodb-memory-server     | Complete |
| Security hardening            | Rate limiting, NoSQL injection guard, RBAC    | Complete |
| Prisma / PostgreSQL migration | Swap Mongoose in-memory store                 | Planned  |
| Frontend live API integration | Wire TanStack Query to real REST endpoints    | Planned  |
| Liveblocks bed board sync     | Real-time multi-user clinical presence        | Planned  |
| Cypress E2E coverage          | Critical clinical workflows end-to-end        | Planned  |
| CI/CD pipeline                | GitHub Actions -> Docker Hub -> staging       | Planned  |

---

## Contributing

1. **Fork** the repository and create a feature branch from `main`.
2. Follow the existing TypeScript conventions — strict mode, no `any`, no `ts-ignore`.
3. Add or update tests for any changed API behavior.
4. Ensure `npm run typecheck` and `npm run format:check` pass before opening a pull request.
5. For security vulnerabilities, open a GitHub issue with `[security]` in the title. Do not post exploit details publicly. Maintainers will acknowledge within 7 days.

---

<div align="center">

**CarePlus** is open-source software.
Built with precision for healthcare teams that demand reliability.

</div>
