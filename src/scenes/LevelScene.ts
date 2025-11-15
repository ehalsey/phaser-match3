import Phaser from 'phaser';
import { Board, GemType, Position } from '../game/Board';
import { BoardConfig } from '../game/BoardConfig';
import { MetaProgressionManager } from '../game/MetaProgressionManager';
import { LevelObjectives, LevelStatus } from '../game/LevelObjectives';

interface GemSprite {
  circle: any; // Phaser.GameObjects.Circle type not exported correctly
  text: Phaser.GameObjects.Text;
  row: number;
  col: number;
}

export class LevelScene extends Phaser.Scene {
  private board!: Board;
  private gemSprites: Map<string, GemSprite> = new Map();
  private selectedGem: Position | null = null;
  private selectionIndicator: Phaser.GameObjects.Rectangle | null = null;
  private score: number = 0;
  private metaManager!: MetaProgressionManager;
  private objectives!: LevelObjectives;
  private objectivesEnabled: boolean = true;

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

  create(): void {
    // Get URL params for test configuration
    const urlParams = new URLSearchParams(window.location.search);
    const skipMenu = urlParams.get('skipMenu') === 'true';
    const skipObjectives = urlParams.get('skipObjectives') === 'true';

    this.objectivesEnabled = !skipObjectives;

    this.metaManager = MetaProgressionManager.getInstance();
    if (!skipMenu) {
      this.metaManager.consumeLife();
    }

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

    // Initialize level objectives only if enabled (20 moves, 5000 target score for Level 1)
    if (this.objectivesEnabled) {
      this.objectives = new LevelObjectives(20, 5000);
      this.updateObjectivesDisplay();
    }

    // Draw the board
    this.drawBoard();

    // Log helpful info
    console.log(`[Game] Board initialized: ${config.rows}x${config.cols}`);
    console.log('[Game] Try: gameConfig.listPresets() to see available boards');

    // Signal that scene is ready for E2E tests
    const domStatus = document.getElementById('game-status');
    if (domStatus) {
      domStatus.setAttribute('data-scene-ready', 'true');
      domStatus.textContent = 'Click a gem to select it!';
    }
  }

  private generateRandomBoard(): void {
    const rows = this.board.getRows();
    const cols = this.board.getCols();
    // Level 1 uses 5 colors (orange reserved for later levels)
    const gemTypes: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple'];

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

  private createGemSprite(x: number, y: number, gem: GemType, row: number, col: number, cellId: number): GemSprite {
    // Create clickable gem circle
    const gemCircle = this.add.circle(x, y, 30, this.GEM_COLORS[gem]);
    gemCircle.setStrokeStyle(3, 0xffffff, 0.5);
    gemCircle.setInteractive({ useHandCursor: true });
    gemCircle.setData('row', row);
    gemCircle.setData('col', col);
    gemCircle.setData('cellId', cellId);

    // Add DOM attributes for Playwright
    (gemCircle as any).setDataEnabled();
    gemCircle.setName(`gem-${cellId}`);

    // Add cell ID text
    const text = this.add.text(x, y, cellId.toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Click handler
    gemCircle.on('pointerdown', () => this.onGemClick(row, col));

    // Hover effect
    gemCircle.on('pointerover', () => {
      gemCircle.setScale(1.1);
    });

    gemCircle.on('pointerout', () => {
      gemCircle.setScale(1.0);
    });

    return { circle: gemCircle, text, row, col };
  }

  private onGemClick(row: number, col: number): void {
    const clickedPos = { row, col };

    // If no gem selected, select this one
    if (this.selectedGem === null) {
      this.selectedGem = clickedPos;
      this.showSelection(row, col);
      this.updateStatus(`Selected cell ${row},${col}. Click an adjacent gem to swap!`);
      return;
    }

    // If clicking the same gem, deselect
    if (this.selectedGem.row === row && this.selectedGem.col === col) {
      this.clearSelection();
      this.updateStatus('Selection cleared. Click a gem to select it.');
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

        this.updateStatus('✓ Valid swap! Match found: ' + result.matches[0].type + ' x ' + result.matches[0].positions.length);
        this.animateGemClearing(result.matches, 0);
      } else {
        this.updateStatus('✗ Invalid swap! No match created. Try again.');
      }
    } catch (error) {
      this.updateStatus('✗ Error: ' + (error as Error).message);
    }

    this.clearSelection();
  }

  private animateGemClearing(matches: any[], cascadeLevel: number): void {
    // Calculate and add score for this match
    const matchScore = this.board.calculateScore(matches, cascadeLevel);
    this.score += matchScore;
    this.updateScore();

    const spritesToClear: GemSprite[] = [];

    for (const match of matches) {
      for (const pos of match.positions) {
        const key = pos.row + ',' + pos.col;
        const sprite = this.gemSprites.get(key);
        if (sprite) {
          spritesToClear.push(sprite);
        }
      }
    }

    spritesToClear.forEach(sprite => {
      this.tweens.add({
        targets: [sprite.circle, sprite.text],
        alpha: 0,
        scale: 0.3,
        duration: 400,
        ease: 'Power2'
      });
    });

    this.time.delayedCall(450, () => {
      this.board.clearMatches(matches);
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

    // Update objectives with new score (if objectives enabled)
    if (this.objectivesEnabled) {
      this.objectives.updateScore(this.score);
      this.updateObjectivesDisplay();

      // Check if level is complete
      this.checkLevelCompletion();
    }
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

    // Update target display
    const targetElement = document.getElementById('game-target');
    if (targetElement) {
      targetElement.textContent = `Target: ${this.objectives.getTargetScore()}`;
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
      const status = this.objectives.getStatus();

      // Delay transition to show final score/animation
      this.time.delayedCall(1000, () => {
        this.scene.start('EndLevelScene', {
          score: this.score,
          status: status,
          movesRemaining: this.objectives.getMovesRemaining(),
          targetScore: this.objectives.getTargetScore()
        });
      });
    }
  }
}
