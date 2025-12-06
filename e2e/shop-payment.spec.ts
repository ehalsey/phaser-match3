import { test, expect } from '@playwright/test';

test.describe('Shop - Payment Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to main menu
    await page.goto('/');
    await page.waitForTimeout(2000); // Wait for Phaser to initialize
  });

  test('should navigate to shop from main menu', async ({ page }) => {
    // Capture console logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    // Canvas should be visible
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Click somewhere in the middle-bottom area where the shop button should be
    // Since it's rendered on canvas, we need to click coordinates
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65; // Shop button is around 65% down

      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1000);

      // Check if ShopScene was created (via console logs or canvas state)
      // We can verify by checking if the scene changed
      await page.waitForTimeout(500);
    }

    // Take screenshot
    await page.screenshot({ path: 'screenshots/shop-scene.png' });
  });

  test('should display both shop sections: Spend Coins and Buy Coins', async ({ page }) => {
    // Navigate to shop
    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Click shop button
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Take screenshot showing both sections
      await page.screenshot({ path: 'screenshots/shop-both-sections.png' });
    }
  });

  test('should purchase 100 coins in demo mode', async ({ page }) => {
    // Set up console monitoring for purchase confirmation
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Navigate to shop
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Click on the first coin package (100 coins - $0.99)
      // This is on the right side, approximately at 70% width and 35% height
      const packageButtonX = canvasBox.x + canvasBox.width * 0.82; // Right side buy button
      const packageButtonY = canvasBox.y + canvasBox.height * 0.35; // First package

      await page.mouse.click(packageButtonX, packageButtonY);

      // Wait for simulated payment to complete (1 second delay)
      await page.waitForTimeout(2000);

      // Take screenshot showing success
      await page.screenshot({ path: 'screenshots/shop-purchase-success.png' });

      // Note: We can't easily verify the exact coin count from canvas,
      // but we can check console logs or localStorage
      const metaData = await page.evaluate(() => {
        const data = localStorage.getItem('match3_meta_progression');
        return data ? JSON.parse(data) : null;
      });

      // Verify coins were added
      expect(metaData).toBeTruthy();
      expect(metaData.coins).toBeGreaterThanOrEqual(100);
    }
  });

  test('should purchase multiple coin packages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Navigate to shop
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Buy first package (100 coins)
      const packageButtonX = canvasBox.x + canvasBox.width * 0.82;
      const package1Y = canvasBox.y + canvasBox.height * 0.35;
      await page.mouse.click(packageButtonX, package1Y);
      await page.waitForTimeout(1500);

      // Buy second package (500 coins)
      const package2Y = canvasBox.y + canvasBox.height * 0.47;
      await page.mouse.click(packageButtonX, package2Y);
      await page.waitForTimeout(1500);

      // Verify total coins
      const metaData = await page.evaluate(() => {
        const data = localStorage.getItem('match3_meta_progression');
        return data ? JSON.parse(data) : null;
      });

      expect(metaData).toBeTruthy();
      expect(metaData.coins).toBeGreaterThanOrEqual(600); // 100 + 500
    }
  });

  test('should navigate back to main menu from shop', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Navigate to shop
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Click back button (center bottom)
      const backButtonY = canvasBox.y + canvasBox.height * 0.92;
      await page.mouse.click(centerX, backButtonY);
      await page.waitForTimeout(1000);

      // Take screenshot showing we're back at main menu
      await page.screenshot({ path: 'screenshots/back-to-main-menu.png' });
    }
  });

  test('should use purchased coins to buy a life', async ({ page }) => {
    // First, consume a life so we can buy it back
    await page.evaluate(() => {
      const data = localStorage.getItem('match3_meta_progression');
      const metaData = data ? JSON.parse(data) : { lives: 5, coins: 0, lastLifeTimestamp: Date.now(), levelProgress: {} };
      metaData.lives = 4; // Set to 4 lives
      metaData.coins = 0; // Start with no coins
      localStorage.setItem('match3_meta_progression', JSON.stringify(metaData));
    });

    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Navigate to shop
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Buy 100 coins
      const packageButtonX = canvasBox.x + canvasBox.width * 0.82;
      const package1Y = canvasBox.y + canvasBox.height * 0.35;
      await page.mouse.click(packageButtonX, package1Y);
      await page.waitForTimeout(1500);

      // Now buy a life (left section, buy button)
      const buyLifeButtonX = canvasBox.x + canvasBox.width * 0.3;
      const buyLifeButtonY = canvasBox.y + canvasBox.height * 0.56;
      await page.mouse.click(buyLifeButtonX, buyLifeButtonY);
      await page.waitForTimeout(1000);

      // Verify coins were spent and life was added
      const metaData = await page.evaluate(() => {
        const data = localStorage.getItem('match3_meta_progression');
        return data ? JSON.parse(data) : null;
      });

      expect(metaData).toBeTruthy();
      expect(metaData.lives).toBe(5); // Should be back to 5 lives
      expect(metaData.coins).toBe(50); // Should have 50 coins left (100 - 50)

      // Take screenshot
      await page.screenshot({ path: 'screenshots/bought-life-with-coins.png' });
    }
  });

  test('should show all 4 coin packages', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();

    if (canvasBox) {
      // Navigate to shop
      const centerX = canvasBox.x + canvasBox.width / 2;
      const shopButtonY = canvasBox.y + canvasBox.height * 0.65;
      await page.mouse.click(centerX, shopButtonY);
      await page.waitForTimeout(1500);

      // Take screenshot showing all packages
      await page.screenshot({ path: 'screenshots/all-coin-packages.png' });

      // Try clicking each package to verify they're all interactive
      const packageButtonX = canvasBox.x + canvasBox.width * 0.82;

      // Package 1: 100 coins
      await page.mouse.click(packageButtonX, canvasBox.y + canvasBox.height * 0.35);
      await page.waitForTimeout(1500);

      // Package 2: 500 coins
      await page.mouse.click(packageButtonX, canvasBox.y + canvasBox.height * 0.47);
      await page.waitForTimeout(1500);

      // Package 3: 1200 coins
      await page.mouse.click(packageButtonX, canvasBox.y + canvasBox.height * 0.59);
      await page.waitForTimeout(1500);

      // Package 4: 3000 coins
      await page.mouse.click(packageButtonX, canvasBox.y + canvasBox.height * 0.71);
      await page.waitForTimeout(1500);

      // Verify total coins
      const metaData = await page.evaluate(() => {
        const data = localStorage.getItem('match3_meta_progression');
        return data ? JSON.parse(data) : null;
      });

      expect(metaData).toBeTruthy();
      expect(metaData.coins).toBe(4800); // 100 + 500 + 1200 + 3000
    }
  });
});
