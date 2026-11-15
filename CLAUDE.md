# Workforce Board

Daily roster board: supervisors allocate people and assets to locations across work categories, per date. Product definition is in [README.md](README.md).

## Standards

- No code comments.
- No defensive code. Don't guard against states the types or database already rule out. Validate only at system boundaries.
- Playwright e2e tests from the start, covering the main user flows only.
- Every Playwright spec has a regression `.md` file directly beside it with the same basename (`send.spec.ts` and `send.md`). The `.md` describes the flow, the steps, and what a regression looks like.
- UI follows Nielsen's 10 usability heuristics.

## Stack

Turborepo + pnpm. `apps/web` is the client roster app (Vite + React + TypeScript, port 5173). `apps/admin` is the platform admin app for tenants, users, roles and permissions (port 5174); it is a scaffold until the backend exists. Tenant admins manage their own users inside `apps/web`, not in `apps/admin`. `packages/shared` holds shared types, including roles and permissions. `apps/api` is a placeholder. Planned backend is Supabase (Postgres, Auth, RLS).

Auth, tenants, memberships and roles live in Supabase (`supabase/migrations`, row-level security on every table). The client runs in two modes: with `VITE_SUPABASE_URL` set it requires login, gates the UI by role permissions, and stores roster data in Supabase (`remoteStore.ts`); without it, it runs standalone on browser `localStorage` with all permissions (`useLocalStore` in `store.ts`, and what the static GitHub Pages build would be). Both implement the same `StoreApi` and share the pure functions in `store.ts`.

Roster model: tags are `member`, `asset` or `hire` (contractors and hire gear, which may repeat). Locations are jobs with a name, job number and note, and the same name may appear with different job numbers. A day has assignments (tag, category, job), free-text notes per cell, and supervisors. Send records a snapshot and does not lock the day; the board flags a day as changed when it differs from the latest snapshot. Removed tags and jobs are soft-deleted in Supabase so Undo works.

Only members of a tenant can read its roster data, including no platform admin access. Roster edits need `roster.edit`, sending needs `roster.send`, and the master lists need `master_data.manage`.

## Commands

```bash
pnpm dev:web
pnpm db:start        # local Supabase in Docker, applies migrations and seed
pnpm db:env          # writes .env for docker compose
pnpm db:reset        # back to the clean seed
pnpm dev:admin
pnpm dev:web:backend # client with login, port 5175
pnpm build
pnpm typecheck
pnpm test:e2e
docker compose up -d --build
```

Specs live in `apps/web/e2e` (`backend/` specs need Supabase and use one unique far-future date each, since they share a database) and `apps/admin/e2e`. Drag and drop in specs: use `dragTo` onto cells that are visible without horizontal scrolling.

## Demo accounts

Seeded by `supabase/seed.sql`, local only, password `demo-password-1`: `platform@example.com` (platform admin, admin app only), `admin@example.com`, `supervisor@example.com`, `member@example.com` (Demo Works Team). Dev builds show one-click sign-in buttons for them.

`pnpm test:e2e` needs the Supabase stack running. Tests create tenants; run `pnpm db:reset` to clear them.

## Data

Never commit real tenant data or secrets. Use `.env` files and fictional seed data. Demo names, locations and assets in the repo are fictional.
