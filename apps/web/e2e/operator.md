# Link an operator to a plant item

Spec: [operator.spec.ts](operator.spec.ts)

## Flow

An admin picks a team member as the operator of an asset in Manage. The operator's name then travels with the asset on the board and in the message that is sent.

## Steps covered

1. In Manage, choose an operator for Excavator #1. The asset tag on the Roster page shows the name.
2. Place the asset in a cell. The cell shows "Excavator #1 · Chris Brown". The Send message reads "Excavator #1 (Chris Brown)".
3. Remove a team member who is an operator. The asset goes back to No operator.

## What a regression looks like

- The operator name missing from the tag, the cell or the sent text.
- The operator counted as an extra person in the totals.
- A removed team member still shown as an operator.
