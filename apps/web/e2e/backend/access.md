# Sign in and role-based views

Spec: [access.spec.ts](access.spec.ts)

Needs the local Supabase stack running and seeded (`pnpm exec supabase start`). Runs in the `backend` project against the client app in backend mode.

## Flow

A user signs in and sees only what their role allows. The demo accounts are Admin, Supervisor and Team Member in the Demo Works Team tenant.

## Steps covered

1. A wrong password shows an error and does not sign in.
2. Admin sees every menu item, the tenant name, and Send.
3. Supervisor can allocate and send, and does not see Manage or Users.
4. Team Member sees a view-only notice, cannot allocate by dragging, and has no Send, Manage or Users.
5. An account with no team (the platform admin) is told so.
6. Sign out returns to the login page.
7. An admin changes a user's role and changes it back. The change is enforced by the database.

Each spec works on its own unique far-future date, because every test shares one database.

## What a regression looks like

- A role seeing a menu item or button it should not.
- A team member able to move a tag.
- A role change that appears to work but is rejected by the database, or the reverse.
- Sign out leaving the user inside the app.
