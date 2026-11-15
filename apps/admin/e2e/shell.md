# Admin shell and navigation

Spec: [shell.spec.ts](shell.spec.ts)

Needs the local Supabase stack running and seeded.

## Flow

A platform admin signs in and moves between Tenants, Users, and Roles and permissions from the side menu.

## Steps covered

1. The app opens on Tenants, and the menu marks it as the current page.
2. Selecting Users and Roles and permissions shows each page and moves the current-page marker.
3. The seeded demo tenants and users are listed.

## What a regression looks like

- A menu item that does not change the page.
- The wrong item marked as current.
- A list that stays empty because the data did not load.
