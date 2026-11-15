import { expect, test } from '@playwright/test';
import { clearMail, latestCode } from './mail';
import { signIn } from './support';

test('a platform admin signs in with an emailed code', async ({ page }) => {
  await clearMail('platform@example.com');
  await page.goto('/');
  await page.getByLabel('Email').fill('platform@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await page.getByLabel('Sign-in code').fill(await latestCode('platform@example.com'));
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Tenants' })).toBeVisible();
});

test('a wrong code is rejected', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('platform@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await page.getByLabel('Sign-in code').fill('000000');
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
  await expect(page.getByRole('button', { name: 'Send me a code' })).toBeVisible();
});
