export type GemType = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange';
export type SpecialGemType = 'bomb' | 'vertical-rocket' | 'horizontal-rocket' | 'none';

export interface TriggeredGem {
  position: Position;
  specialType: SpecialGemType;
}

export interface Gem {
  color: GemType;
  special: SpecialGemType;
}

export interface Position {
  row: number;
  col: number;
}

export interface Match {
  positions: Position[];
  type: GemType;
  direction: 'horizontal' | 'vertical';
}

export interface BombCreation {
  position: Position;
  color: GemType;
  specialType: SpecialGemType; // Type of power-up to create
}

export interface SwapResult {
  valid: boolean;
  matches: Match[];
  bombsToCreate?: BombCreation[];
  bombExplosions?: Position[]; // Positions of bombs that were triggered by swap
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
  private grid: (Gem | null)[][];
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = [];
  }

  // Helper to create a regular gem
  private createGem(color: GemType, special: SpecialGemType = 'none'): Gem {
    return { color, special };
  }

  // Set a gem at a specific position (used for creating bombs)
  setGemAt(row: number, col: number, gem: Gem | null): void {
    this.validatePosition({ row, col });
    this.grid[row][col] = gem;
  }

  // Detect L-shaped matches (where horizontal and vertical match-3s intersect)
  private detectLShapedMatches(matches: Match[]): BombCreation[] {
    const lShapedBombs: BombCreation[] = [];

    // Get all match-3 horizontal and vertical matches
    const horizontalMatches = matches.filter(m => m.direction === 'horizontal' && m.positions.length === 3);
    const verticalMatches = matches.filter(m => m.direction === 'vertical' && m.positions.length === 3);

    // Check for intersections between horizontal and vertical matches
    for (const hMatch of horizontalMatches) {
      for (const vMatch of verticalMatches) {
        // Check if they're the same color
        if (hMatch.type !== vMatch.type) continue;

        // Find intersection position
        for (const hPos of hMatch.positions) {
          for (const vPos of vMatch.positions) {
            if (hPos.row === vPos.row && hPos.col === vPos.col) {
              // Found an L-shaped match! Create bomb at intersection
              lShapedBombs.push({
                position: { row: hPos.row, col: hPos.col },
                color: hMatch.type,
                specialType: 'bomb'
              });
            }
          }
        }
      }
    }

    return lShapedBombs;
  }

  // Determine where power-ups should be created based on matches
  private determineBombCreations(matches: Match[]): BombCreation[] {
    const bombsToCreate: BombCreation[] = [];

    // First check for L-shaped matches (higher priority)
    const lShapedBombs = this.detectLShapedMatches(matches);
    bombsToCreate.push(...lShapedBombs);

    // Track positions where L-shaped bombs will be created to avoid duplicates
    const lShapedPositions = new Set(
      lShapedBombs.map(b => `${b.position.row},${b.position.col}`)
    );

    for (const match of matches) {
      const matchLength = match.positions.length;
      const centerIndex = Math.floor(matchLength / 2);
      const powerUpPosition = match.positions[centerIndex];
      const posKey = `${powerUpPosition.row},${powerUpPosition.col}`;

      // Skip if this position already has an L-shaped bomb
      if (lShapedPositions.has(posKey)) continue;

      // Match-4: Create rockets based on orientation
      if (matchLength === 4) {
        // Vertical match → vertical rocket (clears column)
        // Horizontal match → horizontal rocket (clears row)
        const specialType = match.direction === 'vertical' ? 'vertical-rocket' : 'horizontal-rocket';

        bombsToCreate.push({
          position: powerUpPosition,
          color: match.type,
          specialType: specialType
        });
      }
      // Match-5+: Create bomb
      else if (matchLength >= 5) {
        bombsToCreate.push({
          position: powerUpPosition,
          color: match.type,
          specialType: 'bomb'
        });
      }
    }

    return bombsToCreate;
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

    // Convert GemType array to Gem array
    this.grid = config.map(row =>
      row.map(gemType => gemType ? this.createGem(gemType) : null)
    );
  }

  getGemAt(row: number, col: number): Gem | null {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      throw new Error(`Position (${row}, ${col}) is out of bounds`);
    }
    return this.grid[row][col];
  }

  getGrid(): (Gem | null)[][] {
    return this.grid.map(row => [...row]);
  }

  findMatches(): Match[] {
    const matches: Match[] = [];

    // Find horizontal matches
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
        const gemColor = gem.color;

        // Compare by color only, not special type
        while (col + count < this.cols) {
          const nextGem = this.grid[row][col + count];
          if (nextGem && nextGem.color === gemColor) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          const positions: Position[] = [];
          for (let i = 0; i < count; i++) {
            positions.push({ row, col: startCol + i });
          }

          matches.push({
            positions,
            type: gemColor,
            direction: 'horizontal'
          });
        }

        col += count;
      }
    }

    // Find vertical matches
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
        const gemColor = gem.color;

        // Compare by color only, not special type
        while (row + count < this.rows) {
          const nextGem = this.grid[row + count][col];
          if (nextGem && nextGem.color === gemColor) {
            count++;
          } else {
            break;
          }
        }

        if (count >= 3) {
          const positions: Position[] = [];
          for (let i = 0; i < count; i++) {
            positions.push({ row: startRow + i, col });
          }

          matches.push({
            positions,
            type: gemColor,
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

    // Check if either gem is a special gem (bomb, rocket) BEFORE swapping
    const gem1 = this.grid[pos1.row][pos1.col];
    const gem2 = this.grid[pos2.row][pos2.col];
    const hasSpecialGem = (gem1 && gem1.special !== 'none') || (gem2 && gem2.special !== 'none');

    const temp = this.grid[pos1.row][pos1.col];
    this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
    this.grid[pos2.row][pos2.col] = temp;

    // If a special gem was swapped, it's always valid and triggers explosion
    if (hasSpecialGem) {
      const bombExplosions: Position[] = [];
      if (gem1 && gem1.special !== 'none') {
        bombExplosions.push(pos2); // Special gem moved to pos2
      }
      if (gem2 && gem2.special !== 'none') {
        bombExplosions.push(pos1); // Special gem moved to pos1
      }

      return {
        valid: true,
        matches: [],
        bombsToCreate: [],
        bombExplosions
      };
    }

    const matches = this.findMatches();

    if (matches.length === 0) {
      const temp = this.grid[pos1.row][pos1.col];
      this.grid[pos1.row][pos1.col] = this.grid[pos2.row][pos2.col];
      this.grid[pos2.row][pos2.col] = temp;

      return {
        valid: false,
        matches: [],
        bombsToCreate: [],
        bombExplosions: []
      };
    }

    // Determine if any bombs should be created from 4+ matches
    const bombsToCreate = this.determineBombCreations(matches);

    return {
      valid: true,
      matches,
      bombsToCreate,
      bombExplosions: []
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

  // Explode a bomb at the given position, clearing a 3x3 radius
  explodeBomb(position: Position): { cleared: Position[], triggered: TriggeredGem[] } {
    const clearedPositions: Position[] = [];
    const triggeredSpecialGems: TriggeredGem[] = [];

    // Clear a 3x3 area around the bomb
    for (let row = position.row - 1; row <= position.row + 1; row++) {
      for (let col = position.col - 1; col <= position.col + 1; col++) {
        // Check if position is within bounds
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
          const gem = this.grid[row][col];
          if (gem !== null) {
            // Check if this gem is a special gem that should be triggered
            if (gem.special !== 'none' && !(row === position.row && col === position.col)) {
              triggeredSpecialGems.push({ position: { row, col }, specialType: gem.special });
            }
            this.grid[row][col] = null;
            clearedPositions.push({ row, col });
          }
        }
      }
    }

    return { cleared: clearedPositions, triggered: triggeredSpecialGems };
  }

  explodeVerticalRocket(position: Position): { cleared: Position[], triggered: TriggeredGem[] } {
    const clearedPositions: Position[] = [];
    const triggeredSpecialGems: TriggeredGem[] = [];

    // Clear entire column
    for (let row = 0; row < this.rows; row++) {
      const gem = this.grid[row][position.col];
      if (gem !== null) {
        // Check if this gem is a special gem that should be triggered
        if (gem.special !== 'none' && row !== position.row) {
          triggeredSpecialGems.push({ position: { row, col: position.col }, specialType: gem.special });
        }
        this.grid[row][position.col] = null;
        clearedPositions.push({ row, col: position.col });
      }
    }

    return { cleared: clearedPositions, triggered: triggeredSpecialGems };
  }

  explodeHorizontalRocket(position: Position): { cleared: Position[], triggered: TriggeredGem[] } {
    const clearedPositions: Position[] = [];
    const triggeredSpecialGems: TriggeredGem[] = [];

    // Clear entire row
    for (let col = 0; col < this.cols; col++) {
      const gem = this.grid[position.row][col];
      if (gem !== null) {
        // Check if this gem is a special gem that should be triggered
        if (gem.special !== 'none' && col !== position.col) {
          triggeredSpecialGems.push({ position: { row: position.row, col }, specialType: gem.special });
        }
        this.grid[position.row][col] = null;
        clearedPositions.push({ row: position.row, col });
      }
    }

    return { cleared: clearedPositions, triggered: triggeredSpecialGems };
  }

  // Check if there are any special gems (bombs, rockets) in the matched positions
  checkForBombsInMatches(matches: Match[]): Position[] {
    const specialGemPositions: Position[] = [];

    for (const match of matches) {
      for (const pos of match.positions) {
        const gem = this.grid[pos.row][pos.col];
        if (gem && gem.special !== 'none') {
          specialGemPositions.push(pos);
        }
      }
    }

    return specialGemPositions;
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
              gemType: gem.color
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

          // Create a regular gem (no special type)
          this.grid[row][col] = this.createGem(gemType);

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

    // Check horizontal patterns
    if (col >= 2) {
      const left1 = this.grid[row][col - 1];
      const left2 = this.grid[row][col - 2];
      if (left1 !== null && left2 !== null && left1.color === left2.color) {
        unsafeTypes.add(left1.color);
      }
    }

    if (col < this.cols - 2) {
      const right1 = this.grid[row][col + 1];
      const right2 = this.grid[row][col + 2];
      if (right1 !== null && right2 !== null && right1.color === right2.color) {
        unsafeTypes.add(right1.color);
      }
    }

    if (col >= 1 && col < this.cols - 1) {
      const left1 = this.grid[row][col - 1];
      const right1 = this.grid[row][col + 1];
      if (left1 !== null && right1 !== null && left1.color === right1.color) {
        unsafeTypes.add(left1.color);
      }
    }

    // Check vertical patterns
    if (row >= 2) {
      const above1 = this.grid[row - 1][col];
      const above2 = this.grid[row - 2][col];
      if (above1 !== null && above2 !== null && above1.color === above2.color) {
        unsafeTypes.add(above1.color);
      }
    }

    if (row < this.rows - 2) {
      const below1 = this.grid[row + 1][col];
      const below2 = this.grid[row + 2][col];
      if (below1 !== null && below2 !== null && below1.color === below2.color) {
        unsafeTypes.add(below1.color);
      }
    }

    if (row >= 1 && row < this.rows - 1) {
      const above1 = this.grid[row - 1][col];
      const below1 = this.grid[row + 1][col];
      if (above1 !== null && below1 !== null && above1.color === below1.color) {
        unsafeTypes.add(above1.color);
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
