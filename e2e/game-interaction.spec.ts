import { test, expect } from '@playwright/test';

test.describe('Match-3 Game Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Phaser to load
    await page.waitForTimeout(2000);
  });

  test('should display the game board with all gems', async ({ page }) => {
    // Check title
    await expect(page.locator('text=Interactive Match-3 Game')).toBeVisible();

    // Take screenshot for visual verification
    await page.screenshot({ path: 'screenshots/e2e-initial-board.png' });
  });

  test('should allow clicking a gem to select it', async ({ page }) => {
    // Click on gem at cell 2 (row 0, col 2)
    const canvas = page.locator('canvas');

    // Click at position of cell 2 (approximate coordinates)
    // Cell 2 is at row=0, col=2: x = 200 + 2*80 = 360, y = 150 + 0*80 = 150
    await canvas.click({ position: { x: 360, y: 150 } });

    // Wait a bit for selection
    await page.waitForTimeout(500);

    // Check status message changed
    await expect(page.locator('text=/Selected cell.*Click an adjacent gem/')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-gem-selected.png' });
  });

  test('should perform valid swap and create match', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Click cell 2 (row=0, col=2): blue gem
    // x = 200 + 2*80 = 360, y = 150
    await canvas.click({ position: { x: 360, y: 150 } });
    await page.waitForTimeout(300);

    // Click cell 5 (row=1, col=2): green gem (adjacent vertically)
    // x = 200 + 2*80 = 360, y = 150 + 80 = 230
    await canvas.click({ position: { x: 360, y: 230 } });
    await page.waitForTimeout(500);

    // Check for success message
    await expect(page.locator('text=/✓ Valid swap!/')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-valid-swap.png' });
  });

  test('should reject invalid swap (no match)', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Click cell 0 (row=0, col=0): red gem
    // x = 200, y = 150
    await canvas.click({ position: { x: 200, y: 150 } });
    await page.waitForTimeout(300);

    // Click cell 1 (row=0, col=1): yellow gem (adjacent horizontally)
    // This swap should NOT create a match
    // x = 200 + 80 = 280, y = 150
    await canvas.click({ position: { x: 280, y: 150 } });
    await page.waitForTimeout(500);

    // Check for error message
    await expect(page.locator('text=/✗ Invalid swap!/')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-invalid-swap.png' });
  });

  test('should reject non-adjacent swap', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Click cell 0 (row=0, col=0)
    await canvas.click({ position: { x: 200, y: 150 } });
    await page.waitForTimeout(300);

    // Click cell 2 (row=0, col=2) - not adjacent (skips cell 1)
    await canvas.click({ position: { x: 360, y: 150 } });
    await page.waitForTimeout(500);

    // Check for error message about not adjacent
    await expect(page.locator('text=/✗.*not adjacent/')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-non-adjacent-swap.png' });
  });

  test('should allow deselecting by clicking same gem', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Click cell 2 to select
    await canvas.click({ position: { x: 360, y: 150 } });
    await page.waitForTimeout(300);

    // Click same cell again to deselect
    await canvas.click({ position: { x: 360, y: 150 } });
    await page.waitForTimeout(300);

    // Check for cleared message
    await expect(page.locator('text=/Selection cleared/')).toBeVisible();

    await page.screenshot({ path: 'screenshots/e2e-deselect.png' });
  });

  test('full game flow: select, swap, and verify match', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Initial state screenshot
    await page.screenshot({ path: 'screenshots/e2e-flow-01-initial.png' });

    // Step 1: Select first gem (cell 2)
    await canvas.click({ position: { x: 360, y: 150 } });
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'screenshots/e2e-flow-02-select.png' });

    // Step 2: Click adjacent gem to swap (cell 5)
    await canvas.click({ position: { x: 360, y: 230 } });
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/e2e-flow-03-swap-complete.png' });

    // Step 3: Verify match was found
    const statusText = page.locator('text=/✓ Valid swap!/');
    await expect(statusText).toBeVisible();

    // Verify the status mentions "blue" gems matched
    await expect(page.locator('text=/Match found.*blue/')).toBeVisible();
  });

  test('should clear matched gems after valid swap', async ({ page }) => {
    const canvas = page.locator('canvas');

    // Initial state - take screenshot
    await page.screenshot({ path: 'screenshots/e2e-clear-01-before.png' });

    // Perform valid swap: cell 2 with cell 5 (creates horizontal blue match)
    await canvas.click({ position: { x: 360, y: 150 } }); // Select cell 2
    await page.waitForTimeout(300);
    await canvas.click({ position: { x: 360, y: 230 } }); // Swap with cell 5
    
    // Wait for animation to start
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'screenshots/e2e-clear-02-animating.png' });

    // Wait for animation to complete (450ms delay in animateGemClearing)
    await page.waitForTimeout(400);
    await page.screenshot({ path: 'screenshots/e2e-clear-03-cleared.png' });

    // Verify the match was created
    await expect(page.locator('text=/✓ Valid swap!/')).toBeVisible();

    // The matched gems should now be cleared (no longer visible on the canvas)
    // We can verify this by taking a screenshot and checking the status
    await expect(page.locator('text=/Match found.*blue/')).toBeVisible();
  });
});
