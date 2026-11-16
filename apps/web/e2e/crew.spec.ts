import { expect, test } from '@playwright/test';

const cell = (page: import('@playwright/test').Page, location: string, category: string) =>
  page.getByRole('cell', { name: `${location} ${category}` });

const waiting = (page: import('@playwright/test').Page) => page.getByRole('region', { name: 'Not on the roster' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-tag="Excavator #1"]').dragTo(cell(page, 'North Depot', 'PLANT'));
});

test('people dropped on a plant item sit inside it, one per line', async ({ page }) => {
  const slots = page.getByRole('group', { name: 'People on Excavator #1' });
  await expect(slots.getByText('Drop a person here')).toBeVisible();

  await page.locator('[data-tag="John Smith"]').dragTo(slots);
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(slots);

  await expect(slots.locator('[data-tag="John Smith"]')).toBeVisible();
  await expect(slots.locator('[data-tag="Sarah Johnson"]')).toBeVisible();
  await expect(waiting(page).locator('[data-tag="John Smith"]')).toHaveCount(0);
  await expect(cell(page, 'North Depot', 'PERSONNEL').locator('[data-tag="John Smith"]')).toHaveCount(0);
  await expect(cell(page, 'North Depot', 'PERSONNEL').locator('[data-mirror="John Smith"]')).toContainText('on Excavator #1');
  await expect(cell(page, 'North Depot', 'PERSONNEL').locator('[data-mirror="Sarah Johnson"]')).toBeVisible();

  const first = (await slots.locator('[data-tag="John Smith"]').boundingBox())!;
  const second = (await slots.locator('[data-tag="Sarah Johnson"]').boundingBox())!;
  expect(second.y).toBeGreaterThan(first.y + first.height - 1);
});

test('moving the plant item moves its people, and the message lists them', async ({ page }) => {
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('group', { name: 'People on Excavator #1' }));
  await cell(page, 'North Depot', 'PLANT').getByText('Excavator #1', { exact: true }).dragTo(cell(page, 'River Road', 'PLANT'));

  const moved = cell(page, 'River Road', 'PLANT');
  await expect(moved.getByRole('group', { name: 'People on Excavator #1' }).getByText('John Smith')).toBeVisible();
  await expect(cell(page, 'North Depot', 'PLANT').getByText('John Smith')).toHaveCount(0);

  await expect(cell(page, 'River Road', 'PERSONNEL').locator('[data-mirror="John Smith"]')).toBeVisible();
  await expect(cell(page, 'North Depot', 'PERSONNEL').locator('[data-mirror="John Smith"]')).toHaveCount(0);

  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Excavator #1 (John Smith)');
  await expect(page.getByRole('dialog')).toContainText('John Smith (on Excavator #1)');
});

test('taking a person out, or the plant item off, returns them to the waiting list', async ({ page }) => {
  const slots = page.getByRole('group', { name: 'People on Excavator #1' });
  await page.locator('[data-tag="John Smith"]').dragTo(slots);
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(slots);

  await slots.getByRole('button', { name: 'Remove John Smith from roster' }).click();
  await expect(cell(page, 'North Depot', 'PERSONNEL').locator('[data-mirror="John Smith"]')).toHaveCount(0);
  await expect(waiting(page).locator('[data-tag="John Smith"]')).toBeVisible();
  await expect(slots.locator('[data-tag="Sarah Johnson"]')).toBeVisible();

  await page.getByRole('button', { name: 'Remove Excavator #1 from roster' }).click();
  await expect(waiting(page).locator('[data-tag="Sarah Johnson"]')).toBeVisible();
  await expect(waiting(page).locator('[data-tag="Excavator #1"]')).toBeVisible();
});
