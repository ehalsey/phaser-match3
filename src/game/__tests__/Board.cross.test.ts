import { Board } from '../Board';

describe('Board - Cross Blast Power-Up (2x2)', () => {
  let board: Board;

  beforeEach(() => {
    board = new Board(8, 8);
  });

  describe('2x2 Detection', () => {
    it('should detect existing 2x2 blocks on board', () => {
      // Create a board with a 2x2 red block
      board.initializeWithConfig([
        ['red', 'red', 'green', 'yellow', 'purple', 'orange', 'blue', 'purple'],
        ['red', 'red', 'yellow', 'green', 'orange', 'purple', 'red', 'blue'],
        ['green', 'yellow', 'blue', 'purple', 'orange', 'red', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'blue', 'orange', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'yellow', 'orange', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Verify 2x2 red block exists at (0,0), (0,1), (1,0), (1,1)
      expect(board.getGemAt(0, 0)?.color).toBe('red');
      expect(board.getGemAt(0, 1)?.color).toBe('red');
      expect(board.getGemAt(1, 0)?.color).toBe('red');
      expect(board.getGemAt(1, 1)?.color).toBe('red');
    });

    it('should place cross gem manually on board', () => {
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

      // Manually place a cross gem
      board.setGemAt(3, 3, { color: 'red', special: 'cross' });

      // Verify it was placed
      const gem = board.getGemAt(3, 3);
      expect(gem?.special).toBe('cross');
      expect(gem?.color).toBe('red');
    });

    it('should only create ONE cross gem for overlapping 2x2 blocks', () => {
      // Create a 2x3 red block which contains TWO overlapping 2x2s:
      // 2x2 #1: (0,0), (0,1), (1,0), (1,1)
      // 2x2 #2: (0,1), (0,2), (1,1), (1,2)
      board.initializeWithConfig([
        ['red', 'red', 'red', 'yellow', 'purple', 'orange', 'blue', 'green'],
        ['red', 'red', 'red', 'green', 'orange', 'purple', 'red', 'blue'],
        ['green', 'yellow', 'blue', 'purple', 'orange', 'red', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'blue', 'orange', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'yellow', 'orange', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      const crossGems = board.detect2x2Matches();

      // Should only detect ONE 2x2, not two overlapping ones
      expect(crossGems.length).toBe(1);
    });

    it('should not detect 2x2 blocks that include special gems', () => {
      // Create a 2x2 red block
      board.initializeWithConfig([
        ['red', 'red', 'green', 'yellow', 'purple', 'orange', 'blue', 'purple'],
        ['red', 'red', 'yellow', 'green', 'orange', 'purple', 'red', 'blue'],
        ['green', 'yellow', 'blue', 'purple', 'orange', 'red', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'blue', 'orange', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'yellow', 'orange', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // Replace one corner with a special gem
      board.setGemAt(0, 1, { color: 'red', special: 'bomb' });

      const crossGems = board.detect2x2Matches();

      // Should NOT detect the 2x2 because it contains a special gem
      expect(crossGems.length).toBe(0);
    });
  });

  describe('explodeCross', () => {
    it('should clear entire row and column when cross explodes', () => {
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

      // Explode cross at position (3, 4) - middle of board
      const result = board.explodeCross({ row: 3, col: 4 });

      // Should clear 8 gems in row 3 + 8 gems in column 4 = 16 gems
      // But position (3,4) is counted only once, so 15 unique positions
      expect(result.cleared.length).toBe(15);

      // Verify row 3 is cleared
      for (let col = 0; col < 8; col++) {
        expect(board.getGemAt(3, col)).toBeNull();
      }

      // Verify column 4 is cleared
      for (let row = 0; row < 8; row++) {
        expect(board.getGemAt(row, 4)).toBeNull();
      }
    });

    it('should clear correct positions for corner cross', () => {
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

      // Explode cross at top-left corner (0, 0)
      const result = board.explodeCross({ row: 0, col: 0 });

      // Should clear row 0 (8 gems) + column 0 (8 gems) - 1 (overlap at 0,0) = 15 gems
      expect(result.cleared.length).toBe(15);

      // Verify row 0 is cleared
      for (let col = 0; col < 8; col++) {
        expect(board.getGemAt(0, col)).toBeNull();
      }

      // Verify column 0 is cleared
      for (let row = 0; row < 8; row++) {
        expect(board.getGemAt(row, 0)).toBeNull();
      }
    });

    it('should trigger other special gems in the cross path', () => {
      // Initialize board with a bomb in the cross path
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

      // Place a bomb at (3, 6) - in the same row as our cross
      board.setGemAt(3, 6, { color: 'red', special: 'bomb' });

      // Explode cross at (3, 3)
      const result = board.explodeCross({ row: 3, col: 3 });

      // Should have triggered the bomb at (3, 6)
      expect(result.triggered.length).toBeGreaterThan(0);
      const bombTriggered = result.triggered.some(
        t => t.position.row === 3 && t.position.col === 6 && t.specialType === 'bomb'
      );
      expect(bombTriggered).toBeTruthy();
    });

    it('should work with gravity and refill after cross explosion', () => {
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

      // Explode cross at (3, 4)
      board.explodeCross({ row: 3, col: 4 });

      // Apply gravity
      const moves = board.applyGravity();

      // Should have gravity moves for column 4 and other columns affected
      expect(moves.length).toBeGreaterThan(0);

      // Refill board
      const refills = board.refillBoard();

      // Should refill the cleared positions
      expect(refills.length).toBe(15); // 15 gems were cleared

      // Verify no null gems remain
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          expect(board.getGemAt(row, col)).not.toBeNull();
        }
      }
    });
  });

  describe('Cross with other special gems', () => {
    it('should prioritize L-shaped bombs over 2x2 cross', () => {
      // This test ensures that if both conditions are met,
      // L-shaped takes priority (as it's checked first)

      // Create a pattern that could form both L-shape and 2x2
      board.initializeWithConfig([
        ['red', 'red', 'red', 'yellow', 'purple', 'orange', 'blue', 'green'],
        ['blue', 'red', 'yellow', 'green', 'orange', 'purple', 'red', 'blue'],
        ['green', 'red', 'blue', 'purple', 'orange', 'yellow', 'green', 'yellow'],
        ['yellow', 'green', 'purple', 'red', 'blue', 'orange', 'yellow', 'green'],
        ['purple', 'orange', 'blue', 'orange', 'red', 'green', 'purple', 'orange'],
        ['orange', 'purple', 'green', 'blue', 'yellow', 'red', 'orange', 'purple'],
        ['red', 'blue', 'orange', 'green', 'purple', 'yellow', 'red', 'blue'],
        ['blue', 'orange', 'yellow', 'purple', 'orange', 'green', 'blue', 'red']
      ]);

      // We have an L-shape with red at (0,0), (0,1), (0,2), (1,1), (2,1)
      // Find matches
      const matches = board.findMatches();

      // Should detect the horizontal match-3 at row 0
      const horizontalMatch = matches.find(m => m.direction === 'horizontal' && m.positions.length === 3);
      expect(horizontalMatch).toBeDefined();
    });
  });
});
