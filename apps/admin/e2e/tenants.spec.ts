import { expect, test } from '@playwright/test';
import { signIn } from './support';

test.beforeEach(async ({ page }) => {
  await signIn(page, 'platform@example.com');
});

test('adding a tenant lists it as active with no users', async ({ page }) => {
  const name = `Test Tenant ${Date.now()}`;
  await page.getByLabel('New tenant name').fill(name);
  await page.getByRole('button', { name: 'Add tenant' }).click();

  await expect(page.getByRole('status')).toContainText(`Added ${name}`);
  const row = page.getByRole('row', { name: new RegExp(name) });
  await expect(row).toContainText('Active');
  await expect(row.getByRole('cell').nth(1)).toHaveText('0');
});

test('a tenant can be suspended and reactivated', async ({ page }) => {
  const name = `Suspend Tenant ${Date.now()}`;
  await page.getByLabel('New tenant name').fill(name);
  await page.getByRole('button', { name: 'Add tenant' }).click();

  await page.getByRole('button', { name: `Suspend ${name}` }).click();
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('Suspended');

  await page.getByRole('button', { name: `Reactivate ${name}` }).click();
  await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText('Active');
});

test('a blank name does not add a tenant', async ({ page }) => {
  const rows = page.getByRole('table', { name: 'Tenants' }).getByRole('row');
  await expect(page.getByRole('rowheader', { name: 'Demo Works Team' })).toBeVisible();
  const before = await rows.count();
  await page.getByLabel('New tenant name').fill('   ');
  await page.getByRole('button', { name: 'Add tenant' }).click();
  await expect(rows).toHaveCount(before);
});
