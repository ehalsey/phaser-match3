import { Board } from '../Board';

describe('Board - Hammer Power-Up', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  describe('removeSingleGem', () => {
    it('should remove a gem from the board', () => {
      // Initialize board with a simple pattern
      board.initializeWithConfig([
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'blue', 'red'],
        ['green', 'yellow', 'red', 'purple', 'blue', 'orange', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'orange', 'blue', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Remove a gem from the middle
      const result = board.removeSingleGem({ row: 3, col: 4 });

      expect(result.removed).toBeTruthy();
      expect(result.removed?.color).toBe('orange');

      // Verify gem is now null
      const gem = board.getGemAt(3, 4);
      expect(gem).toBeNull();
    });

    it('should remove a gem from the bottom row', () => {
      // Initialize board
      board.initializeWithConfig([
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'blue', 'red'],
        ['green', 'yellow', 'red', 'purple', 'blue', 'orange', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'orange', 'blue', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Remove a gem from the bottom row (row 7, which is the last row)
      const result = board.removeSingleGem({ row: 7, col: 4 });

      expect(result.removed).toBeTruthy();
      expect(result.removed?.color).toBe('orange');

      // Verify gem is now null
      const gem = board.getGemAt(7, 4);
      expect(gem).toBeNull();
    });

    it('should allow gravity and refill after removing bottom row gem', () => {
      // Initialize board
      board.initializeWithConfig([
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'blue', 'red'],
        ['green', 'yellow', 'red', 'purple', 'blue', 'orange', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'orange', 'blue', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Store what was above the bottom row in column 4
      const aboveGem = board.getGemAt(6, 4); // Row 6, should be 'purple'
      expect(aboveGem?.color).toBe('purple');

      // Remove bottom row gem
      board.removeSingleGem({ row: 7, col: 4 });

      // Apply gravity
      const moves = board.applyGravity();

      // Verify moves were generated
      expect(moves.length).toBeGreaterThan(0);

      // Check that gems fell down
      // The gem from row 6 should now be at row 7
      const movedGem = board.getGemAt(7, 4);
      expect(movedGem?.color).toBe('purple');

      // Row 0 should now be null (waiting for refill)
      const topGem = board.getGemAt(0, 4);
      expect(topGem).toBeNull();

      // Refill the board
      const refills = board.refillBoard();

      // Verify refills happened
      expect(refills.length).toBeGreaterThan(0);

      // Check that top row is no longer null
      const refilledGem = board.getGemAt(0, 4);
      expect(refilledGem).not.toBeNull();
      expect(refilledGem?.color).toBeDefined();
    });

    it('should handle removing multiple gems including bottom row', () => {
      // Initialize board
      board.initializeWithConfig([
        ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'blue', 'red'],
        ['green', 'yellow', 'red', 'purple', 'blue', 'orange', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'orange', 'blue', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Remove bottom row gem
      board.removeSingleGem({ row: 7, col: 4 });

      // Remove another gem above it
      board.removeSingleGem({ row: 5, col: 4 });

      // Apply gravity
      const moves = board.applyGravity();

      // Should have moves for column 4
      const col4Moves = moves.filter(m => m.to.col === 4);
      expect(col4Moves.length).toBeGreaterThan(0);

      // Refill
      const refills = board.refillBoard();

      // Should refill 2 gems in column 4
      const col4Refills = refills.filter(r => r.position.col === 4);
      expect(col4Refills.length).toBe(2);

      // Verify no null gems remain
      for (let row = 0; row < 8; row++) {
        const gem = board.getGemAt(row, 4);
        expect(gem).not.toBeNull();
      }
    });
  });
});
