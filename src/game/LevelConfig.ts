import { GemType } from './Board';
import { GemGoal } from './LevelObjectives';

/**
 * Level difficulty settings
 */
export enum LevelDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard'
}

export interface LevelSettings {
  levelNumber: number;
  difficulty: LevelDifficulty;
  moves: number;
  gemGoals: GemGoal[];
  boardRows: number;
  boardCols: number;
  colorCount: number;
}

/**
 * Generates level configurations with varying difficulty
 * - Unlimited levels
 * - Deterministic difficulty pattern (same every time)
 * - No back-to-back hard levels
 * - Varied pattern (not sequential E→M→H)
 */
export class LevelConfig {
  /**
   * Generate settings for a specific level
   * Uses a deterministic algorithm to ensure variety without back-to-back hard levels
   */
  static getLevel(levelNumber: number): LevelSettings {
    const difficulty = this.getDifficulty(levelNumber);

    return {
      levelNumber,
      difficulty,
      ...this.getDifficultySettings(difficulty, levelNumber)
    };
  }

  /**
   * Determines difficulty for a level using a deterministic pattern
   * Pattern ensures:
   * - No back-to-back hard levels
   * - Varied difficulty (not sequential)
   * - Deterministic (same pattern each time)
   */
  private static getDifficulty(levelNumber: number): LevelDifficulty {
    // Use a pseudo-random but deterministic pattern based on level number
    // This creates variety while ensuring no back-to-back hard levels

    const patterns: LevelDifficulty[] = [
      LevelDifficulty.EASY,    // 1
      LevelDifficulty.MEDIUM,  // 2
      LevelDifficulty.EASY,    // 3
      LevelDifficulty.MEDIUM,  // 4
      LevelDifficulty.HARD,    // 5
      LevelDifficulty.EASY,    // 6
      LevelDifficulty.MEDIUM,  // 7
      LevelDifficulty.MEDIUM,  // 8
      LevelDifficulty.EASY,    // 9
      LevelDifficulty.HARD,    // 10
      LevelDifficulty.MEDIUM,  // 11
      LevelDifficulty.EASY,    // 12
      LevelDifficulty.MEDIUM,  // 13
      LevelDifficulty.HARD,    // 14
      LevelDifficulty.EASY,    // 15
    ];

    // Use modulo to repeat pattern infinitely
    const index = (levelNumber - 1) % patterns.length;
    return patterns[index];
  }

  /**
   * Get difficulty-specific settings
   */
  private static getDifficultySettings(difficulty: LevelDifficulty, levelNumber: number): Omit<LevelSettings, 'levelNumber' | 'difficulty'> {
    // Gradually increase difficulty as levels progress
    const progressionMultiplier = 1 + Math.floor((levelNumber - 1) / 15) * 0.1;

    // Available colors for goals (rotate through them deterministically)
    const availableColors: GemType[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    const getColor = (index: number): GemType => availableColors[(levelNumber + index) % availableColors.length];

    switch (difficulty) {
      case LevelDifficulty.EASY:
        // Easy: 30 of one color
        return {
          moves: 25,
          gemGoals: [
            { color: getColor(0), target: Math.floor(30 * progressionMultiplier), current: 0 }
          ],
          boardRows: 8,
          boardCols: 8,
          colorCount: 5 // Fewer colors = easier matches
        };

      case LevelDifficulty.MEDIUM:
        // Medium: 30 of one color + 20 of another
        return {
          moves: 20,
          gemGoals: [
            { color: getColor(0), target: Math.floor(30 * progressionMultiplier), current: 0 },
            { color: getColor(1), target: Math.floor(20 * progressionMultiplier), current: 0 }
          ],
          boardRows: 8,
          boardCols: 8,
          colorCount: 5
        };

      case LevelDifficulty.HARD:
        // Hard: 30 + 20 + 20 of three colors
        return {
          moves: 15,
          gemGoals: [
            { color: getColor(0), target: Math.floor(30 * progressionMultiplier), current: 0 },
            { color: getColor(1), target: Math.floor(20 * progressionMultiplier), current: 0 },
            { color: getColor(2), target: Math.floor(20 * progressionMultiplier), current: 0 }
          ],
          boardRows: 8,
          boardCols: 8,
          colorCount: 6 // More colors = harder to match
        };
    }
  }

  /**
   * Get display color for difficulty
   */
  static getDifficultyColor(difficulty: LevelDifficulty): number {
    switch (difficulty) {
      case LevelDifficulty.EASY:
        return 0x2ecc71; // Green
      case LevelDifficulty.MEDIUM:
        return 0xf39c12; // Orange
      case LevelDifficulty.HARD:
        return 0xe74c3c; // Red
    }
  }

  /**
   * Get display name for difficulty
   */
  static getDifficultyName(difficulty: LevelDifficulty): string {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  }
}
