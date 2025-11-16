import { GemType } from './Board';

/**
 * Level completion status
 */
export enum LevelStatus {
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed'
}

/**
 * Gem color goal for a level
 */
export interface GemGoal {
  color: GemType;
  target: number;
  current: number;
}

/**
 * Manages level objectives including moves, gem color goals, and completion status
 */
export class LevelObjectives {
  private movesRemaining: number;
  private gemGoals: Map<GemType, GemGoal>;

  /**
   * Creates a new LevelObjectives instance
   * @param initialMoves - Number of moves available for this level
   * @param goals - Array of gem color goals to complete
   */
  constructor(initialMoves: number, goals: GemGoal[]) {
    this.movesRemaining = initialMoves;
    this.gemGoals = new Map();

    // Initialize gem goals map
    for (const goal of goals) {
      this.gemGoals.set(goal.color, { ...goal, current: 0 });
    }
  }

  /**
   * Decrements the moves counter by 1 (minimum 0)
   */
  makeMove(): void {
    if (this.movesRemaining > 0) {
      this.movesRemaining--;
    }
  }

  /**
   * Adds additional moves (used for buy turns feature)
   * @param count - Number of moves to add
   */
  addMoves(count: number): void {
    this.movesRemaining += count;
  }

  /**
   * Adds cleared gems to the goal tracker
   * @param color - The color of gems cleared
   * @param count - Number of gems cleared
   */
  addGemsCleared(color: GemType, count: number): void {
    const goal = this.gemGoals.get(color);
    if (goal) {
      goal.current = Math.min(goal.current + count, goal.target);
    }
  }

  /**
   * Gets the number of moves remaining
   */
  getMovesRemaining(): number {
    return this.movesRemaining;
  }

  /**
   * Gets all gem goals
   */
  getGemGoals(): GemGoal[] {
    return Array.from(this.gemGoals.values());
  }

  /**
   * Gets a specific gem goal by color
   */
  getGemGoal(color: GemType): GemGoal | undefined {
    return this.gemGoals.get(color);
  }

  /**
   * Calculates overall progress towards all gem goals (0.0 to 1.0)
   */
  getProgress(): number {
    if (this.gemGoals.size === 0) return 0;

    let totalProgress = 0;
    for (const goal of this.gemGoals.values()) {
      const goalProgress = Math.min(goal.current / goal.target, 1.0);
      totalProgress += goalProgress;
    }

    return totalProgress / this.gemGoals.size;
  }

  /**
   * Checks if all gem goals are met
   */
  private areAllGoalsMet(): boolean {
    for (const goal of this.gemGoals.values()) {
      if (goal.current < goal.target) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the current level status
   */
  getStatus(): LevelStatus {
    // Check if all gem goals are met
    if (this.areAllGoalsMet()) {
      return LevelStatus.PASSED;
    }

    // Check if out of moves
    if (this.movesRemaining === 0) {
      return LevelStatus.FAILED;
    }

    // Otherwise still in progress
    return LevelStatus.IN_PROGRESS;
  }

  /**
   * Checks if the level is complete (passed or failed)
   */
  isComplete(): boolean {
    const status = this.getStatus();
    return status === LevelStatus.PASSED || status === LevelStatus.FAILED;
  }
}
