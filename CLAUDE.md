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

Auth, tenants, memberships and roles live in Supabase (`supabase/migrations`, row-level security on every table). Roster data is still browser `localStorage` per tenant (`apps/web/src/app/store.ts`); moving it to Supabase is next. The client runs in two modes: with `VITE_SUPABASE_URL` set it requires login and gates the UI by role permissions; without it, it runs standalone with all permissions (this is what the static GitHub Pages build is). Master data (tags, locations) is global; rosters are stored per date. Send records a snapshot and does not lock the day; the board flags a day as changed when it differs from that snapshot.

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

Specs live in `apps/web/e2e` and `apps/admin/e2e`. Drag and drop in specs: use `dragTo` onto cells that are visible without horizontal scrolling.

## Demo accounts

Seeded by `supabase/seed.sql`, local only, password `demo-password-1`: `platform@example.com` (platform admin, admin app only), `admin@example.com`, `supervisor@example.com`, `member@example.com` (Demo Works Team). Dev builds show one-click sign-in buttons for them.

`pnpm test:e2e` needs the Supabase stack running. Tests create tenants; run `pnpm db:reset` to clear them.

## Data

Never commit real tenant data or secrets. Use `.env` files and fictional seed data. Demo names, locations and assets in the repo are fictional.
