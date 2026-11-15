# @workforce/api

Backend API for the Workforce Roster Board.

## Status

**Not yet implemented** - This is a placeholder structure.

## Planned Stack

- **Runtime**: Node.js / Bun
- **Framework**: TBD (Hono, Express, or Fastify)
- **Database**: TBD (PostgreSQL recommended)
- **ORM**: TBD (Drizzle or Prisma)

## Planned Endpoints

```
GET    /api/rosters/:date     - Get roster for a specific date
POST   /api/rosters           - Create/update roster
PATCH  /api/rosters/:id/send  - Mark roster as sent

GET    /api/team-members      - List all team members
POST   /api/team-members      - Add team member
DELETE /api/team-members/:id  - Remove team member

GET    /api/assets            - List all assets
POST   /api/assets            - Add asset
DELETE /api/assets/:id        - Remove asset

GET    /api/locations         - List all locations
POST   /api/locations         - Add location
DELETE /api/locations/:id     - Remove location
```

## Development

```bash
# From monorepo root
pnpm dev:api

# Or from this directory
pnpm dev
```
