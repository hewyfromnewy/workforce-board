import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const labels: Record<string, string> = {
  'admin@example.com': 'Admin',
  'supervisor@example.com': 'Supervisor',
  'member@example.com': 'Team Member',
  'platform@example.com': 'No team',
};

const signIn = async (page: Page, email: string) => {
  await page.goto('/');
  await page.getByRole('button', { name: `Sign in as ${labels[email]}` }).click();
};

test('admin sees every menu item and can send', async ({ page }) => {
  await signIn(page, 'admin@example.com');
  const nav = page.getByRole('navigation', { name: 'Main' });
  for (const item of ['Roster', 'Manage', 'Users', 'Sent history', 'Settings']) {
    await expect(nav.getByRole('button', { name: item })).toBeVisible();
  }
  await expect(nav.getByText('Demo Works Team')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeVisible();
});

test('supervisor can edit and send but not manage', async ({ page }) => {
  await signIn(page, 'supervisor@example.com');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('button', { name: 'Roster' })).toBeVisible();
  await expect(nav.getByRole('button', { name: 'Manage' })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: 'Users' })).toHaveCount(0);

  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await expect(page.getByRole('cell', { name: 'North Depot PERSONNEL' }).getByText('John Smith')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeEnabled();
});

test('team member can only view', async ({ page }) => {
  await signIn(page, 'member@example.com');
  await expect(page.getByText('You can view this roster but not change it.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toHaveCount(0);

  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await expect(page.getByRole('cell', { name: 'North Depot PERSONNEL' }).getByText('John Smith')).toHaveCount(0);

  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('button', { name: 'Manage' })).toHaveCount(0);
  await expect(nav.getByRole('button', { name: 'Users' })).toHaveCount(0);
});

test('an account with no team is told so', async ({ page }) => {
  await signIn(page, 'platform@example.com');
  await expect(page.getByText('is not part of a team yet')).toBeVisible();
});

test('signing out returns to the login page', async ({ page }) => {
  await signIn(page, 'supervisor@example.com');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Send me a code' })).toBeVisible();
});

test('an admin can change a user role and change it back', async ({ page }) => {
  await signIn(page, 'admin@example.com');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Users' }).click();

  const role = page.getByLabel('Role for Tessa Team');
  await role.selectOption('supervisor');
  await expect(page.getByText('Tessa Team is now Supervisor')).toBeVisible();
  await expect(role).toHaveValue('supervisor');

  await role.selectOption('team-member');
  await expect(page.getByText('Tessa Team is now Team Member')).toBeVisible();
});
