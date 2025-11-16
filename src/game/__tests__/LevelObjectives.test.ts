import { LevelObjectives, LevelStatus, GemGoal } from '../LevelObjectives';

describe('LevelObjectives', () => {
  describe('Initialization', () => {
    it('should initialize with correct moves and gem goals', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 }
      ];
      const objectives = new LevelObjectives(20, goals);

      expect(objectives.getMovesRemaining()).toBe(20);
      expect(objectives.getGemGoals()).toHaveLength(1);
      expect(objectives.getGemGoal('red')).toEqual({ color: 'red', target: 30, current: 0 });
      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should initialize with multiple gem goals', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 },
        { color: 'blue', target: 20, current: 0 }
      ];
      const objectives = new LevelObjectives(15, goals);

      expect(objectives.getMovesRemaining()).toBe(15);
      expect(objectives.getGemGoals()).toHaveLength(2);
      expect(objectives.getGemGoal('red')).toEqual({ color: 'red', target: 30, current: 0 });
      expect(objectives.getGemGoal('blue')).toEqual({ color: 'blue', target: 20, current: 0 });
    });
  });

  describe('Move Management', () => {
    it('should decrement moves when a move is made', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(19);
    });

    it('should not go below 0 moves', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(1, goals);

      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(0);
    });

    it('should track multiple moves', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.makeMove();
      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getMovesRemaining()).toBe(17);
    });
  });

  describe('Gem Clearing Tracking', () => {
    it('should track gems cleared for a goal', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 5);

      const redGoal = objectives.getGemGoal('red');
      expect(redGoal?.current).toBe(5);
    });

    it('should accumulate gems cleared across multiple calls', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 5);
      objectives.addGemsCleared('red', 10);
      objectives.addGemsCleared('red', 3);

      const redGoal = objectives.getGemGoal('red');
      expect(redGoal?.current).toBe(18);
    });

    it('should track multiple gem colors independently', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 },
        { color: 'blue', target: 20, current: 0 }
      ];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 10);
      objectives.addGemsCleared('blue', 5);
      objectives.addGemsCleared('red', 5);

      expect(objectives.getGemGoal('red')?.current).toBe(15);
      expect(objectives.getGemGoal('blue')?.current).toBe(5);
    });

    it('should not exceed target when clearing gems', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 25);
      objectives.addGemsCleared('red', 10);

      expect(objectives.getGemGoal('red')?.current).toBe(30);
    });

    it('should ignore gems cleared for colors not in goals', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('blue', 10);

      expect(objectives.getGemGoal('blue')).toBeUndefined();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate 0% progress when no gems cleared', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      expect(objectives.getProgress()).toBe(0);
    });

    it('should calculate 50% progress when half of single goal met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 15);

      expect(objectives.getProgress()).toBe(0.5);
    });

    it('should calculate 100% progress when goal is met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30);

      expect(objectives.getProgress()).toBe(1.0);
    });

    it('should calculate average progress across multiple goals', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 },
        { color: 'blue', target: 20, current: 0 }
      ];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30); // 100%
      objectives.addGemsCleared('blue', 10); // 50%

      expect(objectives.getProgress()).toBe(0.75); // (100% + 50%) / 2
    });

    it('should cap progress at 100% even if goals exceeded', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 50);

      expect(objectives.getProgress()).toBe(1.0);
    });
  });

  describe('Level Status', () => {
    it('should be IN_PROGRESS when level starts', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should be PASSED when all goals are met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30);

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });

    it('should be PASSED when all multiple goals are met', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 },
        { color: 'blue', target: 20, current: 0 }
      ];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30);
      objectives.addGemsCleared('blue', 20);

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });

    it('should be FAILED when moves run out without meeting goals', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(2, goals);

      objectives.addGemsCleared('red', 15);
      objectives.makeMove();
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.FAILED);
    });

    it('should be IN_PROGRESS when there are moves left and goals not met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 15);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should be IN_PROGRESS when only some goals met', () => {
      const goals: GemGoal[] = [
        { color: 'red', target: 30, current: 0 },
        { color: 'blue', target: 20, current: 0 }
      ];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30);
      objectives.addGemsCleared('blue', 10);

      expect(objectives.getStatus()).toBe(LevelStatus.IN_PROGRESS);
    });

    it('should be PASSED when goals met on last move', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(1, goals);

      objectives.addGemsCleared('red', 30);
      objectives.makeMove();

      expect(objectives.getStatus()).toBe(LevelStatus.PASSED);
    });
  });

  describe('Level Completion Check', () => {
    it('should not be complete at start', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      expect(objectives.isComplete()).toBe(false);
    });

    it('should be complete when all goals are met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 30);

      expect(objectives.isComplete()).toBe(true);
    });

    it('should be complete when moves run out', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(1, goals);

      objectives.makeMove();

      expect(objectives.isComplete()).toBe(true);
    });

    it('should not be complete if moves remain and goals not met', () => {
      const goals: GemGoal[] = [{ color: 'red', target: 30, current: 0 }];
      const objectives = new LevelObjectives(20, goals);

      objectives.addGemsCleared('red', 15);
      objectives.makeMove();

      expect(objectives.isComplete()).toBe(false);
    });
  });
});
