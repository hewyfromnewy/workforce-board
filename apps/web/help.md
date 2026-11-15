# Help and guided tour

Spec: [help.spec.ts](help.spec.ts)

## Flow

A first-time user, such as an admin who has never used the board, finds out how it works without anyone explaining it. A card on the Roster page offers a one-minute tour, the Help page answers common questions, and an empty board points to where to start.

## Steps covered

1. A first visit shows the tour invitation, and the board can still be used while it is showing.
2. The tour steps through all eight parts of the screen in order: welcome, Manage, the date, Not on the roster, the board, supervisors, Send, and Help. Each step shows its number, and Done closes it.
3. The tour can go back a step, be skipped, and be closed with Escape. It can be started again from Help.
4. Dismissing the invitation hides it for good, including after a reload.
5. The Help page lists questions with answers that open and close.
6. An empty board explains what to do and has an Open Manage button that goes to Manage.

## What a regression looks like

- The tour invitation blocking the board, or coming back after it was dismissed.
- A tour step that points at the wrong part of the screen, or a step missing for a role that has the feature.
- A step shown to a role that does not have the feature (the backend spec checks this for team members).
- A tour that cannot be closed with the keyboard.
- Help text that no longer matches what the buttons do.
