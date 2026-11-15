import { expect, test } from '@playwright/test';
import { signIn } from './support';

test('a team member is not shown tour steps for things they cannot do', async ({ page }) => {
  await signIn(page, 'member@example.com');
  await page.getByRole('button', { name: 'Take the tour' }).click();
  const dialog = page.getByRole('dialog');

  const seen: string[] = [];
  for (let i = 0; i < 10; i++) {
    seen.push(await dialog.getByRole('heading').innerText());
    const done = await dialog.getByRole('button', { name: 'Done' }).count();
    await dialog.getByRole('button', { name: done ? 'Done' : 'Next' }).click();
    if (done) break;
  }

  expect(seen).not.toContain('Start in Manage');
  expect(seen).not.toContain('Send the roster');
  expect(seen).toContain('The board');
  expect(seen).toContain('Need this again?');
});

test('an admin sees every step', async ({ page }) => {
  await signIn(page, 'admin@example.com');
  await page.getByRole('button', { name: 'Take the tour' }).click();
  await expect(page.getByRole('dialog').getByText('Step 1 of 8')).toBeVisible();
});

test('the tour invitation is remembered for each person', async ({ page }) => {
  await signIn(page, 'supervisor@example.com');
  await page.getByRole('button', { name: 'Not now' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Send me a code' })).toBeVisible();
  await signIn(page, 'supervisor@example.com');
  await expect(page.getByRole('heading', { name: /^Roster for/ })).toBeVisible();
  await expect(page.getByText('New here?')).toHaveCount(0);
});
