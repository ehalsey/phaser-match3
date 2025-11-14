import Phaser from 'phaser';
import { Board, GemType, Position } from '../game/Board';

interface GemSprite {
  circle: Phaser.GameObjects.Circle;
  text: Phaser.GameObjects.Text;
  row: number;
  col: number;
}

export class InteractiveGameScene extends Phaser.Scene {
  private board!: Board;
  private gemSprites: Map<string, GemSprite> = new Map();
  private selectedGem: Position | null = null;
  private selectionIndicator: Phaser.GameObjects.Rectangle | null = null;

  private readonly CELL_SIZE = 80;
  private readonly BOARD_OFFSET_X = 200;
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
    super({ key: 'InteractiveGameScene' });
  }

  create(): void {
    // Create board instance
    this.board = new Board(4, 3);

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

    // Draw the board
    this.drawBoard();

    // Add legend
    this.drawLegend();
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
        // Valid swap - refresh the display
        this.updateStatus(`✓ Valid swap! Match found: ${result.matches[0].type} x ${result.matches[0].positions.length}`);
        this.refreshBoard();
      } else {
        // Invalid swap - no match created (already reverted by Board)
        this.updateStatus(`✗ Invalid swap! No match created. Try again.`);
      }
    } catch (error) {
      // Swap error (not adjacent, out of bounds, etc.)
      this.updateStatus(`✗ ${(error as Error).message}`);
    }

    this.clearSelection();
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

  private drawLegend(): void {
    const legendX = 520;
    const legendY = 180;

    // Legend title
    this.add.text(legendX, legendY - 30, 'Gem Types:', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    const gemTypes: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    gemTypes.forEach((gem, index) => {
      const y = legendY + index * 35;

      // Draw gem color circle
      this.add.circle(legendX + 15, y, 12, this.GEM_COLORS[gem]);

      // Draw gem name
      this.add.text(legendX + 35, y, gem.charAt(0).toUpperCase() + gem.slice(1), {
        fontSize: '16px',
        color: '#ecf0f1'
      }).setOrigin(0, 0.5);
    });
  }
}
