# Copy a roster from another day

Spec: [copy-day.spec.ts](copy-day.spec.ts)

## Flow

A supervisor starts a new day from an earlier one instead of rebuilding it. "Copy from another day" starts from the day before, and the date can be changed, for example to last Friday on a Monday.

## Steps covered

1. Build a day with a person, a supervisor and a note. Step to the next day, choose Copy from another day, then Copy roster. The person, supervisor and note appear, and the original day is unchanged.
2. On a day that already has a roster, the dialog warns that copying replaces it. After Replace with copy, the day matches the source and the earlier entries are gone.

## What a regression looks like

- The copy missing notes or supervisors.
- The source day losing its roster.
- A day with an existing roster being replaced without the warning.
- Copied people left in the Not on the roster list as well as on the board.
