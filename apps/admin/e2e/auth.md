# Admin sign in

Spec: [auth.spec.ts](auth.spec.ts)

Needs the local Supabase stack running and seeded.

## Flow

Only platform admins can use the admin app. Everyone else is refused, even with a valid login.

## Steps covered

1. A wrong password shows an error.
2. A valid tenant admin login is refused with "No access" and sees none of the app.
3. Sign out returns to the login page.

## What a regression looks like

- A tenant admin or any other user reaching tenants or users.
- A wrong password accepted.
- Sign out leaving the user inside the app.
