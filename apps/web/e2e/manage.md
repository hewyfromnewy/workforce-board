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

## What a regression looks like

- A duplicate accepted.
- A new item missing from the Roster page.
- A removed item still on the board.
- Undo not restoring the item.
- A removal with no message, so the user cannot tell it happened or reverse it.
