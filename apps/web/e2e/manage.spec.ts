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

test('pasting a list adds every name and skips duplicates', async ({ page }) => {
  await page.getByRole('button', { name: 'Paste a list of team members' }).click();
  await page.getByLabel('Team member names, one per line').fill('Pat One\nPat Two\njohn smith\n\n');
  await page.getByRole('button', { name: 'Add all' }).click();

  await expect(page.getByText('Added 2, skipped 1 already in the list')).toBeVisible();
  const members = page.getByRole('region', { name: /^Team members/ });
  await expect(members.getByText('Pat One')).toBeVisible();
  await expect(members.getByText('Pat Two')).toBeVisible();
});

test('the same location can be added with different job numbers', async ({ page }) => {
  const add = async (name: string, jobNumber: string) => {
    await page.getByLabel('New location name').fill(name);
    await page.getByLabel('Job number (optional)').fill(jobNumber);
    await page.getByRole('button', { name: 'Add location' }).click();
  };
  await add('Irrawang', '14525');
  await add('Irrawang', '14526');
  await add('Irrawang', '14525');
  await expect(page.getByText('Irrawang 14525 is already in the list')).toBeVisible();

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('rowheader', { name: /Irrawang 14525/ })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: /Irrawang 14526/ })).toBeVisible();
});

test('pasting locations reads the job number after the comma', async ({ page }) => {
  await page.getByRole('button', { name: 'Paste a list of locations' }).click();
  await page.getByLabel(/Locations, one per line/).fill('Halifax to Harwood Sharedpath, 14510\nLTP Rd');
  await page.getByRole('button', { name: 'Add all' }).click();

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('rowheader', { name: /Halifax to Harwood Sharedpath 14510/ })).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'LTP Rd' })).toBeVisible();
});

test('editing a location changes its name, job number and note on the board', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit North Depot' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('North Depot Yard');
  await dialog.getByLabel('Job number').fill('14510');
  await dialog.getByLabel('Note').fill('6:00 RT depot');
  await dialog.getByRole('button', { name: 'Save location' }).click();

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  const header = page.getByRole('rowheader', { name: /North Depot Yard/ });
  await expect(header).toContainText('14510');
  await expect(header).toContainText('6:00 RT depot');
});

test('hire and contractors can be added and may repeat', async ({ page }) => {
  for (let i = 0; i < 2; i++) {
    await page.getByLabel('New hire item name').fill('Flynn');
    await page.getByRole('button', { name: 'Add hire item' }).click();
  }
  const hire = page.getByRole('region', { name: /^Hire and contractors/ });
  await expect(hire.getByText('Flynn')).toHaveCount(2);

  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Not on the roster' }).locator('[data-tag="Flynn"]')).toHaveCount(2);
});

test('an empty board tells the admin where to add things', async ({ page }) => {
  for (const name of ['North Depot', 'River Road', 'Park Street', 'Stockpile']) {
    await page.getByRole('button', { name: `Remove ${name}` }).click();
  }
  await page.getByRole('button', { name: 'Roster', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your board is empty' })).toBeVisible();
  await expect(page.getByText('Open Manage in the menu')).toBeVisible();
});
