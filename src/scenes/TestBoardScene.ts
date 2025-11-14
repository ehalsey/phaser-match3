import Phaser from 'phaser';
import { Board, GemType } from '../game/Board';

export class TestBoardScene extends Phaser.Scene {
  private board!: Board;
  private readonly CELL_SIZE = 80;
  private readonly BOARD_OFFSET_X = 200;
  private readonly BOARD_OFFSET_Y = 100;

  // Color mapping for gems
  private readonly GEM_COLORS: Record<GemType, number> = {
    red: 0xff6b6b,
    blue: 0x4ecdc4,
    green: 0x95e1d3,
    yellow: 0xffd93d,
    purple: 0xc38fff,
    orange: 0xff8c42
  };

  constructor() {
    super({ key: 'TestBoardScene' });
  }

  create(): void {
    // Create board instance
    this.board = new Board(3, 4);

    // Initialize with test configuration
    const testConfig: (GemType | null)[][] = [
      ['red', 'red', 'red', 'yellow'],    // Horizontal match of 3 reds!
      ['purple', 'blue', 'blue', 'green'],
      ['yellow', 'purple', 'orange', 'blue']
    ];

    this.board.initializeWithConfig(testConfig);

    // Add title
    this.add.text(400, 30, 'Board Creation Test', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Add board info
    this.add.text(400, 70, `Board: ${this.board.getRows()} rows × ${this.board.getCols()} cols`, {
      fontSize: '20px',
      color: '#2ecc71'
    }).setOrigin(0.5);

    // Draw the board
    this.drawBoard();

    // Add legend
    this.drawLegend();

    // Add note about horizontal match
    this.add.text(400, 500, 'Note: Top row has 3 RED gems in a row (horizontal match!)', {
      fontSize: '18px',
      color: '#e74c3c',
      backgroundColor: '#2c3e50',
      padding: { x: 10, y: 5 }
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

          // Add gem label
          this.add.text(x, y, gem.charAt(0).toUpperCase(), {
            fontSize: '24px',
            color: '#ffffff',
            fontStyle: 'bold'
          }).setOrigin(0.5);
        }

        // Add coordinates
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
