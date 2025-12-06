/**
 * EasterEggManager
 *
 * Manages easter eggs and cheat codes for the game.
 * Includes URL parameters, Konami code, click sequences, and date-based surprises.
 */

import { MetaProgressionManager } from './MetaProgressionManager';
import { PowerUpManager, PowerUpType } from './PowerUpManager';

export interface EasterEggStatus {
  wolfMode: boolean;
  konamiMode: boolean;
  secretClickMode: boolean;
  dateBonus: string | null;
  activated: string[];
}

export interface BoardLayout {
  offsetX: number;
  offsetY: number;
  cellSize: number;
  rows: number;
  cols: number;
}

export class EasterEggManager {
  private static instance: EasterEggManager;

  // Wolf mode bonuses
  private readonly WOLF_COINS = 99999;
  private readonly WOLF_HAMMERS = 99;

  // Konami code bonuses
  private readonly KONAMI_COINS = 500;
  private readonly KONAMI_HAMMERS = 10;

  // Secret click bonuses
  private readonly SECRET_CLICK_COINS = 250;
  private readonly SECRET_CLICK_HAMMERS = 5;

  // Date-based bonuses
  private readonly DATE_BONUS_COINS = 100;
  private readonly DATE_BONUS_HAMMERS = 3;

  // Konami code sequence: ↑ ↑ ↓ ↓ ← → ← → B A
  private readonly KONAMI_CODE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
  ];
  private konamiIndex = 0;
  private konamiTimeout: number | null = null;

  // Secret click sequence: click corner cells in order (TL, TR, BR, BL, TL)
  private readonly SECRET_CLICK_SEQUENCE = ['TL', 'TR', 'BR', 'BL', 'TL'];
  private clickSequenceIndex = 0;
  private clickTimeout: number | null = null;

  // Board layout for corner cell detection
  private boardLayout: BoardLayout | null = null;

  // Track which easter eggs are active
  private wolfMode = false;
  private konamiMode = false;
  private secretClickMode = false;
  private dateBonus: string | null = null;
  private activatedEggs: string[] = [];

  // Callback for visual effects
  private onEasterEggActivated: ((eggName: string, message: string) => void) | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): EasterEggManager {
    if (!EasterEggManager.instance) {
      EasterEggManager.instance = new EasterEggManager();
    }
    return EasterEggManager.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    if (EasterEggManager.instance) {
      EasterEggManager.instance.cleanup();
    }
    EasterEggManager.instance = null as any;
  }

  /**
   * Set callback for when easter eggs are activated (for visual feedback)
   */
  public setActivationCallback(callback: (eggName: string, message: string) => void): void {
    this.onEasterEggActivated = callback;
  }

  /**
   * Initialize all easter egg listeners
   * Should be called during game initialization
   * @param boardLayout - Optional board layout for corner cell detection
   */
  public initialize(boardLayout?: BoardLayout): void {
    if (boardLayout) {
      this.boardLayout = boardLayout;
    }
    this.checkURLParams();
    this.checkDateBonuses();
    this.setupKonamiCodeListener();
    this.setupSecretClickListener();
    console.log('[EasterEgg] Easter egg system initialized');
  }

  /**
   * Set board layout for corner cell detection
   * Can be called after initialization if board dimensions change
   */
  public setBoardLayout(layout: BoardLayout): void {
    this.boardLayout = layout;
    console.log(`[EasterEgg] Board layout set: ${layout.cols}x${layout.rows} at (${layout.offsetX}, ${layout.offsetY})`);
  }

  /**
   * Cleanup event listeners
   */
  public cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('click', this.handleClick);
    if (this.konamiTimeout) {
      window.clearTimeout(this.konamiTimeout);
    }
    if (this.clickTimeout) {
      window.clearTimeout(this.clickTimeout);
    }
  }

  // === URL Parameter Easter Eggs ===

  /**
   * Check URL parameters and activate any easter eggs
   */
  public checkURLParams(): void {
    const urlParams = new URLSearchParams(window.location.search);

    // Check for wolf=true parameter
    if (urlParams.get('wolf') === 'true') {
      this.activateWolfMode();
    }
  }

  /**
   * Activate wolf mode - grants max resources for testing/fun
   */
  public activateWolfMode(): void {
    if (this.wolfMode) {
      console.log('[EasterEgg] Wolf mode already active!');
      return;
    }

    console.log('[EasterEgg] 🐺 WOLF MODE ACTIVATED! 🐺');

    const metaManager = MetaProgressionManager.getInstance();
    const powerUpManager = PowerUpManager.getInstance();

    // Grant massive coins
    metaManager.addCoins(this.WOLF_COINS);
    console.log(`[EasterEgg] Granted ${this.WOLF_COINS} coins`);

    // Max out lives
    const currentLives = metaManager.getLives();
    const maxLives = metaManager.getMaxLives();
    const livesToAdd = maxLives - currentLives;
    for (let i = 0; i < livesToAdd; i++) {
      metaManager.addLife();
    }
    console.log(`[EasterEgg] Lives set to maximum (${maxLives})`);

    // Grant hammers
    powerUpManager.add(PowerUpType.HAMMER, this.WOLF_HAMMERS);
    console.log(`[EasterEgg] Granted ${this.WOLF_HAMMERS} hammers`);

    this.wolfMode = true;
    this.activatedEggs.push('wolf');

    console.log('[EasterEgg] 🐺 You are now in god mode! Have fun! 🐺');
    this.notifyActivation('wolf', '🐺 WOLF MODE! God mode activated!');
  }

  // === Konami Code Easter Egg ===

  /**
   * Setup keyboard listener for Konami code
   */
  private setupKonamiCodeListener(): void {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private handleKeyDown = (event: KeyboardEvent): void => {
    // Reset timeout on any key press
    if (this.konamiTimeout) {
      window.clearTimeout(this.konamiTimeout);
    }

    // Check if the key matches the expected key in sequence
    if (event.code === this.KONAMI_CODE[this.konamiIndex]) {
      this.konamiIndex++;

      // Check if sequence complete
      if (this.konamiIndex === this.KONAMI_CODE.length) {
        this.activateKonamiCode();
        this.konamiIndex = 0;
      } else {
        // Set timeout to reset sequence after 2 seconds of inactivity
        this.konamiTimeout = window.setTimeout(() => {
          this.konamiIndex = 0;
        }, 2000);
      }
    } else {
      // Wrong key, reset sequence
      this.konamiIndex = 0;
    }
  };

  /**
   * Activate Konami code bonus
   */
  private activateKonamiCode(): void {
    if (this.konamiMode) {
      console.log('[EasterEgg] Konami code already activated this session!');
      return;
    }

    console.log('[EasterEgg] 🎮 KONAMI CODE ACTIVATED! 🎮');
    console.log('[EasterEgg] ↑ ↑ ↓ ↓ ← → ← → B A');

    const metaManager = MetaProgressionManager.getInstance();
    const powerUpManager = PowerUpManager.getInstance();

    // Grant bonus coins
    metaManager.addCoins(this.KONAMI_COINS);
    console.log(`[EasterEgg] Granted ${this.KONAMI_COINS} coins`);

    // Grant bonus hammers
    powerUpManager.add(PowerUpType.HAMMER, this.KONAMI_HAMMERS);
    console.log(`[EasterEgg] Granted ${this.KONAMI_HAMMERS} hammers`);

    this.konamiMode = true;
    this.activatedEggs.push('konami');

    console.log('[EasterEgg] 🎮 Classic cheat code nostalgia! 🎮');
    this.notifyActivation('konami', '🎮 KONAMI CODE! +500 coins, +10 hammers!');
  }

  // === Secret Click Sequence Easter Egg ===

  /**
   * Setup click listener for secret corner sequence
   */
  private setupSecretClickListener(): void {
    this.handleClick = this.handleClick.bind(this);
    document.addEventListener('click', this.handleClick);
  }

  private handleClick = (event: MouseEvent): void => {
    // Reset timeout on any click
    if (this.clickTimeout) {
      window.clearTimeout(this.clickTimeout);
    }

    const corner = this.getCorner(event.clientX, event.clientY);
    if (!corner) {
      // Click not in a corner, reset sequence
      this.clickSequenceIndex = 0;
      return;
    }

    // Check if the corner matches the expected corner in sequence
    if (corner === this.SECRET_CLICK_SEQUENCE[this.clickSequenceIndex]) {
      this.clickSequenceIndex++;

      // Check if sequence complete
      if (this.clickSequenceIndex === this.SECRET_CLICK_SEQUENCE.length) {
        this.activateSecretClick();
        this.clickSequenceIndex = 0;
      } else {
        // Set timeout to reset sequence after 3 seconds of inactivity
        this.clickTimeout = window.setTimeout(() => {
          this.clickSequenceIndex = 0;
        }, 3000);
      }
    } else {
      // Wrong corner, reset sequence
      this.clickSequenceIndex = 0;
    }
  };

  /**
   * Determine which corner cell of the board was clicked
   * Returns null if board layout not set or click is not on a corner cell
   */
  private getCorner(x: number, y: number): string | null {
    if (!this.boardLayout) {
      return null;
    }

    const { offsetX, offsetY, cellSize, rows, cols } = this.boardLayout;

    // Get the canvas element to calculate offset from page
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      return null;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const canvasX = x - canvasRect.left;
    const canvasY = y - canvasRect.top;

    // Calculate which cell was clicked (if any)
    const col = Math.floor((canvasX - offsetX) / cellSize);
    const row = Math.floor((canvasY - offsetY) / cellSize);

    // Check if click is within the board bounds
    if (col < 0 || col >= cols || row < 0 || row >= rows) {
      return null;
    }

    // Check if click is on a corner cell
    const isTopRow = row === 0;
    const isBottomRow = row === rows - 1;
    const isLeftCol = col === 0;
    const isRightCol = col === cols - 1;

    if (isTopRow && isLeftCol) return 'TL';
    if (isTopRow && isRightCol) return 'TR';
    if (isBottomRow && isRightCol) return 'BR';
    if (isBottomRow && isLeftCol) return 'BL';

    return null;
  }

  /**
   * Activate secret click sequence bonus
   */
  private activateSecretClick(): void {
    if (this.secretClickMode) {
      console.log('[EasterEgg] Secret click already activated this session!');
      return;
    }

    console.log('[EasterEgg] 🔮 SECRET CLICK SEQUENCE ACTIVATED! 🔮');
    console.log('[EasterEgg] You found the hidden corner pattern!');

    const metaManager = MetaProgressionManager.getInstance();
    const powerUpManager = PowerUpManager.getInstance();

    // Grant bonus coins
    metaManager.addCoins(this.SECRET_CLICK_COINS);
    console.log(`[EasterEgg] Granted ${this.SECRET_CLICK_COINS} coins`);

    // Grant bonus hammers
    powerUpManager.add(PowerUpType.HAMMER, this.SECRET_CLICK_HAMMERS);
    console.log(`[EasterEgg] Granted ${this.SECRET_CLICK_HAMMERS} hammers`);

    this.secretClickMode = true;
    this.activatedEggs.push('secretClick');

    console.log('[EasterEgg] 🔮 You have keen eyes! 🔮');
    this.notifyActivation('secretClick', '🔮 SECRET FOUND! +250 coins, +5 hammers!');
  }

  // === Date-Based Easter Eggs ===

  /**
   * Check for special date bonuses
   */
  public checkDateBonuses(): void {
    const today = new Date();
    const month = today.getMonth() + 1; // 0-indexed
    const day = today.getDate();

    let bonusName: string | null = null;
    let emoji = '';
    let message = '';

    // Check for special dates
    if (month === 1 && day === 1) {
      bonusName = 'newYear';
      emoji = '🎆';
      message = 'Happy New Year!';
    } else if (month === 2 && day === 14) {
      bonusName = 'valentine';
      emoji = '💝';
      message = "Happy Valentine's Day!";
    } else if (month === 3 && day === 17) {
      bonusName = 'stPatrick';
      emoji = '☘️';
      message = "Happy St. Patrick's Day!";
    } else if (month === 4 && day === 1) {
      bonusName = 'aprilFools';
      emoji = '🃏';
      message = "April Fools' Day!";
    } else if (month === 7 && day === 4) {
      bonusName = 'independence';
      emoji = '🎆';
      message = 'Happy 4th of July!';
    } else if (month === 10 && day === 31) {
      bonusName = 'halloween';
      emoji = '🎃';
      message = 'Happy Halloween!';
    } else if (month === 12 && day === 25) {
      bonusName = 'christmas';
      emoji = '🎄';
      message = 'Merry Christmas!';
    } else if (month === 12 && day === 31) {
      bonusName = 'newYearsEve';
      emoji = '🥳';
      message = "Happy New Year's Eve!";
    }

    if (bonusName) {
      this.activateDateBonus(bonusName, emoji, message);
    }
  }

  /**
   * Activate date-based bonus
   */
  private activateDateBonus(bonusName: string, emoji: string, message: string): void {
    // Check if already activated today (using localStorage)
    const storageKey = `easterEgg_date_${bonusName}_${new Date().toDateString()}`;
    if (localStorage.getItem(storageKey)) {
      console.log(`[EasterEgg] ${message} bonus already claimed today!`);
      return;
    }

    console.log(`[EasterEgg] ${emoji} ${message} ${emoji}`);
    console.log('[EasterEgg] Special date bonus activated!');

    const metaManager = MetaProgressionManager.getInstance();
    const powerUpManager = PowerUpManager.getInstance();

    // Grant bonus coins
    metaManager.addCoins(this.DATE_BONUS_COINS);
    console.log(`[EasterEgg] Granted ${this.DATE_BONUS_COINS} coins`);

    // Grant bonus hammers
    powerUpManager.add(PowerUpType.HAMMER, this.DATE_BONUS_HAMMERS);
    console.log(`[EasterEgg] Granted ${this.DATE_BONUS_HAMMERS} hammers`);

    // Mark as claimed for today
    localStorage.setItem(storageKey, 'true');

    this.dateBonus = bonusName;
    this.activatedEggs.push(`date:${bonusName}`);

    console.log(`[EasterEgg] ${emoji} Enjoy your special day bonus! ${emoji}`);
    this.notifyActivation('date', `${emoji} ${message} +100 coins, +3 hammers!`);
  }

  // === Utility Methods ===

  /**
   * Notify activation callback if set
   */
  private notifyActivation(eggName: string, message: string): void {
    if (this.onEasterEggActivated) {
      this.onEasterEggActivated(eggName, message);
    }
  }

  /**
   * Check if wolf mode is active
   */
  public isWolfModeActive(): boolean {
    return this.wolfMode;
  }

  /**
   * Check if Konami code is active
   */
  public isKonamiModeActive(): boolean {
    return this.konamiMode;
  }

  /**
   * Check if secret click is active
   */
  public isSecretClickModeActive(): boolean {
    return this.secretClickMode;
  }

  /**
   * Get current date bonus name (if any)
   */
  public getDateBonus(): string | null {
    return this.dateBonus;
  }

  /**
   * Get status of all easter eggs
   */
  public getStatus(): EasterEggStatus {
    return {
      wolfMode: this.wolfMode,
      konamiMode: this.konamiMode,
      secretClickMode: this.secretClickMode,
      dateBonus: this.dateBonus,
      activated: [...this.activatedEggs]
    };
  }

  /**
   * Deactivate all easter eggs (useful for testing)
   */
  public deactivateAll(): void {
    this.wolfMode = false;
    this.konamiMode = false;
    this.secretClickMode = false;
    this.dateBonus = null;
    this.activatedEggs = [];
    this.konamiIndex = 0;
    this.clickSequenceIndex = 0;
    console.log('[EasterEgg] All easter eggs deactivated');
  }
}
