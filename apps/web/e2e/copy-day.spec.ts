import { expect, test } from '@playwright/test';

const cell = (page: import('@playwright/test').Page, location: string, category: string) =>
  page.getByRole('cell', { name: `${location} ${category}` });

test('copying the previous day brings over its roster', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-tag="John Smith"]').dragTo(cell(page, 'North Depot', 'PERSONNEL'));
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(page.getByRole('group', { name: 'Supervisors' }));
  await page.getByRole('button', { name: 'Add note to North Depot PLANT' }).click();
  await page.getByLabel('Note for North Depot PLANT').fill('x3');
  await page.getByLabel('Note for North Depot PLANT').press('Enter');

  await page.getByRole('button', { name: 'Next day' }).click();
  await expect(cell(page, 'North Depot', 'PERSONNEL').getByText('John Smith')).toHaveCount(0);

  await page.getByRole('button', { name: 'Copy from another day' }).click();
  await page.getByRole('button', { name: 'Copy roster' }).click();

  await expect(cell(page, 'North Depot', 'PERSONNEL').getByText('John Smith')).toBeVisible();
  await expect(cell(page, 'North Depot', 'PLANT')).toContainText('x3');
  await expect(page.getByRole('group', { name: 'Supervisors' }).getByText('Sarah Johnson')).toBeVisible();

  await page.getByRole('button', { name: 'Previous day' }).click();
  await expect(cell(page, 'North Depot', 'PERSONNEL').getByText('John Smith')).toBeVisible();
});

test('copying onto a day that already has a roster warns and replaces it', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-tag="John Smith"]').dragTo(cell(page, 'North Depot', 'PERSONNEL'));
  await page.getByRole('button', { name: 'Next day' }).click();
  await page.getByRole('button', { name: 'Add note to River Road PLANT' }).click();
  await page.getByLabel('Note for River Road PLANT').fill('extra');
  await page.getByLabel('Note for River Road PLANT').press('Enter');

  await page.getByRole('button', { name: 'Copy from another day' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Copying replaces it' })).toBeVisible();
  await page.getByRole('button', { name: 'Replace with copy' }).click();

  await expect(cell(page, 'North Depot', 'PERSONNEL').getByText('John Smith')).toBeVisible();
  await expect(cell(page, 'River Road', 'PLANT')).not.toContainText('extra');
});
