import { expect, test } from '@playwright/test';

test('an operator linked to an asset shows on the board and in the message', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByLabel('Operator for Excavator #1').selectOption({ label: 'Chris Brown' });

  await page.getByRole('button', { name: 'Roster' }).click();
  await expect(page.locator('[data-tag="Excavator #1"]')).toContainText('Chris Brown');

  await page.locator('[data-tag="Excavator #1"]').dragTo(page.getByRole('cell', { name: 'River Road PLANT' }));
  await expect(page.getByRole('cell', { name: 'River Road PLANT' })).toContainText('Chris Brown');

  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('Excavator #1 (Chris Brown)');
});

test('removing the operator from the list clears the link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Manage' }).click();
  await page.getByLabel('Operator for Truck #23').selectOption({ label: 'Lisa Anderson' });
  await page.getByRole('button', { name: 'Remove Lisa Anderson' }).click();
  await expect(page.getByLabel('Operator for Truck #23')).toHaveValue('');
});
