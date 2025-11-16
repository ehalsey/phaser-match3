import Phaser from 'phaser';
import { Board, BombCreation, Gem, GemType, Position, TriggeredGem, SpecialGemType } from '../game/Board';
import { BoardConfig } from '../game/BoardConfig';
import { LevelObjectives, LevelStatus } from '../game/LevelObjectives';
import { LevelSettings } from '../game/LevelConfig';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

interface GemSprite {
  circle: any; // Phaser.GameObjects.Circle type not exported correctly
  text: Phaser.GameObjects.Text;
  bombIndicator?: Phaser.GameObjects.Text; // Star indicator for bomb gems
  row: number;
  col: number;
}

export class LevelScene extends Phaser.Scene {
  private board!: Board;
  private gemSprites: Map<string, GemSprite> = new Map();
  private selectedGem: Position | null = null;
  private selectionIndicator: Phaser.GameObjects.Rectangle | null = null;
  private score: number = 0;
  private objectives!: LevelObjectives;
  private objectivesEnabled: boolean = true;
  private levelNumber: number = 1;
  private levelSettings!: LevelSettings;
  public continuationAttempts: number = 0;

  private readonly CELL_SIZE = 80;
  private readonly BOARD_OFFSET_X = 50;  // Match main.ts
  private readonly BOARD_OFFSET_Y = 150;

  // Color mapping for gems
  private readonly GEM_COLORS: Record<GemType, number> = {
    red: 0xe74c3c,
    blue: 0x3498db,
    green: 0x2ecc71,
    yellow: 0xf1c40f,
    purple: 0x9b59b6,
    orange: 0xe67e22
  };

  constructor() {
    super({ key: 'LevelScene' });
  }

  init(data: { levelNumber?: number, levelSettings?: LevelSettings }): void {
    this.levelNumber = data.levelNumber || 1;
    this.continuationAttempts = 0; // Reset for new level
    this.levelSettings = data.levelSettings || {
      levelNumber: 1,
      difficulty: 'medium' as any,
      moves: 20,
      gemGoals: [
        { color: 'red', target: 30, current: 0 }
      ],
      boardRows: 8,
      boardCols: 8,
      colorCount: 5
    };

    // Reset score for new level
    this.score = 0;
  }

  create(): void {
    console.log('[LevelScene] create() called');
    console.log('[LevelScene] Level number:', this.levelNumber);

    // Consume a life when starting the level
    const metaManager = MetaProgressionManager.getInstance();
    metaManager.consumeLife();

    // Show objectives UI (hidden by default in HTML)
    const objectivesDiv = document.getElementById('game-objectives');
    const progressDiv = document.getElementById('game-progress-container');
    if (objectivesDiv) objectivesDiv.style.display = 'flex';
    if (progressDiv) progressDiv.style.display = 'block';

    // Get URL params for test configuration
    const urlParams = new URLSearchParams(window.location.search);
    const skipObjectives = urlParams.get('skipObjectives') === 'true';

    this.objectivesEnabled = !skipObjectives;

    // Note: Lives are now consumed on level FAILURE, not at start

    // Set up keyboard input for showing cell IDs
    this.input.keyboard?.on('keydown-SHIFT', () => {
      this.showAllCellIds(true);
    });

    this.input.keyboard?.on('keyup-SHIFT', () => {
      this.showAllCellIds(false);
    });

    // Get board configuration from URL params or use default
    const config = BoardConfig.fromURL();

    // Create board instance with configured dimensions
    this.board = new Board(config.rows, config.cols);

    // For default 4x3 board, use test configuration
    // For other sizes, generate random board without matches
    if (config.rows === 4 && config.cols === 3) {
      // Initialize with test configuration - TWO manual test scenarios:
      //
      // SCENARIO 1 - HORIZONTAL MATCH:
      //   Swap cell 2 (blue) ↔ cell 5 (green)
      //   Result: 3 blues horizontally in row 1 (cells 2, 3, 4)
      //
      // SCENARIO 2 - VERTICAL MATCH:
      //   Swap cell 7 (orange) ↔ cell 10 (blue)
      //   Result: 3 blues vertically in column 1 (cells 1, 4, 7)
      //
      const testConfig: (GemType | null)[][] = [
        ['red', 'blue', 'blue'],      // Row 0: cells 0, 1, 2
        ['blue', 'blue', 'green'],    // Row 1: cells 3, 4, 5
        ['purple', 'orange', 'red'],  // Row 2: cells 6, 7, 8
        ['yellow', 'blue', 'orange']  // Row 3: cells 9, 10, 11
      ];

      this.board.initializeWithConfig(testConfig);
    } else {
      // Generate random board without initial matches
      this.generateRandomBoard();
    }

    // Setup console API for runtime configuration
    BoardConfig.setupConsoleAPI();

    // Initialize level objectives only if enabled (use level settings)
    if (this.objectivesEnabled) {
      this.objectives = new LevelObjectives(
        this.levelSettings.moves,
        this.levelSettings.gemGoals
      );
      this.updateObjectivesDisplay();
    }

    // Draw the board
    this.drawBoard();

    // Add navigation buttons
    this.createNavigationButtons();

    // Initialize score display
    this.updateScore();

    // Log helpful info
    console.log(`[Game] Board initialized: ${config.rows}x${config.cols}`);
    console.log('[Game] Try: gameConfig.listPresets() to see available boards');

    // Signal that scene is ready for E2E tests
    const domStatus = document.getElementById('game-status');
    if (domStatus) {
      domStatus.setAttribute('data-scene-ready', 'true');
      domStatus.textContent = '';
    }
  }

  private createNavigationButtons(): void {
    const { width } = this.scale;
    const centerX = width / 2;

    // Small icon buttons positioned below title (centered, side by side)
    const buttonSize = 35;
    const buttonSpacing = 50;
    const buttonY = 30; // Top of canvas, below HTML title

    // Back to Map button (left)
    const mapButton = this.add.circle(centerX - buttonSpacing / 2, buttonY, buttonSize / 2, 0x3498db);
    mapButton.setStrokeStyle(2, 0x2980b9);
    mapButton.setInteractive({ useHandCursor: true });
    mapButton.setScrollFactor(0);
    mapButton.setDepth(1000);

    const mapText = this.add.text(centerX - buttonSpacing / 2, buttonY, '←', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    mapText.setScrollFactor(0);
    mapText.setDepth(1001);

    // Main Menu button (right)
    const menuButton = this.add.circle(centerX + buttonSpacing / 2, buttonY, buttonSize / 2, 0x95a5a6);
    menuButton.setStrokeStyle(2, 0x7f8c8d);
    menuButton.setInteractive({ useHandCursor: true });
    menuButton.setScrollFactor(0);
    menuButton.setDepth(1000);

    const menuText = this.add.text(centerX + buttonSpacing / 2, buttonY, '⌂', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    menuText.setScrollFactor(0);
    menuText.setDepth(1001);

    // Hover effects for Map button
    mapButton.on('pointerover', () => {
      mapButton.setFillStyle(0x2980b9);
      mapButton.setScale(1.05);
      mapText.setScale(1.05);
    });

    mapButton.on('pointerout', () => {
      mapButton.setFillStyle(0x3498db);
      mapButton.setScale(1.0);
      mapText.setScale(1.0);
    });

    mapButton.on('pointerdown', () => {
      // Hide objectives UI when leaving
      const objectivesDiv = document.getElementById('game-objectives');
      const progressDiv = document.getElementById('game-progress-container');
      if (objectivesDiv) objectivesDiv.style.display = 'none';
      if (progressDiv) progressDiv.style.display = 'none';

      this.scene.start('JourneyMapScene');
    });

    // Hover effects for Menu button
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x7f8c8d);
      menuButton.setScale(1.05);
      menuText.setScale(1.05);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x95a5a6);
      menuButton.setScale(1.0);
      menuText.setScale(1.0);
    });

    menuButton.on('pointerdown', () => {
      // Hide objectives UI when leaving
      const objectivesDiv = document.getElementById('game-objectives');
      const progressDiv = document.getElementById('game-progress-container');
      if (objectivesDiv) objectivesDiv.style.display = 'none';
      if (progressDiv) progressDiv.style.display = 'none';

      this.scene.start('MainMenuScene');
    });
  }

  private generateRandomBoard(): void {
    const rows = this.board.getRows();
    const cols = this.board.getCols();

    // Determine which colors to use based on level settings
    let gemTypes: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    // If objectives are enabled, ensure goal colors are included
    if (this.objectivesEnabled && this.levelSettings.gemGoals) {
      const goalColors = this.levelSettings.gemGoals.map(goal => goal.color);

      // Start with goal colors, then add other colors up to colorCount
      const otherColors = gemTypes.filter(c => !goalColors.includes(c));
      const colorsToUse = [...goalColors];

      // Add additional colors to reach the desired colorCount
      while (colorsToUse.length < this.levelSettings.colorCount && otherColors.length > 0) {
        colorsToUse.push(otherColors.shift()!);
      }

      gemTypes = colorsToUse;
    } else {
      // Use the first N colors based on colorCount
      gemTypes = gemTypes.slice(0, this.levelSettings.colorCount);
    }

    const config: (GemType | null)[][] = [];

    for (let row = 0; row < rows; row++) {
      const rowConfig: (GemType | null)[] = [];
      for (let col = 0; col < cols; col++) {
        // Pick random gem type
        const randomGem = gemTypes[Math.floor(Math.random() * gemTypes.length)];
        rowConfig.push(randomGem);
      }
      config.push(rowConfig);
    }

    this.board.initializeWithConfig(config);

    // Clear any accidental matches
    const matches = this.board.findMatches();
    if (matches.length > 0) {
      this.board.clearMatches(matches);
      this.board.refillBoard();
    }
  }

  private drawBoard(): void {
    const rows = this.board.getRows();
    const cols = this.board.getCols();

    // Draw grid and gems
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = this.BOARD_OFFSET_X + col * this.CELL_SIZE;
        const y = this.BOARD_OFFSET_Y + row * this.CELL_SIZE;

        // Draw cell background
        const cell = this.add.rectangle(x, y, this.CELL_SIZE - 4, this.CELL_SIZE - 4, 0x34495e);
        cell.setStrokeStyle(2, 0x7f8c8d);

        // Draw gem
        const gem = this.board.getGemAt(row, col);
        if (gem) {
          const cellId = row * cols + col;
          const gemSprite = this.createGemSprite(x, y, gem, row, col, cellId);
          this.gemSprites.set(`${row},${col}`, gemSprite);
        }

        // Add coordinates (small corner labels)
        this.add.text(x - 30, y - 30, `${row},${col}`, {
          fontSize: '10px',
          color: '#95a5a6'
        });
      }
    }

    // Draw border around entire board
    const boardWidth = cols * this.CELL_SIZE;
    const boardHeight = rows * this.CELL_SIZE;
    const border = this.add.rectangle(
      this.BOARD_OFFSET_X + boardWidth / 2 - this.CELL_SIZE / 2,
      this.BOARD_OFFSET_Y + boardHeight / 2 - this.CELL_SIZE / 2,
      boardWidth,
      boardHeight
    );
    border.setStrokeStyle(4, 0x2ecc71);
    border.setFillStyle(0x000000, 0);
  }

  private createGemSprite(x: number, y: number, gem: Gem, row: number, col: number, cellId: number): GemSprite {
    // Create clickable gem circle - special gems get neutral gray color
    const gemColor = gem.special !== 'none' ? 0x808080 : this.GEM_COLORS[gem.color];
    const gemCircle = this.add.circle(x, y, 30, gemColor);
    gemCircle.setStrokeStyle(3, 0xffffff, 0.5);
    gemCircle.setInteractive({ useHandCursor: true });
    gemCircle.setData('row', row);
    gemCircle.setData('col', col);
    gemCircle.setData('cellId', cellId);
    gemCircle.setData('gemColor', gem.color);

    // Add DOM attributes for Playwright
    (gemCircle as any).setDataEnabled();
    gemCircle.setName(`gem-${cellId}`);

    // Add cell ID text (hidden by default)
    const text = this.add.text(x, y, cellId.toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    text.setVisible(false); // Hide by default

    // Click handler
    gemCircle.on('pointerdown', () => this.onGemClick(row, col));

    // Hover effect
    gemCircle.on('pointerover', () => {
      gemCircle.setScale(1.1);
    });

    gemCircle.on('pointerout', () => {
      gemCircle.setScale(1.0);
    });

    // Add special gem indicator based on type
    let bombIndicator: Phaser.GameObjects.Text | undefined;
    if (gem.special === 'bomb') {
      bombIndicator = this.add.text(x, y, '⭐', {
        fontSize: '32px',
        color: '#ffffff'
      }).setOrigin(0.5);
      bombIndicator.setDepth(1); // Ensure it's above the circle
    } else if (gem.special === 'vertical-rocket') {
      bombIndicator = this.add.text(x, y, '↕', {
        fontSize: '40px',
        color: '#ffffff'
      }).setOrigin(0.5);
      bombIndicator.setDepth(1);
    } else if (gem.special === 'horizontal-rocket') {
      bombIndicator = this.add.text(x, y, '↔', {
        fontSize: '40px',
        color: '#ffffff'
      }).setOrigin(0.5);
      bombIndicator.setDepth(1);
    }

    return { circle: gemCircle, text, bombIndicator, row, col };
  }

  private onGemClick(row: number, col: number): void {
    const clickedPos = { row, col };

    // If no gem selected, select this one
    if (this.selectedGem === null) {
      this.selectedGem = clickedPos;
      this.showSelection(row, col);
      this.updateStatus('');
      return;
    }

    // If clicking the same gem, deselect
    if (this.selectedGem.row === row && this.selectedGem.col === col) {
      this.clearSelection();
      this.updateStatus('');
      return;
    }

    // Try to swap with selected gem
    this.attemptSwap(this.selectedGem, clickedPos);
  }

  private attemptSwap(pos1: Position, pos2: Position): void {
    try {
      const result = this.board.swap(pos1, pos2);

      if (result.valid) {
        // Decrement moves only on valid swaps (if objectives enabled)
        if (this.objectivesEnabled) {
          this.objectives.makeMove();
          this.updateObjectivesDisplay();
        }

        // Check if this was a bomb swap (no matches, just explosion)
        if (result.bombExplosions && result.bombExplosions.length > 0) {
          this.updateStatus('💥 BOMB ACTIVATED!');

          // Animate the swap, then trigger bomb explosions
          this.animateSwap(pos1, pos2, () => {
            this.handleBombExplosions(result.bombExplosions || []);
          });
        } else {
          this.updateStatus('✓ Valid swap! Match found: ' + result.matches[0].type + ' x ' + result.matches[0].positions.length);

          // Animate the swap, then clear matches (passing bomb creation info)
          this.animateSwap(pos1, pos2, () => {
            this.animateGemClearing(result.matches, 0, result.bombsToCreate || []);
          });
        }
      } else {
        this.updateStatus('✗ Invalid swap! No match created. Try again.');
      }
    } catch (error) {
      this.updateStatus('✗ Error: ' + (error as Error).message);
    }

    this.clearSelection();
  }

  private handleBombExplosions(bombPositions: Position[]): void {
    const spritesToClear: GemSprite[] = [];
    const gemCounts = new Map<GemType, number>();
    const processedPositions = new Set<string>();

    // Store gem info before clearing
    interface SpecialGemInfo {
      position: Position;
      specialType: SpecialGemType;
    }

    // Get initial special gem info
    const toProcess: SpecialGemInfo[] = bombPositions.map(pos => {
      const gem = this.board.getGemAt(pos.row, pos.col);
      return {
        position: pos,
        specialType: gem?.special || 'none'
      };
    }).filter(info => info.specialType !== 'none');

    while (toProcess.length > 0) {
      const gemInfo = toProcess.shift()!;
      const bombPos = gemInfo.position;
      const posKey = `${bombPos.row},${bombPos.col}`;

      // Skip if already processed
      if (processedPositions.has(posKey)) continue;
      processedPositions.add(posKey);

      let result: { cleared: Position[], triggered: TriggeredGem[] } = { cleared: [], triggered: [] };

      if (gemInfo.specialType === 'bomb') {
        result = this.board.explodeBomb(bombPos);
        this.updateStatus('💥 BOMB EXPLOSION!');
      } else if (gemInfo.specialType === 'vertical-rocket') {
        result = this.board.explodeVerticalRocket(bombPos);
        this.updateStatus('🚀 VERTICAL ROCKET!');
      } else if (gemInfo.specialType === 'horizontal-rocket') {
        result = this.board.explodeHorizontalRocket(bombPos);
        this.updateStatus('🚀 HORIZONTAL ROCKET!');
      }

      // Add bonus points for special gem explosion
      const explosionBonus = result.cleared.length * 50;
      this.score += explosionBonus;
      this.updateScore();

      // Track cleared gems by color for objectives
      if (this.objectivesEnabled) {
        for (const pos of result.cleared) {
          const key = `${pos.row},${pos.col}`;
          const sprite = this.gemSprites.get(key);
          if (sprite && sprite.circle.getData('gemColor')) {
            const color = sprite.circle.getData('gemColor') as GemType;
            const count = gemCounts.get(color) || 0;
            gemCounts.set(color, count + 1);
          }
        }
      }

      // Collect sprites for animation
      for (const pos of result.cleared) {
        const key = `${pos.row},${pos.col}`;
        const sprite = this.gemSprites.get(key);
        if (sprite && !spritesToClear.includes(sprite)) {
          spritesToClear.push(sprite);
        }
      }

      // Add triggered special gems to be processed next
      for (const triggered of result.triggered) {
        const triggeredKey = `${triggered.position.row},${triggered.position.col}`;
        if (!processedPositions.has(triggeredKey)) {
          toProcess.push({
            position: triggered.position,
            specialType: triggered.specialType
          });
        }
      }
    }

    // Update objectives with cleared gem counts
    if (this.objectivesEnabled && gemCounts.size > 0) {
      for (const [color, count] of gemCounts.entries()) {
        this.objectives.addGemsCleared(color, count);
      }
      this.updateObjectivesDisplay();

      // Check if goals are met after updating
      this.checkLevelCompletion();
    }

    // Animate explosion
    spritesToClear.forEach(sprite => {
      this.tweens.add({
        targets: [sprite.circle, sprite.text, sprite.bombIndicator].filter(Boolean),
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2'
      });
    });

    // Continue game flow after explosion animation
    this.time.delayedCall(450, () => {
      const moves = this.board.applyGravity();

      if (moves.length > 0) {
        this.animateGravity(moves, 0);
      } else {
        this.refillAndCheckCascade(0);
      }
    });
  }

  private animateGemClearing(matches: any[], cascadeLevel: number, bombsToCreate: BombCreation[] = []): void {
    // Check if any of the matched gems are bombs - they should explode!
    const bombPositions = this.board.checkForBombsInMatches(matches);

    // Calculate and add score for this match
    const matchScore = this.board.calculateScore(matches, cascadeLevel);
    this.score += matchScore;
    this.updateScore();

    const spritesToClear: GemSprite[] = [];

    // Collect sprites to clear from matches
    for (const match of matches) {
      for (const pos of match.positions) {
        const key = pos.row + ',' + pos.col;
        const sprite = this.gemSprites.get(key);
        if (sprite) {
          spritesToClear.push(sprite);
        }
      }
    }

    // If there are bombs in the matches, explode them
    if (bombPositions.length > 0) {
      for (const bombPos of bombPositions) {
        const result = this.board.explodeBomb(bombPos);
        // Add bonus points for bomb explosion
        this.score += result.cleared.length * 50;
        this.updateScore();

        // Add exploded sprites to clearing list
        for (const pos of result.cleared) {
          const key = pos.row + ',' + pos.col;
          const sprite = this.gemSprites.get(key);
          if (sprite && !spritesToClear.includes(sprite)) {
            spritesToClear.push(sprite);
          }
        }
      }
      this.updateStatus('💥 BOMB EXPLOSION! +' + (bombPositions.length * 50) + ' bonus!');
    }

    spritesToClear.forEach(sprite => {
      this.tweens.add({
        targets: [sprite.circle, sprite.text, sprite.bombIndicator].filter(Boolean),
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2'
      });
    });

    this.time.delayedCall(450, () => {
      // Track cleared gems by color for objectives
      if (this.objectivesEnabled && matches.length > 0) {
        const gemCounts = new Map<GemType, number>();

        for (const match of matches) {
          for (const pos of match.positions) {
            const gem = this.board.getGemAt(pos.row, pos.col);
            if (gem) {
              const count = gemCounts.get(gem.color) || 0;
              gemCounts.set(gem.color, count + 1);
            }
          }
        }

        // Update objectives with cleared gem counts
        for (const [color, count] of gemCounts.entries()) {
          this.objectives.addGemsCleared(color, count);
        }
        this.updateObjectivesDisplay();

        // Check if goals are met after updating
        this.checkLevelCompletion();
      }

      this.board.clearMatches(matches);

      // Create power-ups at specified positions (rockets or bombs from 4+ matches)
      for (const bombCreation of bombsToCreate) {
        this.board.setGemAt(
          bombCreation.position.row,
          bombCreation.position.col,
          { color: bombCreation.color, special: bombCreation.specialType }
        );
      }

      const moves = this.board.applyGravity();

      if (moves.length > 0) {
        this.animateGravity(moves, cascadeLevel);
      } else {
        this.refillAndCheckCascade(cascadeLevel);
      }
    });
  }

  private animateGravity(moves: any[], cascadeLevel: number): void {
    moves.forEach(move => {
      const key = move.from.row + ',' + move.from.col;
      const sprite = this.gemSprites.get(key);
      
      if (sprite) {
        const newY = this.BOARD_OFFSET_Y + move.to.row * this.CELL_SIZE;
        
        this.tweens.add({
          targets: [sprite.circle, sprite.text],
          y: newY,
          duration: 300,
          ease: 'Bounce.easeOut'
        });
      }
    });

    this.time.delayedCall(350, () => {
      this.refillAndCheckCascade(cascadeLevel);
    });
  }

  private refillAndCheckCascade(cascadeLevel: number): void {
    this.board.refillBoard();
    this.refreshBoard();
    
    const newMatches = this.board.findMatches();
    
    if (newMatches.length > 0 && cascadeLevel < 10) {
      const nextLevel = cascadeLevel + 1;
      this.updateStatus('CASCADE x' + nextLevel + '! ' + newMatches[0].type + ' match!');
      
      this.time.delayedCall(500, () => {
        this.animateGemClearing(newMatches, nextLevel);
      });
    } else {
      if (cascadeLevel > 0) {
        this.updateStatus('Cascade complete! ' + cascadeLevel + ' chains!');
      }
    }
  }

  private showSelection(row: number, col: number): void {
    const x = this.BOARD_OFFSET_X + col * this.CELL_SIZE;
    const y = this.BOARD_OFFSET_Y + row * this.CELL_SIZE;

    if (this.selectionIndicator) {
      this.selectionIndicator.destroy();
    }

    this.selectionIndicator = this.add.rectangle(x, y, this.CELL_SIZE, this.CELL_SIZE);
    this.selectionIndicator.setStrokeStyle(4, 0xffff00, 1);
    this.selectionIndicator.setFillStyle(0xffff00, 0.2);
  }

  private clearSelection(): void {
    this.selectedGem = null;
    if (this.selectionIndicator) {
      this.selectionIndicator.destroy();
      this.selectionIndicator = null;
    }
  }

  private refreshBoard(): void {
    // Clear existing gem sprites
    this.gemSprites.forEach(sprite => {
      sprite.circle.destroy();
      sprite.text.destroy();
      if (sprite.bombIndicator) {
        sprite.bombIndicator.destroy();
      }
    });
    this.gemSprites.clear();

    // Redraw all gems
    const rows = this.board.getRows();
    const cols = this.board.getCols();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const gem = this.board.getGemAt(row, col);
        if (gem) {
          const x = this.BOARD_OFFSET_X + col * this.CELL_SIZE;
          const y = this.BOARD_OFFSET_Y + row * this.CELL_SIZE;
          const cellId = row * cols + col;
          const gemSprite = this.createGemSprite(x, y, gem, row, col, cellId);
          this.gemSprites.set(`${row},${col}`, gemSprite);
        }
      }
    }
  }

  private updateStatus(message: string): void {
    // Update DOM status element (visible to users and testable by E2E)
    const domStatus = document.getElementById('game-status');
    if (domStatus) {
      domStatus.textContent = message;
    }
  }

  private updateScore(): void {
    // Update DOM score element
    const domScore = document.getElementById('game-score');
    if (domScore) {
      domScore.textContent = `Score: ${this.score}`;
    }

    // Check if level is complete (if objectives enabled)
    if (this.objectivesEnabled) {
      this.checkLevelCompletion();
    }
  }

  private getGemEmoji(color: GemType): string {
    const emojiMap: Record<GemType, string> = {
      red: '🔴',
      blue: '🔵',
      green: '🟢',
      yellow: '🟡',
      purple: '🟣',
      orange: '🟠'
    };
    return emojiMap[color];
  }

  private updateObjectivesDisplay(): void {
    if (!this.objectivesEnabled) return;

    // Update moves counter
    const movesElement = document.getElementById('game-moves');
    if (movesElement) {
      const moves = this.objectives.getMovesRemaining();
      movesElement.textContent = `Moves: ${moves}`;

      // Change color based on remaining moves
      if (moves <= 5) {
        movesElement.style.color = '#e74c3c'; // Red when low
      } else if (moves <= 10) {
        movesElement.style.color = '#f39c12'; // Orange when medium
      } else {
        movesElement.style.color = '#ecf0f1'; // White when plenty
      }
    }

    // Update gem goals display
    const targetElement = document.getElementById('game-target');
    if (targetElement) {
      const goals = this.objectives.getGemGoals();
      const goalTexts = goals.map(goal => {
        const colorEmoji = this.getGemEmoji(goal.color);
        const progress = `${goal.current}/${goal.target}`;
        return `${colorEmoji} ${progress}`;
      });
      targetElement.textContent = goalTexts.join('  ');
    }

    // Update progress bar
    const progress = this.objectives.getProgress();
    const progressBar = document.getElementById('game-progress-bar');
    const progressText = document.getElementById('game-progress-text');

    if (progressBar) {
      progressBar.style.width = `${progress * 100}%`;
    }

    if (progressText) {
      progressText.textContent = `${Math.floor(progress * 100)}%`;
    }
  }

  private checkLevelCompletion(): void {
    if (this.objectives.isComplete()) {
      // Delay transition to show final score/animation
      this.time.delayedCall(1000, () => {
        // Re-check status in case player bought more turns
        const currentStatus = this.objectives.getStatus();
        console.log('[LevelScene] Delayed completion check - status:', currentStatus);

        // Only proceed if still complete (not IN_PROGRESS due to bought turns)
        if (!this.objectives.isComplete()) {
          console.log('[LevelScene] Level no longer complete (bought turns?) - aborting transition');
          return;
        }

        if (currentStatus === LevelStatus.PASSED) {
          // On success, stop this scene and start EndLevelScene
          this.scene.start('EndLevelScene', {
            score: this.score,
            status: currentStatus,
            movesRemaining: this.objectives.getMovesRemaining(),
            levelNumber: this.levelNumber,
            continuationAttempts: this.continuationAttempts
          });
        } else {
          // On failure, sleep this scene and launch EndLevelScene as overlay
          console.log('[LevelScene] Level failed - putting scene to sleep');
          console.log('[LevelScene] Current moves:', this.objectives.getMovesRemaining());
          console.log('[LevelScene] Continuation attempts:', this.continuationAttempts);
          this.scene.sleep();
          console.log('[LevelScene] Scene is now sleeping, launching EndLevelScene overlay');
          this.scene.launch('EndLevelScene', {
            score: this.score,
            status: currentStatus,
            movesRemaining: this.objectives.getMovesRemaining(),
            levelNumber: this.levelNumber,
            continuationAttempts: this.continuationAttempts
          });
        }
      });
    }
  }

  /**
   * Called when player buys more turns - adds moves and resumes play
   */
  public addBonusMoves(count: number): void {
    console.log('[LevelScene] addBonusMoves called with count:', count);
    console.log('[LevelScene] Moves before:', this.objectives.getMovesRemaining());
    this.objectives.addMoves(count);
    console.log('[LevelScene] Moves after:', this.objectives.getMovesRemaining());
    this.updateObjectivesDisplay();
    console.log('[LevelScene] Objectives display updated');
  }

  private showAllCellIds(visible: boolean): void {
    this.gemSprites.forEach(sprite => {
      sprite.text.setVisible(visible);
    });
  }

  private animateSwap(pos1: Position, pos2: Position, onComplete: () => void): void {
    const sprite1 = this.gemSprites.get(`${pos1.row},${pos1.col}`);
    const sprite2 = this.gemSprites.get(`${pos2.row},${pos2.col}`);

    if (!sprite1 || !sprite2) {
      onComplete();
      return;
    }

    // Calculate target positions
    const x1 = this.BOARD_OFFSET_X + pos1.col * this.CELL_SIZE;
    const y1 = this.BOARD_OFFSET_Y + pos1.row * this.CELL_SIZE;
    const x2 = this.BOARD_OFFSET_X + pos2.col * this.CELL_SIZE;
    const y2 = this.BOARD_OFFSET_Y + pos2.row * this.CELL_SIZE;

    // Animate sprite1 to pos2's location
    this.tweens.add({
      targets: [sprite1.circle, sprite1.text],
      x: x2,
      y: y2,
      duration: 200,
      ease: 'Power2'
    });

    // Animate sprite2 to pos1's location
    this.tweens.add({
      targets: [sprite2.circle, sprite2.text],
      x: x1,
      y: y1,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        // Update the sprite map after swap
        this.gemSprites.set(`${pos1.row},${pos1.col}`, sprite2);
        this.gemSprites.set(`${pos2.row},${pos2.col}`, sprite1);

        // Update sprite data
        sprite1.row = pos2.row;
        sprite1.col = pos2.col;
        sprite2.row = pos1.row;
        sprite2.col = pos1.col;

        onComplete();
      }
    });
  }
}
