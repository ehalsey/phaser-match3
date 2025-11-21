/**
 * Local storage manager for personal best scores per level
 */

export interface LevelScore {
  level: number
  score: number
  stars: number
  coinsEarned: number
  movesUsed: number
  timestamp: Date
  playerName?: string
}

export interface GameHistory {
  level: number
  score: number
  stars: number
  success: boolean
  timestamp: Date
}

export class LocalScores {
  private static readonly LEVEL_BESTS_KEY = 'phaser-match3-level-bests'
  private static readonly PLAYER_NAME_KEY = 'phaser-match3-player-name'
  private static readonly GAME_HISTORY_KEY = 'phaser-match3-game-history'
  private static readonly MAX_HISTORY = 20

  /**
   * Get the personal best for a specific level
   */
  static getLevelBest(level: number): LevelScore | null {
    try {
      const bests = this.getAllLevelBests()
      const best = bests.find(b => b.level === level)
      if (best) {
        best.timestamp = new Date(best.timestamp)
      }
      return best || null
    } catch (error) {
      console.error(`Error reading level ${level} best:`, error)
      return null
    }
  }

  /**
   * Get all level bests
   */
  static getAllLevelBests(): LevelScore[] {
    try {
      const data = localStorage.getItem(this.LEVEL_BESTS_KEY)
      if (!data) return []

      const bests = JSON.parse(data)
      return bests.map((b: any) => ({
        ...b,
        timestamp: new Date(b.timestamp)
      }))
    } catch (error) {
      console.error('Error reading level bests:', error)
      return []
    }
  }

  /**
   * Save a new level best if score is higher
   * Returns true if this is a new personal best
   */
  static saveIfLevelBest(
    level: number,
    score: number,
    stars: number,
    coinsEarned: number,
    movesUsed: number,
    playerName?: string
  ): boolean {
    const currentBest = this.getLevelBest(level)
    const isNewBest = !currentBest || score > currentBest.score

    if (isNewBest) {
      const newBest: LevelScore = {
        level,
        score,
        stars,
        coinsEarned,
        movesUsed,
        timestamp: new Date(),
        playerName
      }

      try {
        const allBests = this.getAllLevelBests().filter(b => b.level !== level)
        allBests.push(newBest)
        localStorage.setItem(this.LEVEL_BESTS_KEY, JSON.stringify(allBests))

        if (playerName) {
          this.savePlayerName(playerName)
        }
      } catch (error) {
        console.error('Error saving level best:', error)
        return false
      }
    }

    // Always add to history
    this.addToHistory(level, score, stars, isNewBest)

    return isNewBest
  }

  /**
   * Get the last used player name
   */
  static getLastPlayerName(): string | null {
    try {
      return localStorage.getItem(this.PLAYER_NAME_KEY)
    } catch (error) {
      console.error('Error reading player name:', error)
      return null
    }
  }

  /**
   * Save player name for next time
   */
  static savePlayerName(name: string): void {
    try {
      localStorage.setItem(this.PLAYER_NAME_KEY, name)
    } catch (error) {
      console.error('Error saving player name:', error)
    }
  }

  /**
   * Get game history (last 20 games)
   */
  static getGameHistory(): GameHistory[] {
    try {
      const data = localStorage.getItem(this.GAME_HISTORY_KEY)
      if (!data) return []

      const history = JSON.parse(data)
      return history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    } catch (error) {
      console.error('Error reading game history:', error)
      return []
    }
  }

  /**
   * Add a game to history (keeps last MAX_HISTORY games)
   */
  static addToHistory(level: number, score: number, stars: number, success: boolean): void {
    try {
      const history = this.getGameHistory()
      history.unshift({
        level,
        score,
        stars,
        success,
        timestamp: new Date()
      })

      // Keep only last MAX_HISTORY games
      const trimmed = history.slice(0, this.MAX_HISTORY)

      localStorage.setItem(this.GAME_HISTORY_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('Error saving to history:', error)
    }
  }

  /**
   * Get statistics across all levels
   */
  static getStats(): {
    totalLevelsCompleted: number
    totalStars: number
    averageScore: number
    totalGamesPlayed: number
    bestLevel: number | null
    bestScore: number
  } {
    const bests = this.getAllLevelBests()
    const history = this.getGameHistory()

    if (bests.length === 0) {
      return {
        totalLevelsCompleted: 0,
        totalStars: 0,
        averageScore: 0,
        totalGamesPlayed: history.length,
        bestLevel: null,
        bestScore: 0
      }
    }

    const totalStars = bests.reduce((sum, b) => sum + b.stars, 0)
    const totalScore = bests.reduce((sum, b) => sum + b.score, 0)
    const bestScoreEntry = bests.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    return {
      totalLevelsCompleted: bests.length,
      totalStars,
      averageScore: Math.floor(totalScore / bests.length),
      totalGamesPlayed: history.length,
      bestLevel: bestScoreEntry.level,
      bestScore: bestScoreEntry.score
    }
  }

  /**
   * Get recent performance for a specific level
   */
  static getLevelHistory(level: number): GameHistory[] {
    return this.getGameHistory().filter(h => h.level === level)
  }

  /**
   * Clear all local score data
   */
  static clearAll(): void {
    try {
      localStorage.removeItem(this.LEVEL_BESTS_KEY)
      localStorage.removeItem(this.PLAYER_NAME_KEY)
      localStorage.removeItem(this.GAME_HISTORY_KEY)
    } catch (error) {
      console.error('Error clearing local data:', error)
    }
  }

  /**
   * Clear only history (keep bests and player name)
   */
  static clearHistory(): void {
    try {
      localStorage.removeItem(this.GAME_HISTORY_KEY)
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }
}
