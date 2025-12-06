/**
 * PowerUpManager
 *
 * Manages the player's power-up inventory and usage across levels.
 * Power-ups are items that can be used during gameplay to help complete objectives.
 *
 * Features:
 * - Persistent inventory (saved to localStorage)
 * - Multiple power-up types
 * - Usage tracking
 */

export enum PowerUpType {
  HAMMER = 'hammer',  // Removes a single selected gem
  // Future power-ups can be added here:
  // SWAP = 'swap',     // Swap any two gems
  // SHUFFLE = 'shuffle', // Shuffle the entire board
}

export interface PowerUpInventory {
  [PowerUpType.HAMMER]: number;
}

interface PowerUpState {
  inventory: PowerUpInventory;
}

export class PowerUpManager {
  private static instance: PowerUpManager;
  private readonly STORAGE_KEY = 'match3_powerups';

  private inventory: PowerUpInventory;

  private constructor() {
    // Initialize with default inventory
    this.inventory = {
      [PowerUpType.HAMMER]: 3  // Start with 3 free hammers
    };

    // Load saved state
    this.loadState();
  }

  public static getInstance(): PowerUpManager {
    if (!PowerUpManager.instance) {
      PowerUpManager.instance = new PowerUpManager();
    }
    return PowerUpManager.instance;
  }

  /**
   * Reset the singleton instance (for testing purposes)
   */
  public static resetInstance(): void {
    PowerUpManager.instance = null as any;
  }

  /**
   * Get the count of a specific power-up
   */
  public getCount(type: PowerUpType): number {
    return this.inventory[type] || 0;
  }

  /**
   * Check if player has any of a specific power-up
   */
  public has(type: PowerUpType): boolean {
    return this.getCount(type) > 0;
  }

  /**
   * Add power-ups to inventory
   */
  public add(type: PowerUpType, count: number = 1): void {
    this.inventory[type] = (this.inventory[type] || 0) + count;
    this.saveState();
  }

  /**
   * Use a power-up (decrements count)
   * Returns true if successfully used, false if none available
   */
  public use(type: PowerUpType): boolean {
    if (!this.has(type)) {
      return false;
    }

    this.inventory[type]--;
    this.saveState();
    return true;
  }

  /**
   * Get all power-up counts
   */
  public getInventory(): PowerUpInventory {
    return { ...this.inventory };
  }

  /**
   * Get display name for a power-up type
   */
  public getDisplayName(type: PowerUpType): string {
    const names: Record<PowerUpType, string> = {
      [PowerUpType.HAMMER]: 'Hammer'
    };
    return names[type];
  }

  /**
   * Get description for a power-up type
   */
  public getDescription(type: PowerUpType): string {
    const descriptions: Record<PowerUpType, string> = {
      [PowerUpType.HAMMER]: 'Remove any single gem from the board'
    };
    return descriptions[type];
  }

  /**
   * Reset inventory to defaults (useful for testing/debugging)
   */
  public resetInventory(): void {
    this.inventory = {
      [PowerUpType.HAMMER]: 3
    };
    this.saveState();
  }

  /**
   * Save current state to localStorage
   */
  private saveState(): void {
    try {
      const state: PowerUpState = {
        inventory: this.inventory
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[PowerUpManager] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load state from localStorage
   */
  private loadState(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const state: PowerUpState = JSON.parse(saved);
        this.inventory = state.inventory;
      }
    } catch (error) {
      console.error('[PowerUpManager] Failed to load from localStorage:', error);
    }
  }
}
