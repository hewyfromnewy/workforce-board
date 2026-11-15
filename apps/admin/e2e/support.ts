import type { Page } from '@playwright/test';

const labels: Record<string, string> = {
  'platform@example.com': 'Platform admin',
  'admin@example.com': 'Tenant admin (no access)',
};

export const signIn = async (page: Page, email: string) => {
  await page.goto('/');
  await page.getByRole('button', { name: `Sign in as ${labels[email]}` }).click();
};
