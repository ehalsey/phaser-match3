import { StripeService, COIN_PACKAGES } from '../StripeService';
import { MetaProgressionManager } from '../../game/MetaProgressionManager';

// Mock @stripe/stripe-js
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn().mockResolvedValue({
    // Mock Stripe object (not used in demo mode)
  })
}));

describe('StripeService', () => {
  let stripeService: StripeService;
  let metaManager: MetaProgressionManager;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();

    // Reset singleton instances
    StripeService.resetInstance();
    MetaProgressionManager.resetInstance();

    // Get fresh instances
    stripeService = StripeService.getInstance();
    metaManager = MetaProgressionManager.getInstance();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = StripeService.getInstance();
      const instance2 = StripeService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', () => {
      const instance1 = StripeService.getInstance();
      StripeService.resetInstance();
      const instance2 = StripeService.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Coin Packages', () => {
    it('should return all available coin packages', () => {
      const packages = stripeService.getCoinPackages();
      expect(packages).toEqual(COIN_PACKAGES);
      expect(packages).toHaveLength(4);
    });

    it('should have correct package structure', () => {
      const packages = stripeService.getCoinPackages();

      packages.forEach(pkg => {
        expect(pkg).toHaveProperty('id');
        expect(pkg).toHaveProperty('name');
        expect(pkg).toHaveProperty('coins');
        expect(pkg).toHaveProperty('priceUSD');
        expect(pkg).toHaveProperty('priceDisplay');
      });
    });

    it('should have expected coin packages', () => {
      const packages = stripeService.getCoinPackages();

      expect(packages[0]).toMatchObject({
        id: 'coins_100',
        coins: 100,
        priceUSD: 0.99,
        priceDisplay: '$0.99'
      });

      expect(packages[1]).toMatchObject({
        id: 'coins_500',
        coins: 500,
        priceUSD: 3.99,
        priceDisplay: '$3.99'
      });

      expect(packages[2]).toMatchObject({
        id: 'coins_1200',
        coins: 1200,
        priceUSD: 7.99,
        priceDisplay: '$7.99'
      });

      expect(packages[3]).toMatchObject({
        id: 'coins_3000',
        coins: 3000,
        priceUSD: 14.99,
        priceDisplay: '$14.99'
      });
    });
  });

  describe('Configuration', () => {
    it('should report as not configured in demo mode', () => {
      // Default key is 'pk_test_YOUR_TEST_KEY_HERE'
      expect(stripeService.isConfigured()).toBe(false);
    });
  });

  describe('Purchase Coins - Demo Mode', () => {
    it('should successfully purchase 100 coins package', async () => {
      const initialCoins = metaManager.getCoins();

      const result = await stripeService.purchaseCoins('coins_100');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully purchased 100 coins');
      expect(result.message).toContain('DEMO MODE');
      expect(result.coinsAdded).toBe(100);
      expect(metaManager.getCoins()).toBe(initialCoins + 100);
    });

    it('should successfully purchase 500 coins package', async () => {
      const initialCoins = metaManager.getCoins();

      const result = await stripeService.purchaseCoins('coins_500');

      expect(result.success).toBe(true);
      expect(result.coinsAdded).toBe(500);
      expect(metaManager.getCoins()).toBe(initialCoins + 500);
    });

    it('should successfully purchase 1200 coins package', async () => {
      const initialCoins = metaManager.getCoins();

      const result = await stripeService.purchaseCoins('coins_1200');

      expect(result.success).toBe(true);
      expect(result.coinsAdded).toBe(1200);
      expect(metaManager.getCoins()).toBe(initialCoins + 1200);
    });

    it('should successfully purchase 3000 coins package', async () => {
      const initialCoins = metaManager.getCoins();

      const result = await stripeService.purchaseCoins('coins_3000');

      expect(result.success).toBe(true);
      expect(result.coinsAdded).toBe(3000);
      expect(metaManager.getCoins()).toBe(initialCoins + 3000);
    });

    it('should fail with invalid package ID', async () => {
      const initialCoins = metaManager.getCoins();

      const result = await stripeService.purchaseCoins('invalid_package');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid package selected');
      expect(result.coinsAdded).toBeUndefined();
      expect(metaManager.getCoins()).toBe(initialCoins); // Unchanged
    });

    it('should accumulate coins from multiple purchases', async () => {
      await stripeService.purchaseCoins('coins_100');
      await stripeService.purchaseCoins('coins_500');

      expect(metaManager.getCoins()).toBe(600);
    });

    it('should simulate network delay (takes ~1 second)', async () => {
      const startTime = Date.now();

      await stripeService.purchaseCoins('coins_100');

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should take approximately 1000ms (with some tolerance)
      expect(duration).toBeGreaterThanOrEqual(900);
      expect(duration).toBeLessThan(1500);
    });
  });

  describe('Integration with MetaProgressionManager', () => {
    it('should credit coins through MetaProgressionManager', async () => {
      // Start with some coins
      metaManager.addCoins(50);
      expect(metaManager.getCoins()).toBe(50);

      // Purchase more coins
      await stripeService.purchaseCoins('coins_100');

      // Should have 150 total
      expect(metaManager.getCoins()).toBe(150);
    });

    it('should allow buying life with purchased coins', async () => {
      // Purchase coins
      await stripeService.purchaseCoins('coins_100');
      expect(metaManager.getCoins()).toBe(100);

      // Consume a life
      metaManager.consumeLife();
      expect(metaManager.getLives()).toBe(4);

      // Buy life with purchased coins (costs 50)
      const success = metaManager.buyLife();
      expect(success).toBe(true);
      expect(metaManager.getLives()).toBe(5);
      expect(metaManager.getCoins()).toBe(50); // 100 - 50
    });
  });
});
