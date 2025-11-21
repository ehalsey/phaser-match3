import { test, expect } from '@playwright/test';

test.describe('Power-Ups and Special Gems', () => {
  test.beforeEach(async ({ page }) => {
    // Skip main menu for E2E tests
    await page.goto('/?skipMenu=true');

    // Wait for LevelScene to be ready
    await page.waitForFunction(() => {
      const statusEl = document.getElementById('game-status');
      return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
    }, { timeout: 10000 });

    // Give Phaser a moment to fully initialize
    await page.waitForTimeout(500);
  });

  test('should create horizontal rocket from 4-gem horizontal match', async ({ page }) => {
    // Note: This test requires a board configuration that allows a 4-gem horizontal match
    // With random board generation, we'll look for opportunities or skip if not available

    // TODO: Implement board state setup for reliable 4-gem match testing
    // For now, this is a placeholder that verifies rocket indicator appears (↔)

    const canvas = page.locator('canvas');
    await page.screenshot({ path: 'screenshots/e2e-powerup-initial.png' });

    // This test needs custom board configuration
    // We'll mark it as pending until we can set up deterministic board states
  });

  test('should create vertical rocket from 4-gem vertical match', async ({ page }) => {
    // Placeholder for vertical rocket creation test
    // TODO: Implement with custom board configuration
  });

  test('should create bomb from 5-gem match', async ({ page }) => {
    // Placeholder for bomb creation test
    // TODO: Implement with custom board configuration
  });

  test('should activate horizontal rocket when swapped', async ({ page }) => {
    // Placeholder for rocket activation test
    // TODO: Implement with custom board configuration
  });

  test('should activate bomb when swapped', async ({ page }) => {
    // Placeholder for bomb activation test
    // TODO: Implement with custom board configuration
  });

  test('should trigger chain reaction when rocket explodes another power-up', async ({ page }) => {
    // Placeholder for chain reaction test
    // TODO: Implement with custom board configuration
  });
});
