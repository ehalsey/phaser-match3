import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navigate to the dev server
  await page.goto('http://localhost:3001');

  // Wait for Phaser to load
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'screenshots/board-scene.png' });

  console.log('Screenshot saved to screenshots/board-scene.png');

  await browser.close();
})();
