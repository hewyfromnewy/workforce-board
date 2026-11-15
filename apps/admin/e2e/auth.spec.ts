import { expect, test } from '@playwright/test';
import { signIn } from './support';

test('a wrong password shows an error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('platform@example.com');
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not right');
});

test('a tenant admin is refused', async ({ page }) => {
  await signIn(page, 'admin@example.com');
  await expect(page.getByRole('heading', { name: 'No access' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0);
});

test('signing out returns to the login page', async ({ page }) => {
  await signIn(page, 'platform@example.com');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
});
