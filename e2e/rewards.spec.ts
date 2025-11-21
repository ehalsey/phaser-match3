import { test, expect } from '@playwright/test';

test.describe('Coins and Star Rewards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for main menu
    await page.waitForSelector('text=Interactive Match-3 Game', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should display current coins and lives on main menu', async ({ page }) => {
    // Check that coins and lives are visible
    const coinsText = await page.locator('text=/💰\\s*\\d+/').textContent();
    const livesText = await page.locator('text=/❤️\\s*\\d+\\/5/').textContent();

    expect(coinsText).toBeTruthy();
    expect(livesText).toBeTruthy();

    await page.screenshot({ path: 'screenshots/e2e-rewards-main-menu.png' });
  });

  test('should display coin balance in journey map', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Navigate to journey map
    await canvas.click({ position: { x: 370, y: 300 } });
    await page.waitForTimeout(1000);

    // Coins should still be visible in journey map
    const coinsText = await page.locator('text=/💰\\s*\\d+/').textContent();
    expect(coinsText).toBeTruthy();

    await page.screenshot({ path: 'screenshots/e2e-rewards-journey-map.png' });
  });

  test('should award stars based on level performance', async ({ page }) => {
    // This test would require completing a level and checking star awards
    // It's complex because it needs to:
    // 1. Complete level objectives
    // 2. Navigate to end level screen
    // 3. Verify star awards

    // For now, placeholder demonstrating test structure
    await page.screenshot({ path: 'screenshots/e2e-rewards-stars-placeholder.png' });

    // TODO: Implement full level completion flow for star awards testing
  });

  test('should award coins based on level performance', async ({ page }) => {
    // Similar to stars test, requires completing a level
    // Coins awarded depend on score and stars earned

    await page.screenshot({ path: 'screenshots/e2e-rewards-coins-placeholder.png' });

    // TODO: Implement full level completion flow for coin awards testing
  });

  test('should display rewards in end level screen', async ({ page }) => {
    // Test that end level screen shows:
    // - Stars earned (1-3)
    // - Coins earned
    // - Final score

    await page.screenshot({ path: 'screenshots/e2e-rewards-end-screen-placeholder.png' });

    // TODO: Implement level completion to reach end screen
  });
});
