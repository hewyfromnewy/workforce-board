import { expect, test } from '@playwright/test';
import { openDay, signIn, signedInPage, uniqueDay } from './support';

const cell = (page: import('@playwright/test').Page, name: string) => page.getByRole('cell', { name });

test('a supervisor roster is saved and a team member sees it', async ({ browser }) => {
  const day = uniqueDay();
  const supervisor = await signedInPage(browser, 'supervisor@example.com');
  await openDay(supervisor, day);
  await supervisor.locator('[data-tag="John Smith"]').dragTo(cell(supervisor, 'North Depot PERSONNEL'));
  await supervisor.getByRole('button', { name: 'Add note to North Depot PLANT' }).click();
  await supervisor.getByLabel('Note for North Depot PLANT').fill('10 W tipper x3');
  await supervisor.getByLabel('Note for North Depot PLANT').press('Enter');
  await supervisor.locator('[data-tag="Sarah Johnson"]').dragTo(supervisor.getByRole('group', { name: 'Supervisors' }));
  await expect(supervisor.getByRole('group', { name: 'Supervisors' }).getByText('Sarah Johnson')).toBeVisible();

  const member = await signedInPage(browser, 'member@example.com');
  await openDay(member, day);
  await expect(cell(member, 'North Depot PERSONNEL').getByText('John Smith')).toBeVisible();
  await expect(cell(member, 'North Depot PLANT')).toContainText('10 W tipper x3');
  await expect(member.getByRole('group', { name: 'Supervisors' }).getByText('Sarah Johnson')).toBeVisible();
});

test('changes are still there after a reload', async ({ page }) => {
  const day = uniqueDay();
  await signIn(page, 'supervisor@example.com');
  await openDay(page, day);
  await page.locator('[data-tag="Mike Davis"]').dragTo(cell(page, 'Park Street TRAINING'));
  await expect(cell(page, 'Park Street TRAINING').getByText('Mike Davis')).toBeVisible();
  await page.waitForTimeout(500);

  await page.reload();
  await openDay(page, day);
  await expect(cell(page, 'Park Street TRAINING').getByText('Mike Davis')).toBeVisible();
});

test('moving and removing a tag is saved', async ({ page }) => {
  const day = uniqueDay();
  await signIn(page, 'supervisor@example.com');
  await openDay(page, day);
  await page.locator('[data-tag="Emma Wilson"]').dragTo(cell(page, 'North Depot PERSONNEL'));
  await cell(page, 'North Depot PERSONNEL').locator('[data-tag="Emma Wilson"]').dragTo(cell(page, 'River Road PERSONNEL'));
  await expect(cell(page, 'River Road PERSONNEL').getByText('Emma Wilson')).toBeVisible();
  await page.getByRole('button', { name: 'Remove Emma Wilson from roster' }).click();
  await page.waitForTimeout(500);

  await page.reload();
  await openDay(page, day);
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('Emma Wilson')).toBeVisible();
  await expect(cell(page, 'River Road PERSONNEL').getByText('Emma Wilson')).toHaveCount(0);
});

test('sending is saved, and an edit afterwards shows as changed', async ({ page }) => {
  const day = uniqueDay();
  await signIn(page, 'supervisor@example.com');
  await openDay(page, day);
  await page.locator('[data-tag="Chris Brown"]').dragTo(cell(page, 'Stockpile LEAVE'));
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Copy text' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Sent at' })).toBeVisible();
  await page.waitForTimeout(500);

  await page.reload();
  await openDay(page, day);
  await expect(page.getByRole('status').filter({ hasText: 'Sent at' })).toBeVisible();

  await page.locator('[data-tag="Lisa Anderson"]').dragTo(cell(page, 'Stockpile LEAVE'));
  await expect(page.getByRole('status').filter({ hasText: 'Changed since sent' })).toBeVisible();

  await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Sent history' }).click();
  await expect(page.getByRole('button', { name: /^Open / }).first()).toBeVisible();
});

test('a person added by an admin shows up for a supervisor', async ({ browser }) => {
  const name = `Import Test ${Date.now()}`;
  const admin = await signedInPage(browser, 'admin@example.com');
  await admin.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'Manage' }).click();
  await admin.getByRole('button', { name: 'Paste a list of team members' }).click();
  await admin.getByLabel('Team member names, one per line').fill(`${name}\nJohn Smith`);
  await admin.getByRole('button', { name: 'Add all' }).click();
  await expect(admin.getByText('Added 1, skipped 1 already in the list')).toBeVisible();
  await admin.waitForTimeout(500);

  const supervisor = await signedInPage(browser, 'supervisor@example.com');
  await expect(supervisor.getByRole('region', { name: 'Not on the roster' }).getByText(name)).toBeVisible();
});

test('removing a location can be undone and is saved', async ({ page }) => {
  await signIn(page, 'admin@example.com');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await nav.getByRole('button', { name: 'Manage' }).click();
  const name = `Temp Site ${Date.now()}`;
  await page.getByLabel('New location name').fill(name);
  await page.getByLabel('Job number (optional)').fill('99999');
  await page.getByRole('button', { name: 'Add location' }).click();
  await page.waitForTimeout(500);

  await page.reload();
  await nav.getByRole('button', { name: 'Manage' }).click();
  const locations = page.getByRole('region', { name: /^Locations/ });
  await expect(locations.getByText(name)).toBeVisible();

  await page.getByRole('button', { name: `Remove ${name}` }).click();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(locations.getByText(name)).toBeVisible();
  await page.waitForTimeout(500);

  await page.reload();
  await nav.getByRole('button', { name: 'Manage' }).click();
  await expect(page.getByRole('region', { name: /^Locations/ }).getByText(name)).toBeVisible();
});
