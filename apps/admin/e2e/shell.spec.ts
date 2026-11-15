import { expect, test } from '@playwright/test';
import { signIn } from './support';

test.beforeEach(async ({ page }) => {
  await signIn(page, 'platform@example.com');
});

test('opens on tenants and navigates between sections', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Tenants' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Tenants' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Users' }).click();
  await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Users' })).toHaveAttribute('aria-current', 'page');

  await page.getByRole('button', { name: 'Roles and permissions' }).click();
  await expect(page.getByRole('heading', { name: 'Roles and permissions' })).toBeVisible();
});

test('lists the seeded tenants and users', async ({ page }) => {
  await expect(page.getByRole('table', { name: 'Tenants' }).getByRole('rowheader', { name: 'Demo Works Team' })).toBeVisible();
  await page.getByRole('button', { name: 'Users' }).click();
  const users = page.getByRole('table', { name: 'Users' });
  await expect(users.getByRole('rowheader', { name: 'Alex Admin' })).toBeVisible();
  await expect(users.getByRole('rowheader', { name: 'Sam Supervisor' })).toBeVisible();
  await expect(users.getByRole('rowheader', { name: 'Tessa Team' })).toBeVisible();
});
