import { expect, test } from '@playwright/test';

test('column headers stay visible while the board scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 500 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage' }).click();
  const lines = Array.from({ length: 25 }, (_, i) => `Frozen Location ${i + 1}`).join('\n');
  await page.getByRole('button', { name: 'Paste a list of locations' }).click();
  await page.getByLabel('Locations, one per line').fill(lines);
  await page.getByRole('button', { name: 'Add all' }).click();
  await page.getByRole('button', { name: 'Roster' }).click();

  const header = page.getByRole('columnheader', { name: 'PLANT' });
  const before = await header.boundingBox();
  await page.getByRole('cell', { name: 'Frozen Location 25 PLANT' }).scrollIntoViewIfNeeded();
  const after = await header.boundingBox();

  expect(after!.y).toBeCloseTo(before!.y, 0);
  await expect(header).toBeInViewport();
});
