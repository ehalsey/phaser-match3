/**
 * StripeService
 *
 * Handles payment processing for coin purchases using Stripe.
 *
 * IMPORTANT: This is a DEMO/TEST implementation for development purposes.
 *
 * For PRODUCTION use, you MUST:
 * 1. Set up a backend server to create Stripe checkout sessions
 * 2. Store your Stripe secret key on the server (NEVER in client code)
 * 3. Implement webhook handlers to verify payment completion
 * 4. Credit coins only after verifying payment via webhook
 *
 * Test Mode Setup:
 * 1. Create a free Stripe account at https://stripe.com
 * 2. Get your TEST publishable key from the Stripe Dashboard
 * 3. Replace STRIPE_PUBLISHABLE_KEY_TEST with your test key
 * 4. Use Stripe test cards (e.g., 4242 4242 4242 4242) for testing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

// DEMO ONLY: Replace with your Stripe TEST publishable key
// Get it from: https://dashboard.stripe.com/test/apikeys
const STRIPE_PUBLISHABLE_KEY_TEST = 'pk_test_YOUR_TEST_KEY_HERE';

// Coin packages available for purchase
export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  priceUSD: number;
  priceDisplay: string;
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'coins_100',
    name: '100 Coins',
    coins: 100,
    priceUSD: 0.99,
    priceDisplay: '$0.99'
  },
  {
    id: 'coins_500',
    name: '500 Coins',
    coins: 500,
    priceUSD: 3.99,
    priceDisplay: '$3.99'
  },
  {
    id: 'coins_1200',
    name: '1,200 Coins',
    coins: 1200,
    priceUSD: 7.99,
    priceDisplay: '$7.99'
  },
  {
    id: 'coins_3000',
    name: '3,000 Coins',
    coins: 3000,
    priceUSD: 14.99,
    priceDisplay: '$14.99'
  }
];

export class StripeService {
  private static instance: StripeService;
  private stripe: Stripe | null = null;
  private metaManager: MetaProgressionManager;

  private constructor() {
    this.metaManager = MetaProgressionManager.getInstance();
    this.initializeStripe();
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    StripeService.instance = null as any;
  }

  /**
   * Initialize Stripe with the publishable key
   */
  private async initializeStripe(): Promise<void> {
    try {
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY_TEST);
      if (!this.stripe) {
        console.error('[StripeService] Failed to load Stripe');
      }
    } catch (error) {
      console.error('[StripeService] Error loading Stripe:', error);
    }
  }

  /**
   * Check if Stripe is properly configured
   */
  public isConfigured(): boolean {
    return STRIPE_PUBLISHABLE_KEY_TEST !== 'pk_test_YOUR_TEST_KEY_HERE';
  }

  /**
   * DEMO ONLY: Simulate a payment flow
   *
   * In production, this would:
   * 1. Call your backend to create a Stripe checkout session
   * 2. Redirect to Stripe's hosted checkout page
   * 3. User enters payment details on Stripe's secure page
   * 4. Stripe redirects back to your site
   * 5. Your backend webhook verifies payment and credits coins
   *
   * For this demo, we'll simulate the successful payment flow.
   */
  public async purchaseCoins(packageId: string): Promise<{
    success: boolean;
    message: string;
    coinsAdded?: number;
  }> {
    const coinPackage = COIN_PACKAGES.find(pkg => pkg.id === packageId);

    if (!coinPackage) {
      return {
        success: false,
        message: 'Invalid package selected'
      };
    }

    // Check if Stripe is configured
    if (!this.isConfigured()) {
      console.warn('[StripeService] Stripe not configured - see StripeService.ts for setup instructions');

      // DEMO MODE: Simulate successful payment for testing
      return this.simulatePayment(coinPackage);
    }

    // Production flow would be:
    // 1. Call backend API to create checkout session
    // 2. Redirect to Stripe checkout
    // 3. Handle success/cancel callbacks

    // For now, show instructions for real integration
    return {
      success: false,
      message: 'Payment system ready for backend integration. See docs for setup.'
    };
  }

  /**
   * DEMO ONLY: Simulate a successful payment
   * This is for testing the UI flow without a real payment
   */
  private simulatePayment(coinPackage: CoinPackage): Promise<{
    success: boolean;
    message: string;
    coinsAdded?: number;
  }> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        // Credit the coins
        this.metaManager.addCoins(coinPackage.coins);

        resolve({
          success: true,
          message: `Successfully purchased ${coinPackage.coins} coins! (DEMO MODE)`,
          coinsAdded: coinPackage.coins
        });
      }, 1000);
    });
  }

  /**
   * Get all available coin packages
   */
  public getCoinPackages(): CoinPackage[] {
    return COIN_PACKAGES;
  }

  // PRODUCTION NOTE: When implementing real Stripe integration, you'll need to:
  // 1. Create a backend API endpoint to create Stripe checkout sessions
  // 2. Call that endpoint from here to get a session ID
  // 3. Use stripe.redirectToCheckout() or Stripe Elements for the payment flow
  // 4. Implement webhook handlers to verify payments and credit coins
  //
  // For now, this demo uses simulated payments for testing the UI flow.
}
