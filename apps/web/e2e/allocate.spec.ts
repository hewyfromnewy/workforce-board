import { expect, test } from '@playwright/test';

const cell = (page: import('@playwright/test').Page, location: string, category: string) =>
  page.getByRole('cell', { name: `${location} ${category}` });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('allocating a person to a cell persists after reload', async ({ page }) => {
  const target = cell(page, 'North Depot', 'PERSONNEL');
  await page.locator('[data-tag="John Smith"]').dragTo(target);

  await expect(target.getByText('John Smith')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('John Smith')).toHaveCount(0);

  await page.reload();
  await expect(cell(page, 'North Depot', 'PERSONNEL').getByText('John Smith')).toBeVisible();
});

test('moving a tag to another cell leaves it in one place only', async ({ page }) => {
  const first = cell(page, 'North Depot', 'PERSONNEL');
  const second = cell(page, 'River Road', 'PLANT');
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(first);
  await first.locator('[data-tag="Sarah Johnson"]').dragTo(second);

  await expect(first.getByText('Sarah Johnson')).toHaveCount(0);
  await expect(second.getByText('Sarah Johnson')).toBeVisible();
});

test('removing a tag from the roster returns it to the waiting list', async ({ page }) => {
  const target = cell(page, 'Park Street', 'PLANT');
  await page.locator('[data-tag="Excavator #1"]').dragTo(target);
  await page.getByRole('button', { name: 'Remove Excavator #1 from roster' }).click();

  await expect(target.getByText('Excavator #1')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('Excavator #1')).toBeVisible();
});

test('each date has its own roster', async ({ page }) => {
  const target = cell(page, 'Stockpile', 'LEAVE');
  await page.locator('[data-tag="Mike Davis"]').dragTo(target);
  await expect(target.getByText('Mike Davis')).toBeVisible();

  await page.getByRole('button', { name: 'Next day' }).click();
  await expect(cell(page, 'Stockpile', 'LEAVE').getByText('Mike Davis')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('Mike Davis')).toBeVisible();

  await page.getByRole('button', { name: 'Previous day' }).click();
  await expect(cell(page, 'Stockpile', 'LEAVE').getByText('Mike Davis')).toBeVisible();
});
