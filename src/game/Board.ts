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

export interface SwapResult {
  valid: boolean;
  matches: Match[];
}

export interface GemMove {
  from: Position;
  to: Position;
  gemType: GemType;
}

export interface GemRefill {
  position: Position;
  gemType: GemType;
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

  getRows(): number {
    return this.rows;
  }

  getCols(): number {
    return this.cols;
  }

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

  getGemAt(row: number, col: number): GemType | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Position (${row}, ${col}) is out of bounds`);
    }
    return this.grid[row][col];
  }

  getGrid(): (GemType | null)[][] {
    return this.grid.map(row => [...row]);
  }

  findMatches(): Match[] {
    const matches: Match[] = [];

    for (let row = 0; row < this.rows; row++) {
      let col = 0;
      while (col < this.cols) {
        const gem = this.grid[row][col];

        if (gem === null) {
          col++;
          continue;
        }

        let count = 1;
        let startCol = col;

        while (col + count < this.cols && this.grid[row][col + count] === gem) {
          count++;
        }

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

        col += count;
      }
    }

    for (let col = 0; col < this.cols; col++) {
      let row = 0;
      while (row < this.rows) {
        const gem = this.grid[row][col];

        if (gem === null) {
          row++;
          continue;
        }

        let count = 1;
        let startRow = row;

        while (row + count < this.rows && this.grid[row + count][col] === gem) {
          count++;
        }

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

        row += count;
      }
    }

    return matches;
  }

  swap(pos1: Position, pos2: Position): SwapResult {
    this.validatePosition(pos1);
    this.validatePosition(pos2);

    const rowDiff = Math.abs(pos1.row - pos2.row);
    const colDiff = Math.abs(pos1.col - pos2.col);

    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

    if (!isAdjacent) {
      throw new Error('Gems are not adjacent');
    }

    const temp = this.grid[pos1.row][pos1.col];
    this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
    this.grid[pos2.row][pos2.col] = temp;

    const matches = this.findMatches();

    if (matches.length === 0) {
      const temp = this.grid[pos1.row][pos1.col];
      this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
      this.grid[pos2.row][pos2.col] = temp;

      return {
        valid: false,
        matches: []
      };
    }

    return {
      valid: true,
      matches
    };
  }

  clearMatches(matches: Match[]): number {
    let clearedCount = 0;

    for (const match of matches) {
      for (const pos of match.positions) {
        if (this.grid[pos.row][pos.col] !== null) {
          this.grid[pos.row][pos.col] = null;
          clearedCount++;
        }
      }
    }

    return clearedCount;
  }

  applyGravity(): GemMove[] {
    const moves: GemMove[] = [];

    for (let col = 0; col < this.cols; col++) {
      let writeRow = this.rows - 1;

      for (let readRow = this.rows - 1; readRow >= 0; readRow--) {
        const gem = this.grid[readRow][col];

        if (gem !== null) {
          if (readRow !== writeRow) {
            moves.push({
              from: { row: readRow, col },
              to: { row: writeRow, col },
              gemType: gem
            });

            this.grid[writeRow][col] = gem;
            this.grid[readRow][col] = null;
          }

          writeRow--;
        }
      }
    }

    return moves;
  }

  refillBoard(): GemRefill[] {
    const refills: GemRefill[] = [];
    const allGemTypes: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.grid[row][col] === null) {
          const safeGemTypes = this.getSafeGemTypes(row, col, allGemTypes);
          const gemType = safeGemTypes[Math.floor(Math.random() * safeGemTypes.length)];
          
          this.grid[row][col] = gemType;
          
          refills.push({
            position: { row, col },
            gemType
          });
        }
      }
    }

    return refills;
  }

  calculateScore(matches: Match[], cascadeLevel: number): number {
    const BASE_POINTS = 100;
    let totalScore = 0;

    for (const match of matches) {
      const gemsMatched = match.positions.length;

      // Match size multiplier: 3=1x, 4=2x, 5=3x, 6+=4x
      let sizeMultiplier = 1;
      if (gemsMatched === 4) {
        sizeMultiplier = 2;
      } else if (gemsMatched === 5) {
        sizeMultiplier = 3;
      } else if (gemsMatched >= 6) {
        sizeMultiplier = 4;
      }

      // Cascade multiplier: level 0=1x, level 1=2x, level 2=3x, etc.
      const cascadeMultiplier = cascadeLevel + 1;

      // Calculate score for this match
      const matchScore = gemsMatched * BASE_POINTS * sizeMultiplier * cascadeMultiplier;
      totalScore += matchScore;
    }

    return totalScore;
  }

  private getSafeGemTypes(row: number, col: number, allTypes: GemType[]): GemType[] {
    const unsafeTypes = new Set<GemType>();

    if (col >= 2) {
      const left1 = this.grid[row][col - 1];
      const left2 = this.grid[row][col - 2];
      if (left1 !== null && left1 === left2) {
        unsafeTypes.add(left1);
      }
    }

    if (col < this.cols - 2) {
      const right1 = this.grid[row][col + 1];
      const right2 = this.grid[row][col + 2];
      if (right1 !== null && right1 === right2) {
        unsafeTypes.add(right1);
      }
    }

    if (col >= 1 && col < this.cols - 1) {
      const left1 = this.grid[row][col - 1];
      const right1 = this.grid[row][col + 1];
      if (left1 !== null && left1 === right1) {
        unsafeTypes.add(left1);
      }
    }

    if (row >= 2) {
      const above1 = this.grid[row - 1][col];
      const above2 = this.grid[row - 2][col];
      if (above1 !== null && above1 === above2) {
        unsafeTypes.add(above1);
      }
    }

    if (row < this.rows - 2) {
      const below1 = this.grid[row + 1][col];
      const below2 = this.grid[row + 2][col];
      if (below1 !== null && below1 === below2) {
        unsafeTypes.add(below1);
      }
    }

    if (row >= 1 && row < this.rows - 1) {
      const above1 = this.grid[row - 1][col];
      const below1 = this.grid[row + 1][col];
      if (above1 !== null && above1 === below1) {
        unsafeTypes.add(above1);
      }
    }

    const safeTypes = allTypes.filter(type => !unsafeTypes.has(type));
    return safeTypes.length > 0 ? safeTypes : allTypes;
  }

  private validatePosition(pos: Position): void {
    if (pos.row < 0 || pos.row >= this.rows || pos.col < 0 || pos.col >= this.cols) {
      throw new Error(`Position (${pos.row}, ${pos.col}) is out of bounds`);
    }
  }
}
