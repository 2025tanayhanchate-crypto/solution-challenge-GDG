# SahaayX — Smart Resource Allocation & Volunteer Coordination

## Overview

Government-grade social impact platform for India. Dual AI-powered (Google Gemini + Anthropic Claude). Full-stack pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Express 5 + JWT auth + bcryptjs
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: Google Gemini 2.5 Flash + Anthropic Claude (via Replit proxy)
- **Routing**: wouter (client-side)
- **Data fetching**: TanStack Query
- **Charts**: recharts
- **Validation**: Zod (zod/v4), drizzle-zod
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild

## Architecture

```
artifacts/
  api-server/       — Express backend (port 8080)
  sahaay-x/         — React+Vite frontend (port 18128)
  mockup-sandbox/   — Design canvas server

lib/
  db/               — PostgreSQL schema (Drizzle), tables: users, volunteers, ngos, missions, resources, reports, activity, conversations, messages
  api-spec/         — OpenAPI 3.1 spec (openapi.yaml)
  api-zod/          — Zod schemas (codegen from OpenAPI)
  api-client-react/ — TanStack Query hooks (codegen from OpenAPI)
  integrations-gemini-ai/     — Gemini AI client
  integrations-anthropic-ai/  — Anthropic Claude client
```

## Auth

- JWT stored as `sahaax_token` in localStorage
- Roles: `volunteer`, `ngo_admin`, `government`, `police`, `academic`
- Token expiry: 30 minutes

## Demo Credentials (seeded)

- `admin@sahaax.in` / `sahaax123` (government role)
- `ngo@sahaax.in` / `sahaax123` (ngo_admin role)
- `volunteer@sahaax.in` / `sahaax123` (volunteer role)
- `police@sahaax.in` / `sahaax123` (police role)

## Key Commands

- `pnpm run typecheck` — full typecheck
- `pnpm --filter @workspace/db run push` — push DB schema
- `cd artifacts/api-server && pnpm run dev` — start API server
- `cd artifacts/sahaay-x && pnpm run dev` — start frontend
- `node_modules/.bin/tsx artifacts/api-server/src/seed.ts` — reseed DB (skips if data exists)

## API Routes (all under /api)

- `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `GET/POST /volunteers`, `GET/PUT /volunteers/:id`, `GET /volunteers/:id/qr`
- `GET/POST /ngos`, `GET /ngos/:id`
- `GET/POST /missions`, `GET/PUT /missions/:id`, `POST /missions/:id/assign`
- `GET/POST /resources`, `PUT /resources/:id`
- `GET/POST /reports`, `GET /reports/:id`
- `GET /dashboard/summary`, `GET /dashboard/activity`, `GET /dashboard/district-stats`
- `GET/POST/DELETE /gemini/conversations`, `GET/POST /gemini/conversations/:id/messages`
- `POST /gemini/analyze-survey`
- `GET/POST/DELETE /anthropic/conversations`, `GET/POST /anthropic/conversations/:id/messages`
- `POST /anthropic/match-volunteers`

## Codegen Note

After running orval, fix the api-zod index:
```
echo 'export * from "./generated/api.js";' > lib/api-zod/src/index.ts
```
