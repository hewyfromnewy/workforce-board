# Add and suspend tenants

Spec: [tenants.spec.ts](tenants.spec.ts)

Needs the local Supabase stack running and seeded.

## Flow

A platform admin creates a tenant for a new organisation and can suspend or reactivate it.

## Steps covered

1. Add a tenant. A confirmation shows and the tenant is listed as Active with 0 users.
2. Suspend a tenant, then reactivate it. The status follows each change.
3. A blank name does not add a tenant.

## What a regression looks like

- A new tenant that does not appear after adding.
- A status that does not change, or changes on screen but is rejected by the database.
- A blank or duplicate row created.
