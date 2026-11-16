# People in plant item slots

Spec: [crew.spec.ts](crew.spec.ts)

## Flow

A supervisor puts a plant item on the board, then drags team members onto it to say who is operating it that day. Each plant item shows a "Drop a person here" slot, and every person added gets their own line, so a truck can have a driver and an offsider.

## Steps covered

1. Drop two people onto an excavator. Both sit inside it, one under the other, and are gone from "Not on the roster" and from the PERSONNEL cell.
2. Move the excavator to another location. Its people move with it. The Send message reads "Excavator #1 (John Smith)".
3. Use the cross on a person inside the excavator. They return to the waiting list and the other person stays. Take the excavator off the board. Everyone left in it returns to the waiting list.

## What a regression looks like

- A person shown both inside a plant item and in a cell or the waiting list.
- People left behind in the old cell when the plant item moves, or lost when it is removed.
- Two people on the same line, so the row does not grow.
- A drop on the slot landing in the cell instead of the plant item.
- The sent message missing the people, or listing them as a separate line from the plant item.
