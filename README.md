# Workforce Board (Daily Roster Board)

A lightweight, date-based roster board designed to replace a physical whiteboard for a local council works team.

This repo is also a learning project to practice:
- CI/CD (PR checks, staging → production deployments)
- cloud hosting
- clean domain modelling (conceptual → logical → physical data design)

---

## Quick Start

```bash
# Install dependencies
pnpm install

# Run the web app
pnpm dev:web

# Run all apps in dev mode
pnpm dev

# Build all apps
pnpm build
```

---

## Monorepo Structure

This is a [Turborepo](https://turbo.build/) monorepo using [pnpm](https://pnpm.io/) workspaces.

```
workforce-board/
├── apps/
│   ├── web/           # Frontend (Vite + React + TypeScript)
│   └── api/           # Backend API (placeholder)
├── packages/
│   └── shared/        # Shared types and utilities
├── turbo.json         # Turborepo pipeline config
├── pnpm-workspace.yaml
└── package.json       # Root workspace config
```

### Apps

| Package | Description | Status |
|---------|-------------|--------|
| `@workforce/web` | React frontend with drag-and-drop roster board | Active |
| `@workforce/api` | Backend API for persistence and multi-user | Placeholder |

### Packages

| Package | Description |
|---------|-------------|
| `@workforce/shared` | Shared v1 domain types (Resource, JobSite, Assignment, DayNote, TrafficControl, LeaveRecord) |

---

## Tech Stack

Chosen for v1 in [ADR 0001](docs/adr/0001-tech-stack.md). Sized for a single
editor and ~20 image-only consumers, it runs entirely on free tiers ($0/month).

| Layer | Choice |
|-------|--------|
| Frontend | Vite + React + TypeScript + Tailwind/shadcn (static SPA) |
| Database | [Neon](https://neon.tech) — serverless Postgres |
| API | [Hono](https://hono.dev) on Cloudflare Workers |
| ORM / migrations | [Drizzle](https://orm.drizzle.team) + Drizzle Kit |
| Hosting | Cloudflare Pages + Workers |

No auth (single-user, single-tenant per spec §9). Assignment history is
append-only. See the ADR for why Cloudflare over Vercel and API+Neon over
Supabase-direct.

---

## Available Scripts

From the root directory:

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run all apps in development mode |
| `pnpm dev:web` | Run only the web app |
| `pnpm dev:api` | Run only the API |
| `pnpm build` | Build all apps |
| `pnpm typecheck` | Type-check all packages |
| `pnpm lint` | Lint all packages |

---

## What this is (product definition)

**Daily Roster Board**: for a given **day**, supervisors allocate **people and assets** to **locations** across predefined **work categories** (e.g., Personnel, Plant, Traffic Control, Contractors, Leave).

This is not a generic Kanban board — it is a daily operational allocation tool.

---

## Actors

### Supervisor (Primary)
Owns the roster for the day.
- Select date
- Allocate team members and assets to locations/categories
- Edit and move allocations during the day
- "Send" the roster for distribution (locks the day)

### Team Member (Secondary)
Consumes the output.
- View the daily roster
- See where they are allocated and what assets are allocated

### Admin (Lightweight)
Manages master data.
- Add/remove team members
- Add/remove assets
- Add/remove locations
- (later) manage roles/access

---

## Domain definitions

- **Roster Day**: a single date's board (Draft → Sent → Archived).
- **Location**: a row on the board (e.g., "Cameron Town").
- **Work Category**: a column on the board (e.g., Personnel, Plant). Seeded reference data in V1.
- **Team Member**: a person tag (yellow tags in UI).
- **Asset**: a plant/vehicle/equipment tag (green tags in UI).
- **Assignment**: the placement of a tag into a specific cell (Location × Work Category) for a given Roster Day.

---

## V1 Capabilities (Whiteboard Replacement)

### Board
- Select date
- Render grid (Locations × Work Categories)
- Create/remove assignments by placing tags into cells
- Persist and reload assignments for the selected date
- Basic "Send" action: marks roster as Sent (prevents silent edits)

### Manage Roster (Master Data Modal)
- Team Members: add/remove (soft delete)
- Assets: add/remove (soft delete)
- Locations: add/remove (soft delete)

### Persistence
- Jobs/allocations persist after refresh
- Date-scoped data model

### Distribution
- "Send" transitions roster day to `Sent`
- Records `SentAt` + `SentBy`

---

## Out of Scope (V1)

Explicitly deferred:
- shift times, availability rules, conflict detection
- optimisation / auto-scheduling
- payroll / timesheets
- reporting/BI
- GPS tracking
- offline-first mode

---

## Data Model (high-level)

> ⚠️ **Superseded.** The model below is the pre-spec prototype design. The
> authoritative v1 data model is the six-entity model in the Crew & Plant Planner
> v1 Specification (§3), implemented in `packages/shared/src/domain.ts`. This
> section is being reconciled — see issue #1.

**RosterDay**
- date
- status (Draft | Sent | Archived)
- sentAt, sentBy

**Location**
- name
- active (soft delete)

**WorkCategory** (seeded)
- name
- sortOrder
- active

**TeamMember**
- displayName
- active

**Asset**
- name
- assetType (Plant | Vehicle | Equipment)
- active

**Assignment** (core)
- rosterDayId
- locationId
- workCategoryId
- resourceType (Person | Asset)
- resourceId (TeamMemberId OR AssetId)
- notes (optional)
- createdBy, createdAt

---

## Engineering / CI-CD goals

- PR checks: lint, typecheck, tests, build
- Deploy: staging → production
- Secrets in GitHub/Azure, not in code
- DB schema changes via migrations

---

## Roadmap

### V0 — Deployed Skeleton
Outcome: working UI deployed via CI/CD.
- repo scaffold
- health endpoint
- staging + prod deploy
- smoke test after deploy

### V1 — Whiteboard Replacement
Outcome: supervisors can run the day from the tool.
- persisted master data + assignments
- roster day status (Draft/Sent)
- "Manage" modal CRUD

### V2 — Operational Hardening
- activity feed / audit view
- filtering (team, priority, suburb)
- basic reporting
- notifications (opt-in)

---

## License

AGPL-3.0 - see [LICENSE](./LICENSE)

This means you can use, modify, and distribute this software, but if you run a modified version as a network service, you must make your source code available to users.
