import { test, expect } from '@playwright/test';

test.describe('Level Completion', () => {
  test.beforeEach(async ({ page }) => {
    // Skip menu and start directly in level
    await page.goto('/?skipMenu=true&board=test');

    // Wait for level to be ready
    await page.waitForFunction(() => {
      const statusEl = document.getElementById('game-status');
      return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
    }, { timeout: 10000 });

    await page.waitForTimeout(500);
  });

  test('should display level objectives (moves and gem goals)', async ({ page }) => {
    // Check that objectives are visible
    await expect(page.locator('#game-moves')).toBeVisible();
    await expect(page.locator('#game-target')).toBeVisible();
    await expect(page.locator('#game-progress-container')).toBeVisible();

    // Initial moves should be 20
    await expect(page.locator('#game-moves')).toHaveText('Moves: 20');

    // Take screenshot showing objectives
    await page.screenshot({ path: 'screenshots/e2e-level-objectives.png' });
  });

  test('should decrement moves counter after valid swap', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Check initial moves
    await expect(page.locator('#game-moves')).toHaveText('Moves: 20');

    // Perform valid swap (cell 2 to cell 5)
    await canvas.click({ position: { x: 210, y: 150 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 210, y: 230 } });
    await page.waitForTimeout(1000);

    // Moves should decrease to 19
    await expect(page.locator('#game-moves')).toHaveText('Moves: 19');

    await page.screenshot({ path: 'screenshots/e2e-level-moves-decrement.png' });
  });

  test('should update gem goal progress after collecting gems', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Take screenshot of initial progress
    await page.screenshot({ path: 'screenshots/e2e-level-progress-1.png' });

    // Get initial progress text
    const initialProgress = await page.locator('#game-target').textContent();

    // Perform valid swap to collect gems
    await canvas.click({ position: { x: 210, y: 150 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 210, y: 230 } });
    await page.waitForTimeout(1500); // Wait for animations

    // Get updated progress text
    const updatedProgress = await page.locator('#game-target').textContent();

    // Progress should have changed
    expect(updatedProgress).not.toBe(initialProgress);

    await page.screenshot({ path: 'screenshots/e2e-level-progress-2.png' });
  });

  test('should update progress bar as goals are met', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Get initial progress bar width
    const progressBar = page.locator('#game-progress-bar');
    const initialWidth = await progressBar.evaluate(el => el.style.width);

    // Perform swap to make progress
    await canvas.click({ position: { x: 210, y: 150 } });
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 210, y: 230 } });
    await page.waitForTimeout(1500);

    // Progress bar should have increased
    const updatedWidth = await progressBar.evaluate(el => el.style.width);

    // Parse percentages and verify increase
    const initialPercent = parseFloat(initialWidth.replace('%', ''));
    const updatedPercent = parseFloat(updatedWidth.replace('%', ''));

    expect(updatedPercent).toBeGreaterThan(initialPercent);

    await page.screenshot({ path: 'screenshots/e2e-level-progress-bar.png' });
  });

  test('should show level complete screen when objectives met', async ({ page }) => {
    // This test requires completing all objectives
    // It's a visual test that would need many swaps or a special test level
    // For now, this is a placeholder demonstrating the test structure

    await page.screenshot({ path: 'screenshots/e2e-level-objectives-tracking.png' });

    // TODO: Set up test scenario where level can be completed quickly
  });

  test('should show level failed screen when running out of moves', async ({ page }) => {
    // This test requires burning through all 20 moves without completing objectives
    // It's a visual test that would need invalid swaps or a special test scenario

    await page.screenshot({ path: 'screenshots/e2e-level-moves-tracking.png' });

    // TODO: Set up test scenario for level failure
  });
});
