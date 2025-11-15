import { Board, GemType } from '../Board';

describe('Board', () => {
  describe('Phase 1: Board Creation & Match Detection', () => {

    describe('Test 1: Board created with correct dimensions (4x3)', () => {
      it('should create a board with 4 rows and 3 columns', () => {
        const board = new Board(4, 3);

        expect(board.getRows()).toBe(4);
        expect(board.getCols()).toBe(3);
      });

      it('should create a board with different dimensions', () => {
        const board = new Board(5, 6);

        expect(board.getRows()).toBe(5);
        expect(board.getCols()).toBe(6);
      });
    });

    describe('Test 2: Board initialized with predefined configuration', () => {
      it('should initialize board with provided gem configuration', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['purple', 'red', 'blue'],
          ['yellow', 'purple', 'red'],
          ['green', 'yellow', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        expect(board.getGemAt(0, 0)).toBe('red');
        expect(board.getGemAt(0, 1)).toBe('blue');
        expect(board.getGemAt(1, 2)).toBe('blue');
        expect(board.getGemAt(3, 2)).toBe('purple');
      });

      it('should handle null values in configuration', () => {
        const board = new Board(2, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', null, 'green'],
          [null, 'blue', null]
        ];

        board.initializeWithConfig(testConfig);

        expect(board.getGemAt(0, 1)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();
        expect(board.getGemAt(0, 0)).toBe('red');
      });

      it('should throw error if config dimensions do not match board dimensions', () => {
        const board = new Board(4, 3);
        const wrongConfig: (GemType | null)[][] = [
          ['red', 'blue'],
          ['green', 'yellow']
        ];

        expect(() => board.initializeWithConfig(wrongConfig)).toThrow();
      });

      it('should create independent copy of config (not reference)', () => {
        const board = new Board(2, 2);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue'],
          ['green', 'yellow']
        ];

        board.initializeWithConfig(testConfig);
        testConfig[0][0] = 'purple';

        expect(board.getGemAt(0, 0)).toBe('red');
      });
    });

    describe('Test 3: Detect pre-existing 1x3 horizontal match', () => {
      it('should detect a horizontal match of 3 gems in a row', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'red', 'red'],      // Row 0: 3 reds - MATCH!
          ['blue', 'green', 'yellow'],
          ['purple', 'orange', 'blue'],
          ['green', 'yellow', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(1);
        expect(matches[0]).toEqual({
          positions: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 }
          ],
          type: 'red',
          direction: 'horizontal'
        });
      });

      it('should detect multiple horizontal matches', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'red', 'red'],      // Row 0: 3 reds - MATCH!
          ['blue', 'green', 'yellow'],
          ['blue', 'blue', 'blue'],   // Row 2: 3 blues - MATCH!
          ['green', 'yellow', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(2);
        expect(matches[0].type).toBe('red');
        expect(matches[1].type).toBe('blue');
      });

      it('should not detect a match with only 2 gems in a row', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'red', 'blue'],     // Only 2 reds - NO MATCH
          ['blue', 'green', 'yellow'],
          ['purple', 'orange', 'blue'],
          ['green', 'yellow', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(0);
      });

      it('should handle boards with no matches', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['blue', 'green', 'yellow'],
          ['purple', 'orange', 'blue'],
          ['green', 'yellow', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(0);
      });

      it('should work on different board dimensions (5x6)', () => {
        const board = new Board(5, 6);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
          ['purple', 'purple', 'purple', 'purple', 'blue', 'red'],  // 4 purples - MATCH!
          ['green', 'yellow', 'blue', 'red', 'orange', 'green'],
          ['orange', 'orange', 'orange', 'blue', 'yellow', 'purple'], // 3 oranges - MATCH!
          ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(2);
        expect(matches[0].type).toBe('purple');
        expect(matches[0].positions.length).toBe(4); // 4-gem match
        expect(matches[1].type).toBe('orange');
        expect(matches[1].positions.length).toBe(3); // 3-gem match
      });

      it('should work on tall narrow boards (7x2)', () => {
        const board = new Board(7, 2);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue'],
          ['red', 'green'],
          ['yellow', 'purple'],
          ['orange', 'orange'],  // Only 2 oranges - NO MATCH
          ['green', 'blue'],
          ['purple', 'red'],
          ['yellow', 'orange']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(0); // No horizontal matches possible with only 2 columns
      });

      it('should work on wide short boards (2x8)', () => {
        const board = new Board(2, 8);
        const testConfig: (GemType | null)[][] = [
          ['blue', 'blue', 'blue', 'blue', 'blue', 'red', 'green', 'yellow'], // 5 blues - MATCH!
          ['red', 'green', 'yellow', 'purple', 'orange', 'blue', 'blue', 'blue'] // 3 blues - MATCH!
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(2);
        expect(matches[0].positions.length).toBe(5); // 5-gem match
        expect(matches[1].positions.length).toBe(3); // 3-gem match
      });
    });

    describe('Test 4: Detect vertical matches', () => {
      it('should detect a vertical match of 3 gems in a column', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['red', 'yellow', 'purple'],    // Column 0: 3 reds (rows 0,1,2) - MATCH!
          ['red', 'orange', 'blue'],
          ['yellow', 'green', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(1);
        expect(matches[0]).toEqual({
          positions: [
            { row: 0, col: 0 },
            { row: 1, col: 0 },
            { row: 2, col: 0 }
          ],
          type: 'red',
          direction: 'vertical'
        });
      });

      it('should detect multiple vertical matches', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['red', 'blue', 'purple'],    // Column 0: 3 reds, Column 1: 3 blues - 2 MATCHES!
          ['red', 'blue', 'orange'],
          ['yellow', 'green', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(2);
        expect(matches[0].type).toBe('red');
        expect(matches[0].direction).toBe('vertical');
        expect(matches[1].type).toBe('blue');
        expect(matches[1].direction).toBe('vertical');
      });

      it('should not detect a match with only 2 gems in a column', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['red', 'yellow', 'purple'],    // Column 0: only 2 reds - NO MATCH
          ['yellow', 'orange', 'blue'],
          ['green', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(0);
      });

      it('should detect both horizontal and vertical matches on same board', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['blue', 'blue', 'blue'],      // Row 0: 3 blues horizontal - MATCH!
          ['red', 'yellow', 'purple'],
          ['red', 'orange', 'green'],    // Column 0: 4 reds vertical (rows 0,1,2,3) - MATCH!
          ['red', 'green', 'yellow']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(2);
        const horizontalMatch = matches.find(m => m.direction === 'horizontal');
        const verticalMatch = matches.find(m => m.direction === 'vertical');

        expect(horizontalMatch).toBeDefined();
        expect(horizontalMatch?.type).toBe('blue');
        expect(verticalMatch).toBeDefined();
        expect(verticalMatch?.type).toBe('red');
        expect(verticalMatch?.positions.length).toBe(3);
      });

      it('should work on tall boards (6x3)', () => {
        const board = new Board(6, 3);
        const testConfig: (GemType | null)[][] = [
          ['purple', 'blue', 'green'],
          ['purple', 'yellow', 'red'],
          ['purple', 'orange', 'yellow'],   // Column 0: 5 purples - MATCH!
          ['purple', 'green', 'blue'],
          ['purple', 'red', 'orange'],
          ['yellow', 'green', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const matches = board.findMatches();

        expect(matches.length).toBe(1);
        expect(matches[0].type).toBe('purple');
        expect(matches[0].positions.length).toBe(5); // 5-gem vertical match
        expect(matches[0].direction).toBe('vertical');
      });
    });
  });

  describe('Phase 2: Swap Mechanics', () => {

    describe('Test 5: Two adjacent gems can be swapped', () => {
      it('should swap horizontally adjacent gems when creating a match', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'yellow', 'blue'],
          ['blue', 'blue', 'green'],     // Row 1 has 2 blues, swapping (0,2) with (1,2) makes 3 blues
          ['purple', 'orange', 'red'],
          ['yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);
        const result = board.swap({ row: 0, col: 2 }, { row: 1, col: 2 });

        expect(result.valid).toBe(true);
        expect(board.getGemAt(0, 2)).toBe('green');  // Swapped
        expect(board.getGemAt(1, 2)).toBe('blue');   // Swapped - creates horizontal match in row 1
      });

      it('should swap vertically adjacent gems when creating a match', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['yellow', 'blue', 'green'],
          ['red', 'purple', 'orange'],   // Column 0: yellow, red, yellow, yellow - swap (0,0) with (1,0) makes 3 yellows
          ['yellow', 'green', 'orange'],
          ['yellow', 'orange', 'purple']
        ];

        board.initializeWithConfig(testConfig);
        const result = board.swap({ row: 0, col: 0 }, { row: 1, col: 0 });

        expect(result.valid).toBe(true);
        expect(board.getGemAt(0, 0)).toBe('red');     // Swapped
        expect(board.getGemAt(1, 0)).toBe('yellow');  // Swapped - creates vertical match in column 0 (rows 1,2,3)
      });
    });

    describe('Test 6: Non-adjacent gems cannot be swapped', () => {
      it('should throw error when swapping non-adjacent gems', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        expect(() => {
          board.swap({ row: 0, col: 0 }, { row: 0, col: 2 }); // Skip one gem
        }).toThrow('Gems are not adjacent');
      });

      it('should throw error when swapping diagonal gems', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        expect(() => {
          board.swap({ row: 0, col: 0 }, { row: 1, col: 1 }); // Diagonal
        }).toThrow('Gems are not adjacent');
      });

      it('should throw error when positions are out of bounds', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        expect(() => {
          board.swap({ row: 0, col: 0 }, { row: 5, col: 0 }); // Out of bounds
        }).toThrow();
      });
    });

    describe('Test 7: Swap resulting in match is valid', () => {
      it('should return true when swap creates a match', () => {
        const board = new Board(4, 3);
        // Setup: cells 2,3,4 are blue, cell 5 is green
        // Swapping 2 and 5 creates horizontal match in row 1
        const testConfig: (GemType | null)[][] = [
          ['red', 'yellow', 'blue'],    // cell 2 is blue
          ['blue', 'blue', 'green'],    // cells 3,4 are blue, 5 is green
          ['purple', 'orange', 'red'],
          ['yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);
        const result = board.swap({ row: 0, col: 2 }, { row: 1, col: 2 });

        expect(result.valid).toBe(true);
        expect(result.matches.length).toBeGreaterThan(0);
        expect(result.matches[0].type).toBe('blue');
      });
    });

    describe('Test 8: Swap resulting in NO match is invalid', () => {
      it('should return false when swap does not create a match', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);
        const result = board.swap({ row: 0, col: 0 }, { row: 0, col: 1 });

        expect(result.valid).toBe(false);
        expect(result.matches.length).toBe(0);
      });

      it('should revert the swap when no match is created', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        // Remember original state
        const originalGem1 = board.getGemAt(0, 0);
        const originalGem2 = board.getGemAt(0, 1);

        // Attempt invalid swap
        board.swap({ row: 0, col: 0 }, { row: 0, col: 1 });

        // Verify board reverted to original state
        expect(board.getGemAt(0, 0)).toBe(originalGem1);
        expect(board.getGemAt(0, 1)).toBe(originalGem2);
      });
    });
  });

  describe('Phase 3: Gem Clearing', () => {
    describe('Test 9: Clear matched gems from board', () => {
      it('should clear a horizontal match (set to null)', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'blue'],
          ['blue', 'blue', 'green'],
          ['purple', 'orange', 'red'],
          ['yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Swap to create horizontal match of 3 blues in row 1 (positions 2,3,4)
        board.swap({ row: 0, col: 2 }, { row: 1, col: 2 });

        // Find the matches
        const matches = board.findMatches();
        expect(matches.length).toBeGreaterThan(0);

        // Clear the matches
        const clearedCount = board.clearMatches(matches);

        // Verify gems were cleared (set to null)
        expect(board.getGemAt(1, 2)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();
        expect(board.getGemAt(1, 1)).toBeNull();
        expect(clearedCount).toBe(3);
      });

      it('should clear a vertical match (set to null)', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'blue'],
          ['blue', 'blue', 'green'],
          ['purple', 'orange', 'red'],
          ['yellow', 'blue', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Swap to create vertical match of 3 blues in column 1 (cells 1,4,7)
        board.swap({ row: 2, col: 1 }, { row: 3, col: 1 });

        // Find the matches
        const matches = board.findMatches();
        expect(matches.length).toBeGreaterThan(0);

        // Clear the matches
        const clearedCount = board.clearMatches(matches);

        // Verify gems were cleared (set to null)
        expect(board.getGemAt(0, 1)).toBeNull();
        expect(board.getGemAt(1, 1)).toBeNull();
        expect(board.getGemAt(2, 1)).toBeNull();
        expect(clearedCount).toBe(3);
      });

      it('should clear multiple matches at once', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'red', 'red'],      // Horizontal match of 3 reds
          ['blue', 'blue', 'blue'],   // Horizontal match of 3 blues
          ['purple', 'orange', 'yellow'],
          ['green', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Find the matches (should find 2 horizontal matches)
        const matches = board.findMatches();
        expect(matches.length).toBe(2);

        // Clear all matches
        const clearedCount = board.clearMatches(matches);

        // Verify all matched gems were cleared
        expect(board.getGemAt(0, 0)).toBeNull();
        expect(board.getGemAt(0, 1)).toBeNull();
        expect(board.getGemAt(0, 2)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();
        expect(board.getGemAt(1, 1)).toBeNull();
        expect(board.getGemAt(1, 2)).toBeNull();
        expect(clearedCount).toBe(6);

        // Verify unmatched gems remain
        expect(board.getGemAt(2, 0)).toBe('purple');
        expect(board.getGemAt(3, 0)).toBe('green');
      });

      it('should clear longer matches (4+ gems)', () => {
        const board = new Board(4, 4);
        const testConfig: (GemType | null)[][] = [
          ['red', 'red', 'red', 'red'],  // Match of 4 reds
          ['blue', 'green', 'yellow', 'purple'],
          ['orange', 'blue', 'green', 'red'],
          ['yellow', 'purple', 'orange', 'blue']
        ];

        board.initializeWithConfig(testConfig);

        // Find the match (4 reds)
        const matches = board.findMatches();
        expect(matches.length).toBe(1);
        expect(matches[0].positions.length).toBe(4);

        // Clear the match
        const clearedCount = board.clearMatches(matches);

        // Verify all 4 gems were cleared
        expect(board.getGemAt(0, 0)).toBeNull();
        expect(board.getGemAt(0, 1)).toBeNull();
        expect(board.getGemAt(0, 2)).toBeNull();
        expect(board.getGemAt(0, 3)).toBeNull();
        expect(clearedCount).toBe(4);
      });

      it('should handle empty matches array', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['yellow', 'purple', 'orange'],
          ['blue', 'green', 'red'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        // Clear with empty matches array
        const clearedCount = board.clearMatches([]);

        // Verify nothing was cleared
        expect(clearedCount).toBe(0);
        expect(board.getGemAt(0, 0)).toBe('red');
        expect(board.getGemAt(1, 1)).toBe('purple');
      });

      it('should not affect gems that were not matched', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'blue'],
          ['blue', 'blue', 'green'],
          ['purple', 'orange', 'red'],
          ['yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Swap to create match
        board.swap({ row: 0, col: 2 }, { row: 1, col: 2 });

        // Clear matches
        const matches = board.findMatches();
        board.clearMatches(matches);

        // Verify unmatched gems remain unchanged
        expect(board.getGemAt(1, 2)).toBeNull();  // Part of the match, should be cleared
        expect(board.getGemAt(2, 0)).toBe('purple');
        expect(board.getGemAt(2, 1)).toBe('orange');
        expect(board.getGemAt(2, 2)).toBe('red');
        expect(board.getGemAt(3, 0)).toBe('yellow');
      });
    });
  });

  describe('Phase 4: Gravity and Falling Gems', () => {
    describe('Test 10: Apply gravity to make gems fall', () => {
      it('should make gems fall down to fill empty spaces', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          [null, null, null],      // Empty row (cleared matches)
          ['purple', 'orange', 'yellow'],
          ['blue', 'red', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity
        const moves = board.applyGravity();

        // Verify gems fell down to fill the empty row
        expect(board.getGemAt(0, 0)).toBeNull();  // Top row now empty
        expect(board.getGemAt(1, 0)).toBe('red');  // Red fell from row 0 to row 1
        expect(board.getGemAt(2, 0)).toBe('purple');
        expect(board.getGemAt(3, 0)).toBe('blue');

        // Verify moves were returned
        expect(moves.length).toBeGreaterThan(0);
      });

      it('should handle multiple empty spaces in a column', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          [null, 'orange', null],
          [null, null, 'yellow'],
          ['purple', 'red', null]
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity
        board.applyGravity();

        // Column 0: red and purple should fall
        expect(board.getGemAt(0, 0)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();
        expect(board.getGemAt(2, 0)).toBe('red');
        expect(board.getGemAt(3, 0)).toBe('purple');

        // Column 1: blue, orange, red should fall
        expect(board.getGemAt(0, 1)).toBeNull();
        expect(board.getGemAt(1, 1)).toBe('blue');
        expect(board.getGemAt(2, 1)).toBe('orange');
        expect(board.getGemAt(3, 1)).toBe('red');

        // Column 2: green, yellow should fall
        expect(board.getGemAt(0, 2)).toBeNull();
        expect(board.getGemAt(1, 2)).toBeNull();
        expect(board.getGemAt(2, 2)).toBe('green');
        expect(board.getGemAt(3, 2)).toBe('yellow');
      });

      it('should not move gems if no empty spaces below', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green'],
          ['purple', 'orange', 'yellow'],
          ['blue', 'red', 'purple'],
          ['green', 'yellow', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity (should not change anything)
        const moves = board.applyGravity();

        // Board should remain unchanged
        expect(board.getGemAt(0, 0)).toBe('red');
        expect(board.getGemAt(1, 0)).toBe('purple');
        expect(board.getGemAt(2, 0)).toBe('blue');
        expect(board.getGemAt(3, 0)).toBe('green');

        // No moves should be returned
        expect(moves.length).toBe(0);
      });

      it('should handle all gems cleared in a column', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, 'blue', 'green'],
          [null, 'orange', 'yellow'],
          [null, 'red', 'purple'],
          [null, 'yellow', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity
        board.applyGravity();

        // Column 0 should remain all null
        expect(board.getGemAt(0, 0)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();
        expect(board.getGemAt(2, 0)).toBeNull();
        expect(board.getGemAt(3, 0)).toBeNull();

        // Other columns should be unchanged (already full)
        expect(board.getGemAt(0, 1)).toBe('blue');
        expect(board.getGemAt(3, 1)).toBe('yellow');
      });

      it('should return move information for animations', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          ['red', null, null],
          [null, null, null],
          [null, null, null],
          [null, null, null]
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity
        const moves = board.applyGravity();

        // Should have one move: red from (0,0) to (3,0)
        expect(moves.length).toBe(1);
        expect(moves[0].from.row).toBe(0);
        expect(moves[0].from.col).toBe(0);
        expect(moves[0].to.row).toBe(3);
        expect(moves[0].to.col).toBe(0);
        expect(moves[0].gemType).toBe('red');
      });

      it('should work on different board dimensions', () => {
        const board = new Board(5, 4);
        const testConfig: (GemType | null)[][] = [
          ['red', 'blue', 'green', 'yellow'],
          [null, null, null, null],
          [null, null, null, null],
          ['purple', 'orange', 'red', 'blue'],
          ['green', 'yellow', 'purple', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Apply gravity
        board.applyGravity();

        // Top 2 rows should be empty
        expect(board.getGemAt(0, 0)).toBeNull();
        expect(board.getGemAt(1, 0)).toBeNull();

        // Gems should have fallen
        expect(board.getGemAt(2, 0)).toBe('red');
        expect(board.getGemAt(3, 0)).toBe('purple');
        expect(board.getGemAt(4, 0)).toBe('green');
      });
    });
  });

  describe('Phase 5: Refill Empty Spaces', () => {
    describe('Test 11: Refill empty spaces with new gems', () => {
      it('should refill empty spaces at top of columns', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, null, null],      // Top row empty
          ['red', 'blue', 'green'],
          ['purple', 'orange', 'yellow'],
          ['blue', 'red', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        // Refill the board
        const refills = board.refillBoard();

        // Top row should now have gems
        expect(board.getGemAt(0, 0)).not.toBeNull();
        expect(board.getGemAt(0, 1)).not.toBeNull();
        expect(board.getGemAt(0, 2)).not.toBeNull();

        // Should return 3 refill operations
        expect(refills.length).toBe(3);
      });

      it('should refill multiple empty rows', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, null, null],
          [null, null, null],
          ['red', 'blue', 'green'],
          ['purple', 'orange', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        // Refill the board
        const refills = board.refillBoard();

        // All empty spaces should be filled
        expect(board.getGemAt(0, 0)).not.toBeNull();
        expect(board.getGemAt(0, 1)).not.toBeNull();
        expect(board.getGemAt(0, 2)).not.toBeNull();
        expect(board.getGemAt(1, 0)).not.toBeNull();
        expect(board.getGemAt(1, 1)).not.toBeNull();
        expect(board.getGemAt(1, 2)).not.toBeNull();

        // Should return 6 refill operations
        expect(refills.length).toBe(6);
      });

      it('should not create immediate horizontal matches', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, null, null],
          ['red', 'red', 'green'],  // Two reds in a row
          ['purple', 'orange', 'yellow'],
          ['blue', 'red', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        // Refill multiple times to test randomness
        for (let i = 0; i < 10; i++) {
          board.initializeWithConfig(testConfig);
          board.refillBoard();

          // Check no immediate matches were created
          const matches = board.findMatches();
          expect(matches.length).toBe(0);
        }
      });

      it('should not create immediate vertical matches', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, 'blue', 'green'],
          [null, 'blue', 'yellow'],  // Two blues vertically
          ['red', 'orange', 'purple'],
          ['purple', 'red', 'orange']
        ];

        board.initializeWithConfig(testConfig);

        // Refill multiple times to test randomness
        for (let i = 0; i < 10; i++) {
          board.initializeWithConfig(testConfig);
          board.refillBoard();

          // Check no immediate matches were created
          const matches = board.findMatches();
          expect(matches.length).toBe(0);
        }
      });

      it('should only refill null spaces', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, 'blue', null],
          ['red', null, 'green'],
          ['purple', 'orange', 'yellow'],
          ['blue', 'red', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        // Remember existing gems
        const existingGems = {
          cell01: board.getGemAt(0, 1),
          cell10: board.getGemAt(1, 0),
          cell12: board.getGemAt(1, 2)
        };

        // Refill
        const refills = board.refillBoard();

        // Existing gems should not change
        expect(board.getGemAt(0, 1)).toBe(existingGems.cell01);
        expect(board.getGemAt(1, 0)).toBe(existingGems.cell10);
        expect(board.getGemAt(1, 2)).toBe(existingGems.cell12);

        // Only 3 nulls should be refilled
        expect(refills.length).toBe(3);
      });

      it('should return refill information for animations', () => {
        const board = new Board(4, 3);
        const testConfig: (GemType | null)[][] = [
          [null, null, 'green'],
          ['red', 'blue', 'yellow'],
          ['purple', 'orange', 'blue'],
          ['blue', 'red', 'purple']
        ];

        board.initializeWithConfig(testConfig);

        // Refill
        const refills = board.refillBoard();

        // Should return 2 refills
        expect(refills.length).toBe(2);

        // Each refill should have position and gemType
        refills.forEach(refill => {
          expect(refill).toHaveProperty('position');
          expect(refill).toHaveProperty('gemType');
          expect(refill.position).toHaveProperty('row');
          expect(refill.position).toHaveProperty('col');
        });
      });

      it('should work on different board dimensions', () => {
        const board = new Board(5, 4);
        const testConfig: (GemType | null)[][] = [
          [null, null, null, null],
          ['red', 'blue', 'green', 'yellow'],
          ['purple', 'orange', 'red', 'blue'],
          ['green', 'yellow', 'purple', 'orange'],
          ['blue', 'red', 'green', 'yellow']
        ];

        board.initializeWithConfig(testConfig);

        // Refill
        const refills = board.refillBoard();

        // Should fill 4 empty spaces
        expect(refills.length).toBe(4);

        // All top row should be filled
        expect(board.getGemAt(0, 0)).not.toBeNull();
        expect(board.getGemAt(0, 1)).not.toBeNull();
        expect(board.getGemAt(0, 2)).not.toBeNull();
        expect(board.getGemAt(0, 3)).not.toBeNull();
      });
    });

    describe('Phase 6: Scoring System', () => {
      describe('Test 12: Calculate score for matches', () => {
        it('should calculate base score for 3-gem match (300 points)', () => {
          const board = new Board(4, 3);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red'],  // 3-match
            ['blue', 'green', 'yellow'],
            ['purple', 'orange', 'blue'],
            ['green', 'yellow', 'purple']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 0
          const score = board.calculateScore(matches, 0);

          // 3 gems × 100 points × 1 (no size bonus) × 1 (level 0) = 300
          expect(score).toBe(300);
        });

        it('should apply 2x multiplier for 4-gem match (800 points)', () => {
          const board = new Board(4, 4);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red', 'red'],  // 4-match
            ['blue', 'green', 'yellow', 'purple'],
            ['orange', 'blue', 'green', 'red'],
            ['yellow', 'purple', 'orange', 'blue']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 0
          const score = board.calculateScore(matches, 0);

          // 4 gems × 100 points × 2 (size multiplier) × 1 (level 0) = 800
          expect(score).toBe(800);
        });

        it('should apply 3x multiplier for 5-gem match (1500 points)', () => {
          const board = new Board(4, 5);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red', 'red', 'red'],  // 5-match
            ['blue', 'green', 'yellow', 'purple', 'orange'],
            ['orange', 'blue', 'green', 'red', 'blue'],
            ['yellow', 'purple', 'orange', 'blue', 'green']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 0
          const score = board.calculateScore(matches, 0);

          // 5 gems × 100 points × 3 (size multiplier) × 1 (level 0) = 1500
          expect(score).toBe(1500);
        });

        it('should apply 4x multiplier for 6+ gem match (2400 points)', () => {
          const board = new Board(4, 6);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red', 'red', 'red', 'red'],  // 6-match
            ['blue', 'green', 'yellow', 'purple', 'orange', 'blue'],
            ['orange', 'blue', 'green', 'red', 'blue', 'green'],
            ['yellow', 'purple', 'orange', 'blue', 'green', 'yellow']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 0
          const score = board.calculateScore(matches, 0);

          // 6 gems × 100 points × 4 (size multiplier) × 1 (level 0) = 2400
          expect(score).toBe(2400);
        });

        it('should apply cascade multiplier (level 1 = 2x)', () => {
          const board = new Board(4, 3);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red'],  // 3-match
            ['blue', 'green', 'yellow'],
            ['purple', 'orange', 'blue'],
            ['green', 'yellow', 'purple']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 1
          const score = board.calculateScore(matches, 1);

          // 3 gems × 100 points × 1 (no size bonus) × 2 (level 1) = 600
          expect(score).toBe(600);
        });

        it('should apply cascade multiplier (level 2 = 3x)', () => {
          const board = new Board(4, 3);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red'],  // 3-match
            ['blue', 'green', 'yellow'],
            ['purple', 'orange', 'blue'],
            ['green', 'yellow', 'purple']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 2
          const score = board.calculateScore(matches, 2);

          // 3 gems × 100 points × 1 (no size bonus) × 3 (level 2) = 900
          expect(score).toBe(900);
        });

        it('should combine size and cascade multipliers', () => {
          const board = new Board(4, 4);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red', 'red'],  // 4-match
            ['blue', 'green', 'yellow', 'purple'],
            ['orange', 'blue', 'green', 'red'],
            ['yellow', 'purple', 'orange', 'blue']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Calculate score at cascade level 2
          const score = board.calculateScore(matches, 2);

          // 4 gems × 100 points × 2 (size) × 3 (level 2) = 2400
          expect(score).toBe(2400);
        });

        it('should calculate total score for multiple matches', () => {
          const board = new Board(5, 3);
          const testConfig: (GemType | null)[][] = [
            ['red', 'red', 'red'],      // Horizontal 3-match (row 0)
            ['blue', 'green', 'yellow'],
            ['blue', 'purple', 'orange'],
            ['blue', 'orange', 'red'],   // Vertical 3-match (column 0, rows 1-3)
            ['yellow', 'purple', 'orange']
          ];

          board.initializeWithConfig(testConfig);
          const matches = board.findMatches();

          // Should have 2 matches: horizontal reds and vertical blues
          expect(matches.length).toBe(2);

          // Calculate score at cascade level 0
          const score = board.calculateScore(matches, 0);

          // Match 1: 3 reds × 100 × 1 × 1 = 300
          // Match 2: 3 blues × 100 × 1 × 1 = 300
          // Total = 600
          expect(score).toBe(600);
        });

        it('should return 0 for empty matches array', () => {
          const board = new Board(4, 3);
          const score = board.calculateScore([], 0);
          expect(score).toBe(0);
        });
      });
    });
  });
});
