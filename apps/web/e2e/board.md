# Board details: supervisors, notes and hire

Spec: [board.spec.ts](board.spec.ts)

## Flow

The whiteboard has more on it than tags in cells. Supervisors are named at the top, handwritten notes sit beside tags, and contractors and hire gear are a separate kind of tag. The board has to carry all of it.

## Steps covered

1. Drag a person onto the Supervisors line. They leave "Not on the roster", and the sent message starts with "Supervisors: ...".
2. Drag a supervisor onto a cell. They leave the supervisors line.
3. Add a note to a cell. It shows in the cell and survives a reload.
4. A cell note appears after the tags in the sent message, for example "PERSONNEL: John Smith - On hold".
5. Change a note after sending. The roster shows as changed since sent.
6. Hire and contractors are listed under their own heading.

## What a regression looks like

- A supervisor shown in two places, or missing from the sent message.
- A note lost on reload, or left out of the message.
- An edit to a note that does not mark a sent roster as changed.
- Hire tags mixed in with team members.
