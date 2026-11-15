# Sign in with an emailed code

Spec: [login.spec.ts](login.spec.ts)

Needs the local Supabase stack running. The emailed code is read from the local mail catcher (Mailpit).

## Flow

A user enters their email, receives a 6-digit code, and enters it to sign in. There are no passwords.

## Steps covered

1. A user with an account asks for a code, reads it from the email, and signs in.
2. A wrong code is rejected with a clear message.
3. An unknown email sees the same "we have sent a code" message and still cannot sign in, so the page does not reveal who has an account.
4. A user can go back and choose a different email.

## What a regression looks like

- A code that does not arrive, or an email without the code in it.
- A wrong or expired code accepted.
- A message that tells a visitor whether an email has an account.
- No way back from the code step.
