import { LevelObjectives, LevelStatus } from '../LevelObjectives';

describe('LevelObjectives', () => {
  describe('Initialization', () => {
    it('should initialize with correct moves and target score', () => {
      const objectives = new LevelObjectives(20, 1000);

      expect(objectives.getMovesRemaining()).toBe(20);
      expect(objectives.getTargetScore()).toBe(1000);
      expect(objectives.getCurrentScore()).toBe(0);
      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should initialize with different values', () => {
      const objectives = new LevelObjectives(15, 2500);

      expect(objectives.getMovesRemaining()).toBe(15);
      expect(objectives.getTargetScore()).toBe(2500);
    });
  });

  describe('Move Management', () => {
    it('should decrement moves when a move is made', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(19);
    });

    it('should not go below 0 moves', () => {
      const objectives = new LevelObjectives(1, 1000);

      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(0);
    });

    it('should track multiple moves', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.makeMove();
      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(17);
    });
  });

  describe('Score Management', () => {
    it('should update current score', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(500);

      expect(objectives.getCurrentScore()).toBe(500);
    });

    it('should update score multiple times', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(300);
      objectives.updateScore(800);

      expect(objectives.getCurrentScore()).toBe(800);
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate 0% progress when score is 0', () => {
      const objectives = new LevelObjectives(20, 1000);

      expect(objectives.getProgress()).toBe(0);
    });

    it('should calculate 50% progress when score is half of target', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(500);

      expect(objectives.getProgress()).toBe(0.5);
    });

    it('should calculate 100% progress when score reaches target', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(1000);

      expect(objectives.getProgress()).toBe(1.0);
    });

    it('should cap progress at 100% even if score exceeds target', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(1500);

      expect(objectives.getProgress()).toBe(1.0);
    });
  });

  describe('Level Status', () => {
    it('should be IN_PROGRESS when level starts', () => {
      const objectives = new LevelObjectives(20, 1000);

      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should be PASSED when target score is reached', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(1000);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });

    it('should be PASSED even if score exceeds target', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(1500);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });

    it('should be FAILED when moves run out without reaching target', () => {
      const objectives = new LevelObjectives(2, 1000);

      objectives.updateScore(500);
      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.FAILED);
    });

    it('should be IN_PROGRESS when there are moves left and target not reached', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(500);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should be PASSED when target reached on last move', () => {
      const objectives = new LevelObjectives(1, 1000);

      objectives.updateScore(1000);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });
  });

  describe('Level Completion Check', () => {
    it('should not be complete at start', () => {
      const objectives = new LevelObjectives(20, 1000);

      expect(objectives.isComplete()).toBe(false);
    });

    it('should be complete when target is reached', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(1000);
      objectives.makeMove();

      expect(objectives.isComplete()).toBe(true);
    });

    it('should be complete when moves run out', () => {
      const objectives = new LevelObjectives(1, 1000);

      objectives.makeMove();

      expect(objectives.isComplete()).toBe(true);
    });

    it('should not be complete if moves remain and target not reached', () => {
      const objectives = new LevelObjectives(20, 1000);

      objectives.updateScore(500);
      objectives.makeMove();

      expect(objectives.isComplete()).toBe(false);
    });
  });
});
