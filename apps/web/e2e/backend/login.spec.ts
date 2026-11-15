import { expect, test } from '@playwright/test';
import { clearMail, latestCode } from './mail';

test('signing in with an emailed code', async ({ page }) => {
  await clearMail('member@example.com');
  await page.goto('/');
  await page.getByLabel('Email').fill('member@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await expect(page.getByText('we have sent it a 6-digit code')).toBeVisible();

  await page.getByLabel('Sign-in code').fill(await latestCode('member@example.com'));
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('You can view this roster but not change it.')).toBeVisible();
});

test('a wrong code is rejected', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('member@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await page.getByLabel('Sign-in code').fill('000000');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not right');
});

test('an unknown email gets the same message and cannot sign in', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('nobody@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await expect(page.getByText('we have sent it a 6-digit code')).toBeVisible();

  await page.getByLabel('Sign-in code').fill('123456');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('not right');
});

test('a different email can be chosen after asking for a code', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill('member@example.com');
  await page.getByRole('button', { name: 'Send me a code' }).click();
  await page.getByRole('button', { name: 'Use a different email' }).click();
  await expect(page.getByLabel('Email')).toBeVisible();
});
