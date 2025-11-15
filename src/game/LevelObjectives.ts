/**
 * Level completion status
 */
export enum LevelStatus {
  IN_PROGRESS = 'in_progress',
  PASSED = 'passed',
  FAILED = 'failed'
}

/**
 * Manages level objectives including moves, target score, and completion status
 */
export class LevelObjectives {
  private movesRemaining: number;
  private readonly targetScore: number;
  private currentScore: number = 0;

  /**
   * Creates a new LevelObjectives instance
   * @param initialMoves - Number of moves available for this level
   * @param targetScore - Score needed to pass the level
   */
  constructor(initialMoves: number, targetScore: number) {
    this.movesRemaining = initialMoves;
    this.targetScore = targetScore;
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
   * Updates the current score
   * @param score - The new score value
   */
  updateScore(score: number): void {
    this.currentScore = score;
  }

  /**
   * Gets the number of moves remaining
   */
  getMovesRemaining(): number {
    return this.movesRemaining;
  }

  /**
   * Gets the target score for this level
   */
  getTargetScore(): number {
    return this.targetScore;
  }

  /**
   * Gets the current score
   */
  getCurrentScore(): number {
    return this.currentScore;
  }

  /**
   * Calculates progress towards target score (0.0 to 1.0)
   */
  getProgress(): number {
    const progress = this.currentScore / this.targetScore;
    return Math.min(progress, 1.0);
  }

  /**
   * Gets the current level status
   */
  getStatus(): LevelStatus {
    // Check if target score reached
    if (this.currentScore >= this.targetScore) {
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
