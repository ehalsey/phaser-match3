/**
 * MetaProgressionManager
 *
 * Manages the meta progression system including:
 * - Lives system with regeneration
 * - Currency (coins) tracking
 * - localStorage persistence
 */

export interface MetaProgressionState {
  lives: number;
  coins: number;
  lastLifeRegenTime: number; // Timestamp in milliseconds
  currentLevel: number;
  levelStars: Record<number, number>; // Level number -> stars earned (1-3)
  hammers: number; // Power-up inventory
}

export class MetaProgressionManager {
  private static instance: MetaProgressionManager;

  // Game constants
  private readonly MAX_LIVES = 5;
  private readonly LIFE_REGEN_TIME_MS = 20 * 60 * 1000; // 20 minutes in milliseconds
  private readonly LIFE_COST_COINS = 50;
  private readonly STORAGE_KEY = 'match3_meta_progression';

  // Shop prices
  private readonly SHOP_SINGLE_LIFE_COST = 10;
  private readonly SHOP_REFILL_LIVES_COST = 50;
  private readonly SHOP_SINGLE_HAMMER_COST = 20;
  private readonly SHOP_HAMMER_PACK_COST = 50;
  private readonly SHOP_HAMMER_PACK_SIZE = 3;

  // Current state
  private lives: number;
  private coins: number;
  private lastLifeRegenTime: number;
  private currentLevel: number;
  private levelStars: Record<number, number>;
  private hammers: number;

  // Singleton pattern
  private constructor() {
    this.lives = this.MAX_LIVES;
    this.coins = 0;
    this.lastLifeRegenTime = Date.now();
    this.currentLevel = 1;
    this.levelStars = {};
    this.hammers = 0;
    this.loadFromStorage();
  }

  public static getInstance(): MetaProgressionManager {
    if (!MetaProgressionManager.instance) {
      MetaProgressionManager.instance = new MetaProgressionManager();
    }
    return MetaProgressionManager.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    MetaProgressionManager.instance = null as any;
  }

  // === Lives Management ===

  /**
   * Get current number of lives
   */
  public getLives(): number {
    this.updateLivesFromRegen();
    return this.lives;
  }

  /**
   * Check if player has lives to play
   */
  public hasLives(): boolean {
    return this.getLives() > 0;
  }

  /**
   * Consume one life (when starting a level)
   * Returns true if successful, false if no lives available
   */
  public consumeLife(): boolean {
    if (!this.hasLives()) {
      return false;
    }

    this.lives--;
    this.lastLifeRegenTime = Date.now();
    this.saveToStorage();
    return true;
  }

  /**
   * Add one life (from regeneration or purchase)
   * Cannot exceed MAX_LIVES
   */
  public addLife(): void {
    if (this.lives < this.MAX_LIVES) {
      this.lives++;
      this.saveToStorage();
    }
  }

  /**
   * Get time until next life regeneration (in milliseconds)
   * Returns 0 if at max lives
   */
  public getTimeUntilNextLife(): number {
    if (this.lives >= this.MAX_LIVES) {
      return 0;
    }

    const timeSinceLastRegen = Date.now() - this.lastLifeRegenTime;
    const timeRemaining = this.LIFE_REGEN_TIME_MS - timeSinceLastRegen;
    return Math.max(0, timeRemaining);
  }

  /**
   * Update lives based on time elapsed (regeneration)
   * Called automatically by getLives()
   */
  private updateLivesFromRegen(): void {
    if (this.lives >= this.MAX_LIVES) {
      return; // Already at max
    }

    const timeSinceLastRegen = Date.now() - this.lastLifeRegenTime;
    const livesToAdd = Math.floor(timeSinceLastRegen / this.LIFE_REGEN_TIME_MS);

    if (livesToAdd > 0) {
      const newLives = Math.min(this.lives + livesToAdd, this.MAX_LIVES);
      const actualLivesAdded = newLives - this.lives;

      this.lives = newLives;
      this.lastLifeRegenTime += actualLivesAdded * this.LIFE_REGEN_TIME_MS;
      this.saveToStorage();
    }
  }

  /**
   * Purchase a life with coins
   * Returns true if successful, false if insufficient coins
   */
  public buyLife(): boolean {
    if (this.coins < this.LIFE_COST_COINS) {
      return false; // Not enough coins
    }

    if (this.lives >= this.MAX_LIVES) {
      return false; // Already at max lives
    }

    this.coins -= this.LIFE_COST_COINS;
    this.lives++;
    this.saveToStorage();
    return true;
  }

  // === Shop Purchase Methods ===

  /**
   * Purchase a single life from shop (10 coins)
   * Returns true if successful, false if insufficient coins or at max lives
   */
  public buySingleLife(): boolean {
    if (this.coins < this.SHOP_SINGLE_LIFE_COST) {
      return false; // Not enough coins
    }

    if (this.lives >= this.MAX_LIVES) {
      return false; // Already at max lives
    }

    this.coins -= this.SHOP_SINGLE_LIFE_COST;
    this.lives++;
    this.saveToStorage();
    return true;
  }

  /**
   * Refill all lives from shop (50 coins)
   * Returns true if successful, false if insufficient coins or already at max
   */
  public buyAllLives(): boolean {
    if (this.coins < this.SHOP_REFILL_LIVES_COST) {
      return false; // Not enough coins
    }

    if (this.lives >= this.MAX_LIVES) {
      return false; // Already at max lives
    }

    this.coins -= this.SHOP_REFILL_LIVES_COST;
    this.lives = this.MAX_LIVES;
    this.lastLifeRegenTime = Date.now(); // Reset regen timer
    this.saveToStorage();
    return true;
  }

  /**
   * Purchase a single hammer from shop (20 coins)
   * Returns true if successful, false if insufficient coins
   */
  public buySingleHammer(): boolean {
    if (this.coins < this.SHOP_SINGLE_HAMMER_COST) {
      return false; // Not enough coins
    }

    this.coins -= this.SHOP_SINGLE_HAMMER_COST;
    this.hammers++;
    this.saveToStorage();
    return true;
  }

  /**
   * Purchase a 3-pack of hammers from shop (50 coins)
   * Returns true if successful, false if insufficient coins
   */
  public buyHammerPack(): boolean {
    if (this.coins < this.SHOP_HAMMER_PACK_COST) {
      return false; // Not enough coins
    }

    this.coins -= this.SHOP_HAMMER_PACK_COST;
    this.hammers += this.SHOP_HAMMER_PACK_SIZE;
    this.saveToStorage();
    return true;
  }

  // === Hammer Management ===

  /**
   * Get current number of hammers
   */
  public getHammers(): number {
    return this.hammers;
  }

  /**
   * Use a hammer (consumes one from inventory)
   * Returns true if successful, false if no hammers available
   */
  public useHammer(): boolean {
    if (this.hammers <= 0) {
      return false;
    }

    this.hammers--;
    this.saveToStorage();
    return true;
  }

  /**
   * Add hammers to inventory (from rewards, etc.)
   */
  public addHammers(amount: number): void {
    this.hammers += amount;
    this.saveToStorage();
  }

  // === Shop Price Getters ===

  /**
   * Get price for single life in shop
   */
  public getShopSingleLifeCost(): number {
    return this.SHOP_SINGLE_LIFE_COST;
  }

  /**
   * Get price for refilling all lives
   */
  public getShopRefillLivesCost(): number {
    return this.SHOP_REFILL_LIVES_COST;
  }

  /**
   * Get price for single hammer
   */
  public getShopSingleHammerCost(): number {
    return this.SHOP_SINGLE_HAMMER_COST;
  }

  /**
   * Get price for hammer 3-pack
   */
  public getShopHammerPackCost(): number {
    return this.SHOP_HAMMER_PACK_COST;
  }

  /**
   * Get number of hammers in pack
   */
  public getShopHammerPackSize(): number {
    return this.SHOP_HAMMER_PACK_SIZE;
  }

  // === Currency Management ===

  /**
   * Get current coin balance
   */
  public getCoins(): number {
    return this.coins;
  }

  /**
   * Add coins to balance
   */
  public addCoins(amount: number): void {
    this.coins += amount;
    this.saveToStorage();
  }

  /**
   * Remove coins from balance
   * Returns true if successful, false if insufficient coins
   */
  public spendCoins(amount: number): boolean {
    if (this.coins < amount) {
      return false;
    }
    this.coins -= amount;
    this.saveToStorage();
    return true;
  }

  /**
   * Calculate coins earned from a level based on score
   * Returns fixed amounts: 20, 40, or 60 coins
   */
  public calculateLevelReward(score: number): number {
    // Fixed coin rewards based on score tiers
    if (score >= 3000) {
      return 60; // Excellent score
    } else if (score >= 1500) {
      return 40; // Good score
    } else {
      return 20; // Completed
    }
  }

  /**
   * Reward player for completing a level
   * Returns coins earned and updates star rating
   */
  public rewardLevelCompletion(score: number, levelNumber: number): number {
    const coinsEarned = this.calculateLevelReward(score);
    this.addCoins(coinsEarned);

    // Calculate and store star rating
    const stars = this.getStarsFromCoins(coinsEarned);
    this.setLevelStars(levelNumber, stars);

    return coinsEarned;
  }

  /**
   * Convert coins earned to star rating (1-3 stars)
   */
  private getStarsFromCoins(coins: number): number {
    if (coins >= 60) return 3;
    if (coins >= 40) return 2;
    return 1;
  }

  /**
   * Get star rating for a level (0 if not completed)
   */
  public getLevelStars(levelNumber: number): number {
    return this.levelStars[levelNumber] || 0;
  }

  /**
   * Set star rating for a level (only if better than current)
   */
  private setLevelStars(levelNumber: number, stars: number): void {
    const currentStars = this.levelStars[levelNumber] || 0;
    if (stars > currentStars) {
      this.levelStars[levelNumber] = stars;
      this.saveToStorage();
    }
  }

  // === Level Progression ===

  /**
   * Get current level number
   */
  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  /**
   * Advance to next level
   */
  public advanceToNextLevel(): void {
    this.currentLevel++;
    this.saveToStorage();
  }

  /**
   * Set current level (for testing or level selection)
   */
  public setCurrentLevel(level: number): void {
    this.currentLevel = Math.max(1, level);
    this.saveToStorage();
  }

  // === Persistence ===

  /**
   * Save current state to localStorage
   */
  private saveToStorage(): void {
    const state: MetaProgressionState = {
      lives: this.lives,
      coins: this.coins,
      lastLifeRegenTime: this.lastLifeRegenTime,
      currentLevel: this.currentLevel,
      levelStars: this.levelStars,
      hammers: this.hammers
    };

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[MetaProgression] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadFromStorage(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const state: MetaProgressionState = JSON.parse(saved);
        this.lives = state.lives;
        this.coins = state.coins;
        this.lastLifeRegenTime = state.lastLifeRegenTime;
        this.currentLevel = state.currentLevel || 1; // Default to 1 if not present
        this.levelStars = state.levelStars || {}; // Default to empty if not present
        this.hammers = state.hammers || 0; // Default to 0 if not present

        // Update lives based on time elapsed
        this.updateLivesFromRegen();
      }
    } catch (error) {
      console.error('[MetaProgression] Failed to load from localStorage:', error);
    }
  }

  /**
   * Reset all progress (for testing or new game)
   */
  public resetProgress(): void {
    this.lives = this.MAX_LIVES;
    this.coins = 0;
    this.lastLifeRegenTime = Date.now();
    this.currentLevel = 1;
    this.levelStars = {};
    this.hammers = 0;
    this.saveToStorage();
  }

  /**
   * Get max lives constant
   */
  public getMaxLives(): number {
    return this.MAX_LIVES;
  }

  /**
   * Get life cost in coins
   */
  public getLifeCost(): number {
    return this.LIFE_COST_COINS;
  }

  /**
   * Get life regeneration time in milliseconds
   */
  public getLifeRegenTimeMs(): number {
    return this.LIFE_REGEN_TIME_MS;
  }

  /**
   * Get formatted time string (MM:SS) until next life
   */
  public getTimeUntilNextLifeFormatted(): string {
    const ms = this.getTimeUntilNextLife();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
