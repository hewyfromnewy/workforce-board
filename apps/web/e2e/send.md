# Send the roster

Spec: [send.spec.ts](send.spec.ts)

## Flow

A supervisor finishes the day's roster and sends it. Sending is distribution only: it records that the roster went out and does not lock the day. If the roster is edited afterwards, the board says so, so the supervisor knows to send again.

## Steps covered

1. An empty roster cannot be sent. The status reads "Draft".
2. Open Send, check the message preview groups people by location and category, and choose Copy text. The status becomes "Sent at ..." and the clipboard holds the roster.
3. Edit the roster after sending. The status becomes "Changed since sent at ...", a warning shows, and the button reads "Send again". Sending again clears the warning.
4. A sent day appears in Sent history with when it was sent and how many allocations went out, and opens back on the Roster page.

## What a regression looks like

- Send enabled on an empty roster.
- The status not changing after sending, or not changing after an edit.
- The warning staying after a resend.
- The copied text missing people, or not grouped by location.
- A sent day missing from history.

## Not covered

Opening WhatsApp. It leaves the app, so it is checked by hand.
