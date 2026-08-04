# ADR 0001 — v1 tech stack

- **Status:** Accepted
- **Date:** 2026-08-04
- **Owner:** Matthew Crawford
- **Context doc:** Crew & Plant Planner v1 Specification (§9 Technical notes)

## Context

v1 is a single-user, single-tenant, no-auth tool. One person (Roger) edits the
board each morning in under three minutes; ~20 crew consume it as a PNG image and
never open the app. There is effectively **no load** — no concurrency, no traffic,
no server-side rendering. The spec (§9) requires:

- Hosted Postgres (local-storage-only is not acceptable — history is the point, §6).
- No auth infrastructure (do not add Clerk or equivalent).
- Read paths kept separable from write paths (§6, future viewer/admin access).
- Append-only assignment history — never overwritten or deleted.

The cost question is therefore not "cheapest paid plan" but "which free tiers won't
bite the one daily interaction with a cold-start or a forced pause."

## Decision

| Layer | Choice |
|---|---|
| **Frontend** | Existing Vite + React + TypeScript + Tailwind/shadcn SPA, built to static files |
| **Database** | **Neon** — serverless Postgres, free tier |
| **API** | Thin serverless functions using **Hono** (owns the DB connection; gives read/write separation) |
| **ORM + migrations** | **Drizzle** + Drizzle Kit |
| **Hosting** | **Cloudflare Pages + Workers** |

End-to-end TypeScript across the existing Turborepo: `apps/web` (static SPA),
`apps/api` (Hono on Workers), `packages/shared` (domain types consumed both ways
and by the Drizzle schema).

### Why these two picks over the alternatives

**Cloudflare over Vercel.** Both are free and both deploy a static SPA plus
functions from the monorepo. Vercel's free *Hobby* tier is technically
non-commercial; this is a council work tool, so Cloudflare's free tier — which
explicitly permits commercial use and has more generous limits — is the safer fit.

**API + Neon over Supabase-direct.** A thin API keeps DB credentials out of the
browser and gives the read/write path separation §6 asks for, and Drizzle
migrations give disciplined schema history. Supabase-direct is less code but its
free project **pauses after 7 days idle** (manual resume) — a real wart for a
daily-but-occasionally-idle tool — and with no auth, access control would reduce to
an unlisted URL plus RLS. Neon scales to zero but **auto-resumes on connect
(~0.5 s)**, which suits the usage pattern.

## Consequences

- **Cost: $0/month for v1 and well beyond.** A paid tier is only reached past
  ~0.5 GB of data (this is text — years away) or if always-on/no-cold-start is
  wanted (~$19/mo, unnecessary for one user).
- Neon's serverless driver pairs with Drizzle over HTTP — good for Workers, which
  can't hold long-lived TCP pool connections.
- The append-only history means the read layer resolves the *latest decision* per
  `(resource, date, slot)` rather than mutating rows in place (see ADR/issue on the
  data model).
- Secrets (Neon connection string) live in Cloudflare + GitHub, never in code.

## Revisit if

- Roger's usage stops being single-user (multi-editor would change the no-auth call).
- Data or query needs outgrow a 0.5 GB free Postgres.
