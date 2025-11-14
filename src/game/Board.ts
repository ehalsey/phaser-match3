export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';

export interface Position {
  row: number;
  col: number;
}

export interface Match {
  positions: Position[];
  type: GemType;
  direction: 'horizontal' | 'vertical';
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

  /**
   * Find all matches (3 or more consecutive gems) on the board
   * @returns Array of matches found
   */
  findMatches(): Match[] {
    const matches: Match[] = [];

    // Check horizontal matches
    for (let row = 0; row < this.rows; row++) {
      let col = 0;
      while (col < this.cols) {
        const gem = this.grid[row][col];

        // Skip null gems
        if (gem === null) {
          col++;
          continue;
        }

        // Count consecutive gems of the same type
        let count = 1;
        let startCol = col;

        while (col + count < this.cols && this.grid[row][col + count] === gem) {
          count++;
        }

        // If we found 3 or more consecutive gems, record the match
        if (count >= 3) {
          const positions: Position[] = [];
          for (let i = 0; i < count; i++) {
            positions.push({ row, col: startCol + i });
          }

          matches.push({
            positions,
            type: gem,
            direction: 'horizontal'
          });
        }

        // Move to the next unmatched position
        col += count;
      }
    }

    // Check vertical matches
    for (let col = 0; col < this.cols; col++) {
      let row = 0;
      while (row < this.rows) {
        const gem = this.grid[row][col];

        // Skip null gems
        if (gem === null) {
          row++;
          continue;
        }

        // Count consecutive gems of the same type
        let count = 1;
        let startRow = row;

        while (row + count < this.rows && this.grid[row + count][col] === gem) {
          count++;
        }

        // If we found 3 or more consecutive gems, record the match
        if (count >= 3) {
          const positions: Position[] = [];
          for (let i = 0; i < count; i++) {
            positions.push({ row: startRow + i, col });
          }

          matches.push({
            positions,
            type: gem,
            direction: 'vertical'
          });
        }

        // Move to the next unmatched position
        row += count;
      }
    }

    return matches;
  }
}
