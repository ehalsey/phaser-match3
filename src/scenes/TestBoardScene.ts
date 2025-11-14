import Phaser from 'phaser';
import { Board, GemType } from '../game/Board';

export class TestBoardScene extends Phaser.Scene {
  private board!: Board;
  private readonly CELL_SIZE = 80;
  private readonly BOARD_OFFSET_X = 200;
  private readonly BOARD_OFFSET_Y = 150;

  // Color mapping for gems
  private readonly GEM_COLORS: Record<GemType, number> = {
    red: 0xe74c3c,      // Bright red
    blue: 0x3498db,     // True blue
    green: 0x2ecc71,    // Bright green
    yellow: 0xf1c40f,   // Golden yellow
    purple: 0x9b59b6,   // Purple
    orange: 0xe67e22    // Orange
  };

  constructor() {
    super({ key: 'TestBoardScene' });
  }

  create(): void {
    // Create board instance
    this.board = new Board(4, 3);

    // Initialize with test configuration
    // One swap away from horizontal match: cells 2, 3, 4 are blue
    // Swapping cell 2 with cell 5 will create horizontal match in row 1
    const testConfig: (GemType | null)[][] = [
      ['red', 'yellow', 'blue'],    // Row 0: cells 0, 1, 2 (cell 2 is blue)
      ['blue', 'blue', 'green'],    // Row 1: cells 3, 4, 5 (cells 3, 4 are blue)
      ['purple', 'orange', 'red'],  // Row 2: cells 6, 7, 8
      ['yellow', 'purple', 'orange'] // Row 3: cells 9, 10, 11
    ];

    this.board.initializeWithConfig(testConfig);

    // Title
    this.add.text(400, 30, 'Board Creation Test', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Board info
    this.add.text(400, 90, `Board: ${this.board.getRows()} rows × ${this.board.getCols()} cols`, {
      fontSize: '20px',
      color: '#2ecc71'
    }).setOrigin(0.5);

    // Draw the board
    this.drawBoard();

    // Add legend
    this.drawLegend();

    // Bottom note about setup
    this.add.text(400, 520, 'Cells 2, 3, 4 are BLUE. Swap cell 2↔5 to create horizontal match!', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#34495e',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5);
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
          const gemCircle = this.add.circle(x, y, 30, this.GEM_COLORS[gem]);
          gemCircle.setStrokeStyle(3, 0xffffff, 0.5);

          // Add unique cell ID (row * cols + col)
          const cellId = row * cols + col;
          this.add.text(x, y, cellId.toString(), {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
          }).setOrigin(0.5);
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

  private drawLegend(): void {
    const legendX = 520;
    const legendY = 150;

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

      // Draw gem name (legend items)
      this.add.text(legendX + 35, y, gem.charAt(0).toUpperCase() + gem.slice(1), {
        fontSize: '16px',
        color: '#ecf0f1'
      }).setOrigin(0, 0.5);
    });
  }
}
