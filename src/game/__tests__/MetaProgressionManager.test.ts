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
      expect(reward).toBe(100); // Base reward
    });

    it('should calculate bonus reward for decent score (1000+)', () => {
      const reward = manager.calculateLevelReward(1500);
      expect(reward).toBe(125); // Base 100 + 25 bonus
    });

    it('should calculate bonus reward for good score (2000+)', () => {
      const reward = manager.calculateLevelReward(3000);
      expect(reward).toBe(150); // Base 100 + 50 bonus
    });

    it('should calculate bonus reward for excellent score (5000+)', () => {
      const reward = manager.calculateLevelReward(6000);
      expect(reward).toBe(200); // Base 100 + 100 bonus
    });

    it('should reward level completion and add coins', () => {
      const coinsEarned = manager.rewardLevelCompletion(3000);

      expect(coinsEarned).toBe(150); // Good score bonus
      expect(manager.getCoins()).toBe(150);
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
      expect(manager.getLifeRegenTimeMs()).toBe(30 * 60 * 1000); // 30 minutes
    });
  });

  describe('Timer Formatting', () => {
    it('should format time correctly', () => {
      const formatted = manager.getTimeUntilNextLifeFormatted();
      // Should be in MM:SS format
      expect(formatted).toMatch(/^\d{2}:\d{2}$/);
    });
  });
});
