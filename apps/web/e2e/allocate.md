# Allocate people and assets

Spec: [allocate.spec.ts](allocate.spec.ts)

## Flow

A supervisor opens the Roster page, drags a team member or asset from "Not on the roster" into a location and category cell, and the allocation sticks for that date.

## Steps covered

1. Drag a person into North Depot / PERSONNEL. They appear in the cell and leave the waiting list. After a reload they are still in the cell.
2. Drag a tag from one cell to another. It exists in the new cell only.
3. Use the cross on a tag. It leaves the cell and returns to the waiting list.
4. Allocate on one day, step to the next day and back. Each day keeps its own roster.

## What a regression looks like

- A tag shown in two cells, or in a cell and the waiting list at once.
- An allocation lost on reload.
- An allocation made on one day appearing on another day.
- A drop that does nothing, which usually means drag and drop broke.
