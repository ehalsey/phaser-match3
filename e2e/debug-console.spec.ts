import { test } from '@playwright/test';

test('capture console logs', async ({ page }) => {
  const logs: string[] = [];
  const errors: string[] = [];

  page.on('console', msg => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', error => {
    errors.push(`ERROR: ${error.message}`);
  });

  await page.goto('/');
  await page.waitForTimeout(3000);

  console.log('=== BROWSER CONSOLE LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== BROWSER ERRORS ===');
  errors.forEach(error => console.log(error));

  if (errors.length === 0) {
    console.log('No errors!');
  }
});
