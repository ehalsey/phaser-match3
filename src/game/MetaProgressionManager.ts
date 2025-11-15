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
}

export class MetaProgressionManager {
  private static instance: MetaProgressionManager;

  // Game constants
  private readonly MAX_LIVES = 5;
  private readonly LIFE_REGEN_TIME_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
  private readonly COINS_PER_LEVEL = 100;
  private readonly LIFE_COST_COINS = 50;
  private readonly STORAGE_KEY = 'match3_meta_progression';

  // Current state
  private lives: number;
  private coins: number;
  private lastLifeRegenTime: number;
  private currentLevel: number;

  // Singleton pattern
  private constructor() {
    this.lives = this.MAX_LIVES;
    this.coins = 0;
    this.lastLifeRegenTime = Date.now();
    this.currentLevel = 1;
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
   */
  public calculateLevelReward(score: number): number {
    // Base reward
    let coins = this.COINS_PER_LEVEL;

    // Bonus for high scores
    if (score >= 5000) {
      coins += 100; // +100 for excellent score
    } else if (score >= 2000) {
      coins += 50; // +50 for good score
    } else if (score >= 1000) {
      coins += 25; // +25 for decent score
    }

    return coins;
  }

  /**
   * Reward player for completing a level
   */
  public rewardLevelCompletion(score: number): number {
    const coinsEarned = this.calculateLevelReward(score);
    this.addCoins(coinsEarned);
    return coinsEarned;
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
      currentLevel: this.currentLevel
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
