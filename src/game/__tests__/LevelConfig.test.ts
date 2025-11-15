import { LevelConfig, LevelDifficulty } from '../LevelConfig';

describe('LevelConfig', () => {
  describe('Level Generation', () => {
    it('should generate level 1 with correct settings', () => {
      const level = LevelConfig.getLevel(1);

      expect(level.levelNumber).toBe(1);
      expect(level.difficulty).toBe(LevelDifficulty.EASY);
      expect(level.moves).toBeGreaterThan(0);
      expect(level.targetScore).toBeGreaterThan(0);
      expect(level.boardRows).toBeGreaterThan(0);
      expect(level.boardCols).toBeGreaterThan(0);
      expect(level.colorCount).toBeGreaterThan(0);
    });

    it('should generate different levels with different numbers', () => {
      const level1 = LevelConfig.getLevel(1);
      const level2 = LevelConfig.getLevel(2);
      const level3 = LevelConfig.getLevel(3);

      expect(level1.levelNumber).toBe(1);
      expect(level2.levelNumber).toBe(2);
      expect(level3.levelNumber).toBe(3);
    });

    it('should generate levels with all three difficulty types', () => {
      const levels = Array.from({ length: 15 }, (_, i) => LevelConfig.getLevel(i + 1));

      const hasEasy = levels.some(l => l.difficulty === LevelDifficulty.EASY);
      const hasMedium = levels.some(l => l.difficulty === LevelDifficulty.MEDIUM);
      const hasHard = levels.some(l => l.difficulty === LevelDifficulty.HARD);

      expect(hasEasy).toBe(true);
      expect(hasMedium).toBe(true);
      expect(hasHard).toBe(true);
    });
  });

  describe('Difficulty Pattern', () => {
    it('should never have back-to-back hard levels', () => {
      // Check first 100 levels
      for (let i = 1; i < 100; i++) {
        const current = LevelConfig.getLevel(i);
        const next = LevelConfig.getLevel(i + 1);

        if (current.difficulty === LevelDifficulty.HARD) {
          expect(next.difficulty).not.toBe(LevelDifficulty.HARD);
        }
      }
    });

    it('should have a deterministic pattern (same each time)', () => {
      const firstRun = Array.from({ length: 30 }, (_, i) =>
        LevelConfig.getLevel(i + 1).difficulty
      );

      const secondRun = Array.from({ length: 30 }, (_, i) =>
        LevelConfig.getLevel(i + 1).difficulty
      );

      expect(firstRun).toEqual(secondRun);
    });

    it('should repeat pattern every 15 levels', () => {
      const pattern1 = Array.from({ length: 15 }, (_, i) =>
        LevelConfig.getLevel(i + 1).difficulty
      );

      const pattern2 = Array.from({ length: 15 }, (_, i) =>
        LevelConfig.getLevel(i + 16).difficulty
      );

      expect(pattern1).toEqual(pattern2);
    });

    it('should not be sequential (E→M→H→E→M→H...)', () => {
      const levels = Array.from({ length: 15 }, (_, i) =>
        LevelConfig.getLevel(i + 1).difficulty
      );

      // Check it's not the sequential pattern
      const isSequential = levels.every((difficulty, index) => {
        const expectedSequential = [
          LevelDifficulty.EASY,
          LevelDifficulty.MEDIUM,
          LevelDifficulty.HARD
        ][index % 3];
        return difficulty === expectedSequential;
      });

      expect(isSequential).toBe(false);
    });
  });

  describe('Difficulty Settings', () => {
    it('should give easy levels more moves than medium', () => {
      const easy = LevelConfig.getLevel(1); // Level 1 is easy
      const medium = LevelConfig.getLevel(2); // Level 2 is medium

      expect(easy.moves).toBeGreaterThan(medium.moves);
    });

    it('should give medium levels more moves than hard', () => {
      const medium = LevelConfig.getLevel(2); // Level 2 is medium
      const hard = LevelConfig.getLevel(5); // Level 5 is hard

      expect(medium.moves).toBeGreaterThan(hard.moves);
    });

    it('should give easy levels lower target score than medium', () => {
      const easy = LevelConfig.getLevel(1);
      const medium = LevelConfig.getLevel(2);

      expect(easy.targetScore).toBeLessThan(medium.targetScore);
    });

    it('should give medium levels lower target score than hard', () => {
      const medium = LevelConfig.getLevel(2);
      const hard = LevelConfig.getLevel(5);

      expect(medium.targetScore).toBeLessThan(hard.targetScore);
    });

    it('should use fewer colors for easy levels', () => {
      const easy = LevelConfig.getLevel(1);
      const hard = LevelConfig.getLevel(5);

      expect(easy.colorCount).toBeLessThanOrEqual(hard.colorCount);
    });
  });

  describe('Progressive Difficulty', () => {
    it('should increase target score as player progresses through level sets', () => {
      const level1 = LevelConfig.getLevel(1);
      const level16 = LevelConfig.getLevel(16); // Same difficulty, next cycle
      const level31 = LevelConfig.getLevel(31); // Same difficulty, two cycles later

      // Same difficulty type, but later levels should have higher scores
      expect(level16.targetScore).toBeGreaterThan(level1.targetScore);
      expect(level31.targetScore).toBeGreaterThan(level16.targetScore);
    });
  });

  describe('Utility Methods', () => {
    it('should return correct color for each difficulty', () => {
      expect(LevelConfig.getDifficultyColor(LevelDifficulty.EASY)).toBe(0x2ecc71);
      expect(LevelConfig.getDifficultyColor(LevelDifficulty.MEDIUM)).toBe(0xf39c12);
      expect(LevelConfig.getDifficultyColor(LevelDifficulty.HARD)).toBe(0xe74c3c);
    });

    it('should return correct name for each difficulty', () => {
      expect(LevelConfig.getDifficultyName(LevelDifficulty.EASY)).toBe('Easy');
      expect(LevelConfig.getDifficultyName(LevelDifficulty.MEDIUM)).toBe('Medium');
      expect(LevelConfig.getDifficultyName(LevelDifficulty.HARD)).toBe('Hard');
    });
  });
});
