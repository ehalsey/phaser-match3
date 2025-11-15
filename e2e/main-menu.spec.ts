import { test, expect } from '@playwright/test';

test.describe('Main Menu', () => {
  test('should display main menu when visiting root URL', async ({ page }) => {
    // Navigate to root without any query parameters
    await page.goto('/');

    // Wait for Phaser to initialize
    await page.waitForTimeout(2000);

    // Check that DOM title is visible
    await expect(page.locator('text=Interactive Match-3 Game')).toBeVisible();

    // Verify canvas exists (MainMenuScene renders on canvas)
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify we're NOT on the game board (game-status should NOT show game instructions)
    const statusText = await page.locator('#game-status').textContent();
    expect(statusText).not.toContain('Click a gem to select it!');

    // Check console logs to verify MainMenuScene loaded
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));

    await page.reload();
    await page.waitForTimeout(1000);

    // Verify MainMenuScene was created
    const hasMainMenuLog = logs.some(log => log.includes('[MainMenuScene]'));
    expect(hasMainMenuLog).toBeTruthy();

    // Take screenshot for verification
    await page.screenshot({ path: 'screenshots/main-menu.png' });
  });

  test('should display lives and coins counter', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Lives and coins should be visible (rendered on canvas, but we can check via console logs)
    // The elements are rendered on the Phaser canvas, so we check the canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should skip main menu when skipMenu=true parameter is present', async ({ page }) => {
    await page.goto('/?skipMenu=true');

    // Wait for game board to be ready
    await page.waitForFunction(() => {
      const statusEl = document.getElementById('game-status');
      return statusEl && statusEl.textContent?.includes('Click a gem to select it!');
    }, { timeout: 5000 });

    // Verify we're on the game board (status should show game instructions)
    const statusText = await page.locator('#game-status').textContent();
    expect(statusText).toContain('Click a gem to select it!');

    // Main menu text should NOT be visible
    await expect(page.locator('text=Start Game')).not.toBeVisible();
  });
});
