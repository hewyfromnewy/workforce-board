import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('the side menu collapses to icons, still navigates, and stays collapsed after a reload', async ({ page }) => {
  const nav = page.getByRole('navigation', { name: 'Main' });
  const wide = (await nav.boundingBox())!.width;

  await page.getByRole('button', { name: 'Collapse menu' }).click();
  await expect(page.getByRole('button', { name: 'Expand menu' })).toBeVisible();
  await expect.poll(async () => (await nav.boundingBox())!.width).toBeLessThan(wide / 2);

  await page.getByRole('button', { name: 'Manage' }).click();
  await expect(page.getByRole('heading', { name: 'Manage', level: 1 })).toBeVisible();

  await page.reload();
  await expect(page.getByRole('button', { name: 'Expand menu' })).toBeVisible();

  await page.getByRole('button', { name: 'Expand menu' }).click();
  await expect.poll(async () => (await nav.boundingBox())!.width).toBe(wide);
});

test('searching Not on the roster narrows the list and can be cleared', async ({ page }) => {
  const waiting = page.getByRole('region', { name: 'Not on the roster' });
  await waiting.getByLabel('Search not on the roster').fill('lis');

  await expect(waiting.locator('[data-tag="Lisa Anderson"]')).toBeVisible();
  await expect(waiting.locator('[data-tag="John Smith"]')).toHaveCount(0);

  await waiting.getByLabel('Search not on the roster').fill('zzz');
  await expect(waiting.getByText('Nobody matches "zzz"')).toBeVisible();

  await waiting.getByLabel('Search not on the roster').fill('');
  await expect(waiting.locator('[data-tag="John Smith"]')).toBeVisible();
});
