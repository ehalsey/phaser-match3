import { MetaProgressionManager } from '../MetaProgressionManager';

describe('MetaProgressionManager', () => {
  let manager: MetaProgressionManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset singleton instance
    MetaProgressionManager.resetInstance();

    // Get fresh instance
    manager = MetaProgressionManager.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should start with 5 lives', () => {
      expect(manager.getLives()).toBe(5);
    });

    it('should start with 0 coins', () => {
      expect(manager.getCoins()).toBe(0);
    });

    it('should return true for hasLives() initially', () => {
      expect(manager.hasLives()).toBe(true);
    });
  });

  describe('Lives Management', () => {
    it('should consume a life', () => {
      const result = manager.consumeLife();
      expect(result).toBe(true);
      expect(manager.getLives()).toBe(4);
    });

    it('should not consume life if at 0 lives', () => {
      // Consume all lives
      for (let i = 0; i < 5; i++) {
        manager.consumeLife();
      }

      // Try to consume one more
      const result = manager.consumeLife();
      expect(result).toBe(false);
      expect(manager.getLives()).toBe(0);
    });

    it('should add a life', () => {
      manager.consumeLife(); // Go to 4 lives
      manager.addLife();
      expect(manager.getLives()).toBe(5);
    });

    it('should not exceed max lives when adding', () => {
      manager.addLife(); // Try to add when already at max
      expect(manager.getLives()).toBe(5); // Should still be 5
    });

    it('should return false for hasLives() when at 0', () => {
      for (let i = 0; i < 5; i++) {
        manager.consumeLife();
      }
      expect(manager.hasLives()).toBe(false);
    });
  });

  describe('Coin Management', () => {
    it('should add coins', () => {
      manager.addCoins(100);
      expect(manager.getCoins()).toBe(100);

      manager.addCoins(50);
      expect(manager.getCoins()).toBe(150);
    });

    it('should spend coins successfully if enough balance', () => {
      manager.addCoins(100);
      const result = manager.spendCoins(50);

      expect(result).toBe(true);
      expect(manager.getCoins()).toBe(50);
    });

    it('should fail to spend coins if insufficient balance', () => {
      manager.addCoins(30);
      const result = manager.spendCoins(50);

      expect(result).toBe(false);
      expect(manager.getCoins()).toBe(30); // Should remain unchanged
    });
  });

  describe('Level Rewards', () => {
    it('should calculate base reward for low score', () => {
      const reward = manager.calculateLevelReward(500);
      expect(reward).toBe(20); // 1 star
    });

    it('should calculate good reward for medium score (1500+)', () => {
      const reward = manager.calculateLevelReward(1500);
      expect(reward).toBe(40); // 2 stars
    });

    it('should calculate excellent reward for high score (3000+)', () => {
      const reward = manager.calculateLevelReward(3000);
      expect(reward).toBe(60); // 3 stars
    });

    it('should calculate excellent reward for very high score', () => {
      const reward = manager.calculateLevelReward(6000);
      expect(reward).toBe(60); // Still 3 stars (max)
    });

    it('should reward level completion and add coins', () => {
      const coinsEarned = manager.rewardLevelCompletion(3000, 1);

      expect(coinsEarned).toBe(60); // 3000 score = 60 coins (3 stars)
      expect(manager.getCoins()).toBe(60);
      expect(manager.getLevelStars(1)).toBe(3); // Should store 3 stars
    });
  });

  describe('Shop - Buy Life', () => {
    it('should buy life with sufficient coins', () => {
      manager.addCoins(100);
      manager.consumeLife(); // Go to 4 lives

      const result = manager.buyLife();

      expect(result).toBe(true);
      expect(manager.getLives()).toBe(5);
      expect(manager.getCoins()).toBe(50); // 100 - 50 cost
    });

    it('should fail to buy life with insufficient coins', () => {
      manager.addCoins(30); // Less than 50 cost
      manager.consumeLife();

      const result = manager.buyLife();

      expect(result).toBe(false);
      expect(manager.getLives()).toBe(4); // Unchanged
      expect(manager.getCoins()).toBe(30); // Unchanged
    });

    it('should fail to buy life when already at max', () => {
      manager.addCoins(100);
      // Already at 5 lives

      const result = manager.buyLife();

      expect(result).toBe(false);
      expect(manager.getLives()).toBe(5);
      expect(manager.getCoins()).toBe(100); // Unchanged
    });
  });

  describe('Persistence', () => {
    it('should persist state to localStorage', () => {
      manager.addCoins(150);
      manager.consumeLife();
      manager.consumeLife();

      expect(manager.getLives()).toBe(3);
      expect(manager.getCoins()).toBe(150);

      // Create new instance (simulates page reload)
      MetaProgressionManager.resetInstance();
      const newManager = MetaProgressionManager.getInstance();

      expect(newManager.getLives()).toBe(3);
      expect(newManager.getCoins()).toBe(150);
    });

    it('should reset progress', () => {
      manager.addCoins(200);
      manager.consumeLife();
      manager.consumeLife();

      manager.resetProgress();

      expect(manager.getLives()).toBe(5);
      expect(manager.getCoins()).toBe(0);
    });
  });

  describe('Constants', () => {
    it('should return correct max lives', () => {
      expect(manager.getMaxLives()).toBe(5);
    });

    it('should return correct life cost', () => {
      expect(manager.getLifeCost()).toBe(50);
    });

    it('should return correct life regen time', () => {
      expect(manager.getLifeRegenTimeMs()).toBe(20 * 60 * 1000); // 20 minutes
    });
  });

  describe('Timer Formatting', () => {
    it('should format time correctly', () => {
      const formatted = manager.getTimeUntilNextLifeFormatted();
      // Should be in MM:SS format
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  describe('Lives Regeneration', () => {
    it('should return 0 time until next life when at max lives', () => {
      expect(manager.getLives()).toBe(5);
      expect(manager.getTimeUntilNextLife()).toBe(0);
    });

    it('should calculate time until next life correctly', () => {
      manager.consumeLife(); // Go to 4 lives
      const timeUntilNext = manager.getTimeUntilNextLife();

      // Should be approximately 20 minutes (allowing for test execution time)
      const twentyMinutes = 20 * 60 * 1000;
      expect(timeUntilNext).toBeGreaterThan(twentyMinutes - 100); // Within 100ms
      expect(timeUntilNext).toBeLessThanOrEqual(twentyMinutes);
    });

    it('should regenerate one life after 20 minutes', () => {
      // Consume a life
      manager.consumeLife();
      expect(manager.getLives()).toBe(4);

      // Mock time passing (20 minutes)
      const now = Date.now();
      const twentyMinutesLater = now + (20 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(twentyMinutesLater);

      // Get lives should trigger regeneration
      expect(manager.getLives()).toBe(5);

      jest.restoreAllMocks();
    });

    it('should regenerate multiple lives after long offline period', () => {
      // Consume 4 lives (down to 1)
      for (let i = 0; i < 4; i++) {
        manager.consumeLife();
      }
      expect(manager.getLives()).toBe(1);

      // Mock time passing (80 minutes = 4 lives worth)
      const now = Date.now();
      const eightyMinutesLater = now + (80 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(eightyMinutesLater);

      // Should regenerate all 4 lives
      expect(manager.getLives()).toBe(5);

      jest.restoreAllMocks();
    });

    it('should not exceed max lives when regenerating', () => {
      // Consume 3 lives (down to 2)
      for (let i = 0; i < 3; i++) {
        manager.consumeLife();
      }
      expect(manager.getLives()).toBe(2);

      // Mock time passing (100 minutes = 5 lives worth, more than needed)
      const now = Date.now();
      const hundredMinutesLater = now + (100 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(hundredMinutesLater);

      // Should cap at max lives (5)
      expect(manager.getLives()).toBe(5);

      jest.restoreAllMocks();
    });

    it('should partially regenerate if not enough time has passed', () => {
      // Consume 2 lives (down to 3)
      manager.consumeLife();
      manager.consumeLife();
      expect(manager.getLives()).toBe(3);

      // Mock time passing (15 minutes = not enough for 1 life)
      const now = Date.now();
      const fifteenMinutesLater = now + (15 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(fifteenMinutesLater);

      // Should not regenerate yet
      expect(manager.getLives()).toBe(3);

      jest.restoreAllMocks();
    });

    it('should preserve unused time after regeneration', () => {
      // Consume 2 lives (down to 3)
      manager.consumeLife();
      manager.consumeLife();
      expect(manager.getLives()).toBe(3);

      // Mock time passing (25 minutes = 1 life + 5 minutes extra)
      const now = Date.now();
      const twentyFiveMinutesLater = now + (25 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(twentyFiveMinutesLater);

      // Should regenerate 1 life (from 3 to 4)
      expect(manager.getLives()).toBe(4);

      // Time until next should be approximately 15 minutes (20 - 5 extra)
      const timeUntilNext = manager.getTimeUntilNextLife();
      const fifteenMinutes = 15 * 60 * 1000;
      expect(timeUntilNext).toBeGreaterThan(fifteenMinutes - 100);
      expect(timeUntilNext).toBeLessThanOrEqual(fifteenMinutes);

      jest.restoreAllMocks();
    });

    it('should persist regeneration state across reloads', () => {
      // Consume a life
      manager.consumeLife();
      expect(manager.getLives()).toBe(4);

      // Mock time passing (20 minutes)
      const now = Date.now();
      const twentyMinutesLater = now + (20 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(twentyMinutesLater);

      // Create new instance (simulates reload)
      MetaProgressionManager.resetInstance();
      const newManager = MetaProgressionManager.getInstance();

      // Should have regenerated on load
      expect(newManager.getLives()).toBe(5);

      jest.restoreAllMocks();
    });

    it('should handle system clock going backwards gracefully', () => {
      manager.consumeLife();
      expect(manager.getLives()).toBe(4);

      // Mock time going backwards (clock adjustment)
      const now = Date.now();
      const tenMinutesAgo = now - (10 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(tenMinutesAgo);

      // Should not regenerate or break
      expect(manager.getLives()).toBe(4);
      expect(manager.getTimeUntilNextLife()).toBeGreaterThan(0);

      jest.restoreAllMocks();
    });

    it('should format time string correctly at different intervals', () => {
      manager.consumeLife();

      // Just consumed, should be ~20 minutes
      let formatted = manager.getTimeUntilNextLifeFormatted();
      expect(formatted).toMatch(/^(19|20):\d{2}$/);

      // Mock 10 minutes passing
      const now = Date.now();
      const tenMinutesLater = now + (10 * 60 * 1000);
      jest.spyOn(Date, 'now').mockReturnValue(tenMinutesLater);

      formatted = manager.getTimeUntilNextLifeFormatted();
      expect(formatted).toMatch(/^(09|10):\d{2}$/);

      jest.restoreAllMocks();
    });
  });
});
