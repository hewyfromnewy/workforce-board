# Database access rules

Spec: [security.spec.ts](security.spec.ts)

Needs the local Supabase stack running and seeded.

## Flow

The screens hide controls a role should not have, but the database is what actually enforces it. These specs talk to the database directly as each demo account, with no screens in between.

## Steps covered

1. A team member can read the tags and jobs but cannot add a tag or an assignment.
2. A supervisor cannot change the master lists but can record a send.
3. The platform admin sees no roster data for any tenant.
4. A signed-out visitor sees nothing.

## What a regression looks like

- Any write succeeding for a role that should not have it.
- The platform admin reading a tenant's people, plant or locations.
- An anonymous request returning rows.
- A row-level security policy dropped by a new migration.
