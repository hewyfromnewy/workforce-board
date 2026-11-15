import { expect, test } from '@playwright/test';

const titles = [
  'Welcome to the Daily Roster Board',
  'Start in Manage',
  'Pick the day',
  'Not on the roster',
  'The board',
  'Supervisors',
  'Send the roster',
  'Need this again?',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a first visit offers the tour without blocking the board', async ({ page }) => {
  await expect(page.getByText('New here? Take a one-minute tour of the board.')).toBeVisible();
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await expect(page.getByRole('cell', { name: 'North Depot PERSONNEL' }).getByText('John Smith')).toBeVisible();
});

test('the tour walks through every part of the screen and then closes', async ({ page }) => {
  await page.getByRole('button', { name: 'Take the tour' }).click();
  const dialog = page.getByRole('dialog');

  for (let i = 0; i < titles.length; i++) {
    await expect(dialog.getByRole('heading', { name: titles[i] })).toBeVisible();
    await expect(dialog.getByText(`Step ${i + 1} of ${titles.length}`)).toBeVisible();
    await dialog.getByRole('button', { name: i === titles.length - 1 ? 'Done' : 'Next' }).click();
  }
  await expect(dialog).toHaveCount(0);
});

test('the tour can go back and can be skipped or closed with Escape', async ({ page }) => {
  await page.getByRole('button', { name: 'Take the tour' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Next' }).click();
  await dialog.getByRole('button', { name: 'Back' }).click();
  await expect(dialog.getByRole('heading', { name: titles[0] })).toBeVisible();

  await dialog.getByRole('button', { name: 'Skip tour' }).click();
  await expect(dialog).toHaveCount(0);

  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Help' }).click();
  await page.getByRole('button', { name: 'Start the tour' }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('the tour invitation does not come back once it has been used or dismissed', async ({ page }) => {
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(page.getByText('New here?')).toHaveCount(0);

  await page.reload();
  await expect(page.getByRole('heading', { name: /^Roster for/ })).toBeVisible();
  await expect(page.getByText('New here?')).toHaveCount(0);
});

test('the help page answers common questions', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Help' }).click();
  await expect(page.getByRole('heading', { name: 'Help', exact: true })).toBeVisible();

  await page.getByText('What does "Changed since sent" mean?').click();
  await expect(page.getByText('so the people who got the message have an out-of-date version')).toBeVisible();
});

test('an empty board points the admin to Manage', async ({ page }) => {
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Manage' }).click();
  for (const name of ['North Depot', 'River Road', 'Park Street', 'Stockpile']) {
    await page.getByRole('button', { name: `Remove ${name}` }).click();
  }
  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Roster' }).click();
  await page.getByRole('button', { name: 'Open Manage' }).click();
  await expect(page.getByRole('heading', { name: 'Manage' })).toBeVisible();
});
