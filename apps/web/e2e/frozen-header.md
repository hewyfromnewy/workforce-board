# Frozen column headers

Spec: [frozen-header.spec.ts](frozen-header.spec.ts)

## Flow

On a board with many locations the category headings (PERSONNEL, PLANT and so on) stay at the top while the supervisor scrolls down, and the LOCATION column stays on the left while scrolling across.

## Steps covered

1. Add 25 locations and open the Roster page in a short window.
2. Scroll the board to the last location. The PLANT heading is in the same place and still visible.

## What a regression looks like

- Headings scrolling out of view with the rows.
- A gap above the frozen headings where rows show through.
- The corner LOCATION cell hidden behind row names or headings.
