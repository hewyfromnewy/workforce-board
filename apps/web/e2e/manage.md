# Manage people, assets and locations

Spec: [manage.spec.ts](manage.spec.ts)

## Flow

An admin opens Manage from the side menu and keeps the master lists current. The Roster page reflects every change.

## Steps covered

1. Add a team member. A confirmation shows, and the person is in "Not on the roster".
2. Add a name that already exists, ignoring case. It is rejected with a message.
3. Add a location. A new row appears on the board.
4. Remove an asset, then choose Undo in the message. The asset returns.
5. Remove a team member. They disappear from the Roster page too.

6. Paste a list of names, one per line. Every new name is added, blank lines are ignored, and duplicates are skipped with a count.
7. Add the same location with different job numbers (Irrawang 14525 and Irrawang 14526). The same name and number together is rejected.
8. Paste locations with the job number after a comma.
9. Edit a location's name, job number and note. The Roster page shows them.
10. Hire and contractors can be added more than once, because the same contractor can be on the board several times.
11. Remove every location. The Roster page says the board is empty and points to Manage.

## What a regression looks like

- A duplicate accepted.
- A new item missing from the Roster page.
- A removed item still on the board.
- Undo not restoring the item.
- A pasted list that drops names, or adds duplicates.
- A location with a job number that cannot be added because another location has the same name.
- A removal with no message, so the user cannot tell it happened or reverse it.
