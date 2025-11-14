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
        // TODO: Implement match detection
        expect(true).toBe(true);
      });
    });

    describe('Test 4: Detect vertical matches', () => {
      it('should detect a vertical match of 3 gems in a column', () => {
        // TODO: Implement match detection
        expect(true).toBe(true);
      });
    });
  });
});
