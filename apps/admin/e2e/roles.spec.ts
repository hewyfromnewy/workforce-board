import { expect, test } from '@playwright/test';
import { DEFAULT_ROLES, PERMISSIONS } from '@workforce/shared';
import { signIn } from './support';

test('the permission matrix shows every default role and permission', async ({ page }) => {
  await signIn(page, 'platform@example.com');
  await page.getByRole('button', { name: 'Roles and permissions' }).click();

  const table = page.getByRole('table', { name: 'Role permissions' });
  for (const role of DEFAULT_ROLES) {
    await expect(table.getByRole('columnheader', { name: role.name })).toBeVisible();
  }
  for (const permission of PERMISSIONS) {
    await expect(table.getByRole('rowheader', { name: permission })).toBeVisible();
  }
});

test('team members can only view, and admins can do everything', async ({ page }) => {
  await signIn(page, 'platform@example.com');
  await page.getByRole('button', { name: 'Roles and permissions' }).click();

  const table = page.getByRole('table', { name: 'Role permissions' });
  const row = (permission: string) => table.getByRole('row', { name: new RegExp(permission) });

  await expect(row('roster.view').getByLabel('Allowed', { exact: true })).toHaveCount(3);
  await expect(row('users.manage').getByLabel('Allowed', { exact: true })).toHaveCount(1);
  await expect(row('roster.send').getByLabel('Not allowed', { exact: true })).toHaveCount(1);
});
