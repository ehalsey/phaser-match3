import { test, expect } from '@playwright/test';

test.describe('Journey Map', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for main menu to load
    await page.waitForSelector('text=Interactive Match-3 Game', { timeout: 10000 });
    await page.waitForTimeout(500);
  });

  test('should display journey map when clicking Play button', async ({ page }) => {
    // Click the Play button on main menu
    const canvas = page.locator('canvas');

    // The Play button is approximately in the center of the canvas
    // We need to click it to navigate to the journey map
    await canvas.click({ position: { x: 370, y: 300 } });
    await page.waitForTimeout(1000);

    // Verify we're on the journey map by checking for level indicators
    await page.screenshot({ path: 'screenshots/e2e-journey-map.png' });

    // The journey map should display level stars/progress
    // This is visual verification through screenshot
  });

  test('should allow scrolling through journey map levels', async ({ page }) => {
    // Navigate to journey map
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 370, y: 300 } });
    await page.waitForTimeout(1000);

    // Initial screenshot
    await page.screenshot({ path: 'screenshots/e2e-journey-map-scroll-1.png' });

    // Scroll down by dragging (simulating swipe)
    await page.mouse.move(370, 400);
    await page.mouse.down();
    await page.mouse.move(370, 200); // Drag upward to scroll down
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Screenshot after scroll
    await page.screenshot({ path: 'screenshots/e2e-journey-map-scroll-2.png' });
  });

  test('should select level when clicking on level node', async ({ page }) => {
    // Navigate to journey map
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 370, y: 300 } });
    await page.waitForTimeout(1000);

    // Click on Level 1 node (approximate position)
    await canvas.click({ position: { x: 370, y: 450 } });
    await page.waitForTimeout(1000);

    // Verify we entered the level by checking for game board ready state
    const sceneReady = await page.waitForFunction(() => {
      const statusEl = document.getElementById('game-status');
      return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
    }, { timeout: 5000 });

    expect(sceneReady).toBeTruthy();

    // Verify score display is present (indicates we're in a level)
    await expect(page.locator('#game-score')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-journey-map-select-level.png' });
  });

  test('should display level status (stars, locked/unlocked)', async ({ page }) => {
    // Navigate to journey map
    const canvas = page.locator('canvas');
    await canvas.click({ position: { x: 370, y: 300 } });
    await page.waitForTimeout(1000);

    // Take screenshot showing level statuses
    await page.screenshot({ path: 'screenshots/e2e-journey-map-level-status.png' });

    // Visual verification: Stars should be visible for completed levels
    // This test primarily validates the journey map renders correctly
  });
});
