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
});
