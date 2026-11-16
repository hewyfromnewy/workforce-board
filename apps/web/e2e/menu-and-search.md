# Collapsible menu and waiting-list search

Spec: [menu-and-search.spec.ts](menu-and-search.spec.ts)

## Flow

A supervisor gives the board more room by collapsing the side menu to icons, and finds a person in "Not on the roster" by typing part of their name instead of scrolling.

## Steps covered

1. Collapse the menu. It shrinks to icons, the items still navigate, and it stays collapsed after a reload. Expand restores the full width.
2. Type part of a name in the search box above "Not on the roster". Only matching tags show. A search with no match says so. Clearing it brings everyone back.

## What a regression looks like

- Menu items that cannot be reached or have no accessible name when collapsed.
- The collapsed state lost on reload, or the toggle shown on small screens where the menu is a drawer.
- Search hiding tags permanently, or a search term that keeps a stale list after the roster changes.
- Dragging a tag out of the search results no longer working.
