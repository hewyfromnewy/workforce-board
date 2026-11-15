# Roles and permissions matrix

Spec: [roles.spec.ts](roles.spec.ts)

## Flow

A platform admin checks which permissions each default role grants. Tenants start with these roles and their admins assign them to users.

## Steps covered

1. Every default role is a column and every permission is a row.
2. Everyone can view the roster, only Admin can manage users, and Team Member cannot send.

## What a regression looks like

- A role or permission missing from the matrix.
- A permission granted to a role that should not have it, such as Supervisor managing users.
- The matrix and the shared definitions disagreeing.
