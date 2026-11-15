# Roster saved to the database

Spec: [roster.spec.ts](roster.spec.ts)

Needs the local Supabase stack running and seeded. Each spec uses its own unique far-future date, because every test shares one database.

## Flow

A supervisor builds the day's roster and it is stored per tenant, so it follows the user between devices and is visible to the rest of the team.

## Steps covered

1. A supervisor allocates a person, adds a cell note and names a supervisor. A team member opens the same day and sees all three.
2. An allocation is still there after a reload.
3. Moving a tag and then removing it is saved.
4. Sending is saved. After a reload the day still shows as sent, and an edit afterwards shows as changed. The day appears in Sent history.
5. An admin pastes a list of names. A supervisor, in another session, sees the new person.
6. Adding a location with a job number, removing it, and undoing the removal are all saved.

## What a regression looks like

- A change that only appears on one screen and is lost on reload.
- One user's work not visible to another user in the same tenant.
- A removal that cannot be undone, or an undo that is not saved.
- A sent day losing its sent status after a reload.
