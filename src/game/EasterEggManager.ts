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
   * Called when a gem is clicked/selected in the game
   * This is the preferred way to detect corner clicks - uses actual gem selection
   */
  public onGemClicked(row: number, col: number): void {
    if (!this.boardLayout) {
      return;
    }

    const { rows, cols } = this.boardLayout;
    const corner = this.getCornerFromCell(row, col, rows, cols);

    if (corner) {
      console.log(`[EasterEgg] Gem clicked at (${row}, ${col}) -> corner: ${corner}`);
      this.processCornerClick(corner);
    }
  }

  /**
   * Determine if a cell is a corner based on row/col
   */
  private getCornerFromCell(row: number, col: number, rows: number, cols: number): string | null {
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
   * Process a corner click for the secret sequence
   */
  private processCornerClick(corner: string): void {
    // Reset timeout on any corner click
    if (this.clickTimeout) {
      window.clearTimeout(this.clickTimeout);
    }

    console.log(`[EasterEgg] Corner sequence: got ${corner}, index ${this.clickSequenceIndex}, expected ${this.SECRET_CLICK_SEQUENCE[this.clickSequenceIndex]}`);

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
          console.log('[EasterEgg] Corner sequence timed out, resetting');
          this.clickSequenceIndex = 0;
        }, 3000);
      }
    } else {
      // Wrong corner, reset sequence
      console.log(`[EasterEgg] Wrong corner, resetting sequence`);
      this.clickSequenceIndex = 0;
    }
  }

  /**
   * Cleanup event listeners
   */
  public cleanup(): void {
    document.removeEventListener('keydown', this.handleKeyDown);
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.removeEventListener('click', this.handleCanvasClick);
    }
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
   * Uses canvas click detection to determine which cell was clicked
   */
  private setupSecretClickListener(): void {
    // Wait for canvas to be created, then attach listener
    this.setupCanvasClickListener();
  }

  /**
   * Setup click listener on canvas element (may not exist immediately)
   */
  private setupCanvasClickListener(): void {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', this.handleCanvasClick);
      console.log('[EasterEgg] Canvas click listener attached');
    } else {
      // Canvas doesn't exist yet, try again after a short delay
      setTimeout(() => this.setupCanvasClickListener(), 100);
    }
  }

  private handleCanvasClick = (event: MouseEvent): void => {
    if (!this.boardLayout) {
      return;
    }

    const { offsetX, offsetY, cellSize, rows, cols } = this.boardLayout;

    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Calculate which cell was clicked
    const col = Math.floor((canvasX - offsetX) / cellSize);
    const row = Math.floor((canvasY - offsetY) / cellSize);

    // Check if click is within board bounds
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      // Use onGemClicked to process the corner detection
      this.onGemClicked(row, col);
    }
  };

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
    // Show visual celebration
    this.showCelebration(eggName, message);

    if (this.onEasterEggActivated) {
      this.onEasterEggActivated(eggName, message);
    }
  }

  /**
   * Show a celebratory popup when an easter egg is found
   */
  private showCelebration(eggName: string, message: string): void {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'easter-egg-celebration';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease-out;
    `;

    // Create popup container
    const popup = document.createElement('div');
    popup.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 40px 60px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      animation: popIn 0.4s ease-out;
      max-width: 90%;
    `;

    // Get emoji and title based on egg type
    let emoji = '🎉';
    let title = 'Easter Egg Found!';
    if (eggName === 'wolf') {
      emoji = '🐺';
      title = 'WOLF MODE!';
    } else if (eggName === 'konami') {
      emoji = '🎮';
      title = 'KONAMI CODE!';
    } else if (eggName === 'secretClick') {
      emoji = '🔮';
      title = 'SECRET DISCOVERED!';
    } else if (eggName === 'date') {
      emoji = message.split(' ')[0]; // Get emoji from message
      title = 'HOLIDAY BONUS!';
    }

    popup.innerHTML = `
      <div style="font-size: 80px; margin-bottom: 20px; animation: bounce 0.6s ease infinite;">${emoji}</div>
      <h1 style="color: #fff; font-size: 32px; margin: 0 0 15px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">${title}</h1>
      <p style="color: #e0e0e0; font-size: 18px; margin: 0 0 25px 0;">${message}</p>
      <button id="easter-egg-close" style="
        background: #fff;
        color: #764ba2;
        border: none;
        padding: 12px 40px;
        font-size: 18px;
        font-weight: bold;
        border-radius: 25px;
        cursor: pointer;
        transition: transform 0.2s;
      ">Awesome!</button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes popIn {
        from { transform: scale(0.5); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      #easter-egg-close:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);

    // Close button handler
    const closeBtn = document.getElementById('easter-egg-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
        setTimeout(() => {
          overlay.remove();
          style.remove();
        }, 200);
      });
    }

    // Also close on overlay click (outside popup)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
        setTimeout(() => {
          overlay.remove();
          style.remove();
        }, 200);
      }
    });
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
