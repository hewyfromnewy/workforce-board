# Admin sign in

Spec: [auth.spec.ts](auth.spec.ts)

Needs the local Supabase stack running and seeded. The emailed code is read from the local mail catcher (Mailpit).

## Flow

Only platform admins can use the admin app. Everyone else is refused, even with a valid login.

## Steps covered

1. A platform admin asks for a code, reads it from the email, and signs in.
2. A wrong code shows an error and does not sign in.
3. A valid tenant admin login is refused with "No access" and sees none of the app.
4. Sign out returns to the login page.

## What a regression looks like

- A tenant admin or any other user reaching tenants or users.
- A wrong or expired code accepted.
- The emailed code not matching what the app expects.
- Sign out leaving the user inside the app.
