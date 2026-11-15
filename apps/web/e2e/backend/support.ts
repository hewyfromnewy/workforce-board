import type { Browser, Page } from '@playwright/test';
import { test } from '@playwright/test';

const labels: Record<string, string> = {
  'admin@example.com': 'Admin',
  'supervisor@example.com': 'Supervisor',
  'member@example.com': 'Team Member',
  'platform@example.com': 'No team',
};

export const signIn = async (page: Page, email: string) => {
  await page.goto('/');
  await page.getByRole('button', { name: `Sign in as ${labels[email]}` }).click();
};

export const uniqueDay = () => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = 2100 + Math.floor(Math.random() * 400);
  return `${year}-${pad(1 + Math.floor(Math.random() * 12))}-${pad(1 + Math.floor(Math.random() * 28))}`;
};

export const openDay = (page: Page, date: string) => page.getByLabel('Roster date').fill(date);

export const signedInPage = async (browser: Browser, email: string) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  await signIn(page, email);
  return page;
};
