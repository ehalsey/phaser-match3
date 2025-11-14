export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Position {
  row: number;
  col: number;
}

export class Board {
  private grid: (GemType | null)[][];
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
  }

  /**
   * Get the number of rows in the board
   */
  getRows(): number {
    return this.rows;
  }

  /**
   * Get the number of columns in the board
   */
  getCols(): number {
    return this.cols;
  }

  /**
   * Initialize the board with a predefined configuration
   * @param config 2D array of gem types
   */
  initializeWithConfig(config: (GemType | null)[][]): void {
    if (config.length !== this.rows) {
      throw new Error(`Config must have ${this.rows} rows, got ${config.length}`);
    }

    for (let i = 0; i < config.length; i++) {
      if (config[i].length !== this.cols) {
        throw new Error(`Row ${i} must have ${this.cols} columns, got ${config[i].length}`);
      }
    }

    this.grid = config.map(row => [...row]);
  }

  /**
   * Get the gem at a specific position
   */
  getGemAt(row: number, col: number): GemType | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Position (${row}, ${col}) is out of bounds`);
    }
    return this.grid[row][col];
  }

  /**
   * Get the entire board state
   */
  getGrid(): (GemType | null)[][] {
    return this.grid.map(row => [...row]);
  }
}
