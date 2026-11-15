import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('a supervisor can be named for the day and is included in the sent message', async ({ page }) => {
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(page.getByRole('group', { name: 'Supervisors' }));
  await expect(page.getByRole('group', { name: 'Supervisors' }).getByText('Sarah Johnson')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Not on the roster' }).getByText('Sarah Johnson')).toHaveCount(0);

  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByLabel('Roster message preview')).toContainText('Supervisors: Sarah Johnson');
});

test('moving a supervisor onto the board takes them off the supervisors line', async ({ page }) => {
  const supervisors = page.getByRole('group', { name: 'Supervisors' });
  await page.locator('[data-tag="Sarah Johnson"]').dragTo(supervisors);
  await supervisors.locator('[data-tag="Sarah Johnson"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));

  await expect(supervisors.getByText('Sarah Johnson')).toHaveCount(0);
  await expect(page.getByRole('cell', { name: 'North Depot PERSONNEL' }).getByText('Sarah Johnson')).toBeVisible();
});

test('a note can be added to a cell and survives a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Add note to North Depot PLANT' }).click();
  await page.getByLabel('Note for North Depot PLANT').fill('10 W tipper x3');
  await page.getByLabel('Note for North Depot PLANT').press('Enter');
  await expect(page.getByRole('cell', { name: 'North Depot PLANT' })).toContainText('10 W tipper x3');

  await page.reload();
  await expect(page.getByRole('cell', { name: 'North Depot PLANT' })).toContainText('10 W tipper x3');
});

test('a note on its own counts as part of the roster and appears in the message', async ({ page }) => {
  await page.getByRole('button', { name: 'Add note to River Road PERSONNEL' }).click();
  await page.getByLabel('Note for River Road PERSONNEL').fill('On hold');
  await page.getByLabel('Note for River Road PERSONNEL').press('Enter');
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'River Road PERSONNEL' }));

  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByLabel('Roster message preview')).toContainText('PERSONNEL: John Smith - On hold');
});

test('changing a note after sending flags the roster as changed', async ({ page }) => {
  await page.locator('[data-tag="John Smith"]').dragTo(page.getByRole('cell', { name: 'North Depot PERSONNEL' }));
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await page.getByRole('button', { name: 'Copy text' }).click();

  await page.getByRole('button', { name: 'Add note to North Depot PLANT' }).click();
  await page.getByLabel('Note for North Depot PLANT').fill('Late start');
  await page.getByLabel('Note for North Depot PLANT').press('Enter');
  await expect(page.getByRole('status').filter({ hasText: /Changed/ })).toBeVisible();
});

test('hire and contractors are listed separately from people and assets', async ({ page }) => {
  const waiting = page.getByRole('region', { name: 'Not on the roster' });
  await expect(waiting.getByRole('heading', { name: /Hire and contractors/ })).toBeVisible();
  await expect(waiting.locator('[data-tag="Hire Excavator"]')).toBeVisible();
});
