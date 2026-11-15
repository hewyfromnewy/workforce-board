import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage' }).click();
});

test('adding a team member makes them available on the roster', async ({ page }) => {
  await page.getByLabel('New team member name').fill('Jordan Lee');
  await page.getByRole('button', { name: 'Add team member' }).click();
  await expect(page.getByText('Added Jordan Lee')).toBeVisible();

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('Jordan Lee')).toBeVisible();
});

test('adding a duplicate is rejected', async ({ page }) => {
  await page.getByLabel('New team member name').fill('john smith');
  await page.getByRole('button', { name: 'Add team member' }).click();
  await expect(page.getByText('john smith is already in the list')).toBeVisible();
});

test('adding a location adds a row to the board', async ({ page }) => {
  await page.getByLabel('New location name').fill('Depot Yard');
  await page.getByRole('button', { name: 'Add location' }).click();

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('rowheader', { name: 'Depot Yard' })).toBeVisible();
});

test('removing an asset can be undone', async ({ page }) => {
  const assets = page.getByRole('region', { name: /^Assets/ });
  await page.getByRole('button', { name: 'Remove Truck #23' }).click();
  await expect(page.getByText('Removed Truck #23')).toBeVisible();
  await expect(assets.getByText('Truck #23')).toHaveCount(0);

  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(assets.getByText('Truck #23')).toBeVisible();
});

test('removing a team member takes them off the board', async ({ page }) => {
  await page.getByRole('button', { name: 'Remove Emma Wilson' }).click();
  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByText('Emma Wilson')).toHaveCount(0);
});
