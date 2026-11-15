import { expect, test } from '@playwright/test';

const status = (page: import('@playwright/test').Page) => page.getByRole('status').filter({ hasText: /Draft|Sent|Changed/ });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('send is unavailable until something is on the roster', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Send', exact: true })).toBeDisabled();
  await expect(status(page)).toContainText('Draft');
});

test('sending marks the day sent and copies the roster', async ({ page }) => {
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(page.getByLabel('Roster message preview')).toContainText('NORTH DEPOT');
  await expect(page.getByLabel('Roster message preview')).toContainText('PERSONNEL: John Smith');

  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect(status(page)).toContainText('Sent at');
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('John Smith');
});

test('editing after sending flags the roster as changed until it is sent again', async ({ page }) => {
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Copy text' }).click();

  await page.locator('[data-tag="Sarah Johnson"]').dragTo(page.getByRole('cell', { name: 'River Road PERSONNEL' }));
  await expect(status(page)).toContainText('Changed since sent');
  await expect(page.getByRole('alert')).toContainText('has changed since you sent it');

  await page.getByRole('button', { name: 'Send again' }).click();
  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect(status(page)).toContainText('Sent at');
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('sent days appear in history and can be reopened', async ({ page }) => {
  await page.locator('[data-tag="Lisa Anderson"]').dragTo(page.getByRole('cell', { name: 'Park Street TRAINING' }));
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Copy text' }).click();

  await page.getByRole('button', { name: 'Next day' }).click();
  await page.getByRole('button', { name: 'Sent history' }).click();
  await expect(page.getByText('1 allocations')).toBeVisible();

  await page.getByRole('button', { name: /^Open / }).click();
  await expect(page.getByRole('cell', { name: 'Park Street TRAINING' }).getByText('Lisa Anderson')).toBeVisible();
});
