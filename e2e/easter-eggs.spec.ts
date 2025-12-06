import { test, expect } from '@playwright/test';

test.describe('Easter Eggs', () => {
  test.describe('Wolf Mode (URL parameter)', () => {
    test('should activate wolf mode with ?wolf=true', async ({ page }) => {
      // Navigate directly with wolf=true parameter (fresh page, no prior state)
      await page.goto('/?wolf=true&skipMenu=true&board=test');

      // Wait for game to initialize
      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      // Wait a bit for easter egg to process and save
      await page.waitForTimeout(500);

      // Verify wolf mode activated by checking EasterEggManager status
      const wolfActivated = await page.evaluate(() => {
        // Access the global EasterEggManager instance
        return (window as any).easterEggManager?.isWolfModeActive?.() ?? false;
      });

      // Verify resources were granted by checking MetaProgressionManager
      const coins = await page.evaluate(() => {
        const saved = localStorage.getItem('match3_meta_progression');
        if (saved) {
          const state = JSON.parse(saved);
          return state.coins;
        }
        return 0;
      });

      // Wolf mode grants 99999 coins
      expect(coins).toBeGreaterThanOrEqual(99999);

      await page.screenshot({ path: 'screenshots/e2e-easter-egg-wolf-mode.png' });
    });
  });

  test.describe('Konami Code', () => {
    test('should activate konami code easter egg', async ({ page }) => {
      // Set up console message capture
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await page.goto('/?skipMenu=true&board=test');

      // Wait for game to initialize
      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      await page.waitForTimeout(500);

      // Get initial coin count
      const initialCoins = await page.evaluate(() => {
        const saved = localStorage.getItem('match3_meta_progression');
        if (saved) {
          const state = JSON.parse(saved);
          return state.coins;
        }
        return 0;
      });

      // Enter Konami code: ↑ ↑ ↓ ↓ ← → ← → B A
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('b');
      await page.keyboard.press('a');

      // Wait for activation
      await page.waitForTimeout(500);

      // Verify Konami code activated via console message
      const konamiActivated = consoleMessages.some(msg => msg.includes('KONAMI CODE ACTIVATED'));
      expect(konamiActivated).toBe(true);

      // Verify coins increased (Konami grants 500 coins)
      const finalCoins = await page.evaluate(() => {
        const saved = localStorage.getItem('match3_meta_progression');
        if (saved) {
          const state = JSON.parse(saved);
          return state.coins;
        }
        return 0;
      });

      expect(finalCoins).toBe(initialCoins + 500);

      await page.screenshot({ path: 'screenshots/e2e-easter-egg-konami.png' });
    });

    test('should reset konami sequence on wrong key', async ({ page }) => {
      // Set up console message capture
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await page.goto('/?skipMenu=true&board=test');

      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      await page.waitForTimeout(500);

      // Enter partial konami code with wrong key in middle
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('x'); // Wrong key - should reset
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('b');
      await page.keyboard.press('a');

      await page.waitForTimeout(500);

      // Konami code should NOT have activated
      const konamiActivated = consoleMessages.some(msg => msg.includes('KONAMI CODE ACTIVATED'));
      expect(konamiActivated).toBe(false);
    });
  });

  test.describe('Secret Corner Click', () => {
    test('should activate secret corner click easter egg', async ({ page }) => {
      // Set up console message capture BEFORE navigation
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      // Use test board (4x3) for predictable corner positions
      await page.goto('/?skipMenu=true&board=test');

      // Wait for game to initialize
      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      // Wait for canvas click listener to be attached
      await page.waitForTimeout(1000);

      // Get initial coin count
      const initialCoins = await page.evaluate(() => {
        const saved = localStorage.getItem('match3_meta_progression');
        if (saved) {
          const state = JSON.parse(saved);
          return state.coins;
        }
        return 0;
      });

      const canvas = page.locator('canvas');

      // Board layout for test board (3 cols x 4 rows):
      // - offsetX: 50, offsetY: 150, cellSize: 80
      // - Top-left cell (row=0, col=0): x=50+40=90, y=150+40=190
      // - Top-right cell (row=0, col=2): x=50+2*80+40=250, y=190
      // - Bottom-right cell (row=3, col=2): x=250, y=150+3*80+40=430
      // - Bottom-left cell (row=3, col=0): x=90, y=430

      // Click corners in sequence: TL -> TR -> BR -> BL -> TL
      await canvas.click({ position: { x: 90, y: 190 } });   // Top-left (col=0, row=0)
      await page.waitForTimeout(300);
      await canvas.click({ position: { x: 250, y: 190 } });  // Top-right (col=2, row=0)
      await page.waitForTimeout(300);
      await canvas.click({ position: { x: 250, y: 430 } });  // Bottom-right (col=2, row=3)
      await page.waitForTimeout(300);
      await canvas.click({ position: { x: 90, y: 430 } });   // Bottom-left (col=0, row=3)
      await page.waitForTimeout(300);
      await canvas.click({ position: { x: 90, y: 190 } });   // Top-left again

      // Wait for activation
      await page.waitForTimeout(500);

      // Log all easter egg messages as proof
      const easterEggMessages = consoleMessages.filter(m => m.includes('[EasterEgg]'));
      console.log('=== EASTER EGG CONSOLE OUTPUT ===');
      easterEggMessages.forEach(m => console.log(m));
      console.log('=================================');

      // Verify coins increased (Secret click grants 250 coins)
      const finalCoins = await page.evaluate(() => {
        const saved = localStorage.getItem('match3_meta_progression');
        if (saved) {
          const state = JSON.parse(saved);
          return state.coins;
        }
        return 0;
      });

      // Check if coins increased by 250
      expect(finalCoins).toBe(initialCoins + 250);

      await page.screenshot({ path: 'screenshots/e2e-easter-egg-corner-click.png' });
    });

    test('should reset corner sequence on non-corner click', async ({ page }) => {
      // Set up console message capture
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await page.goto('/?skipMenu=true&board=test');

      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      await page.waitForTimeout(500);

      const canvas = page.locator('canvas');

      // Start sequence but click center cell to reset
      await canvas.click({ position: { x: 90, y: 190 } });   // Top-left
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: 330, y: 190 } });  // Top-right
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: 210, y: 270 } });  // Center cell - resets sequence
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: 90, y: 350 } });   // Bottom-left
      await page.waitForTimeout(200);
      await canvas.click({ position: { x: 90, y: 190 } });   // Top-left

      await page.waitForTimeout(500);

      // Secret click should NOT have activated
      const secretActivated = consoleMessages.some(msg => msg.includes('SECRET CLICK SEQUENCE ACTIVATED'));
      expect(secretActivated).toBe(false);
    });
  });

  test.describe('Easter egg only activates once per session', () => {
    test('konami code should only work once', async ({ page }) => {
      // Set up console message capture
      const consoleMessages: string[] = [];
      page.on('console', msg => consoleMessages.push(msg.text()));

      await page.goto('/?skipMenu=true&board=test');

      await page.waitForFunction(() => {
        const statusEl = document.getElementById('game-status');
        return statusEl && statusEl.getAttribute('data-scene-ready') === 'true';
      }, { timeout: 10000 });

      await page.waitForTimeout(500);

      // Enter Konami code first time
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('b');
      await page.keyboard.press('a');

      await page.waitForTimeout(500);

      // Count how many times Konami was activated
      const firstActivationCount = consoleMessages.filter(msg => msg.includes('KONAMI CODE ACTIVATED')).length;
      expect(firstActivationCount).toBe(1);

      // Enter Konami code second time
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('b');
      await page.keyboard.press('a');

      await page.waitForTimeout(500);

      // Should still only be 1 activation (second attempt ignored)
      const secondActivationCount = consoleMessages.filter(msg => msg.includes('KONAMI CODE ACTIVATED')).length;
      expect(secondActivationCount).toBe(1);

      // Should see "already activated" message
      const alreadyActivated = consoleMessages.some(msg => msg.includes('already activated'));
      expect(alreadyActivated).toBe(true);
    });
  });
});
