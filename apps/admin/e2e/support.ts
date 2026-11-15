import type { Page } from '@playwright/test';

export const signIn = async (page: Page, email: string) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('demo-password-1');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
};
