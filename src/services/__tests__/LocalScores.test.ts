import { LocalScores } from '../LocalScores'

describe('LocalScores', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('getLevelBest', () => {
    it('should return null when no best score exists', () => {
      const best = LocalScores.getLevelBest(1)
      expect(best).toBeNull()
    })

    it('should return the best score for a level', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      const best = LocalScores.getLevelBest(1)

      expect(best).not.toBeNull()
      expect(best?.level).toBe(1)
      expect(best?.score).toBe(1000)
      expect(best?.stars).toBe(3)
      expect(best?.coinsEarned).toBe(60)
      expect(best?.movesUsed).toBe(15)
    })

    it('should convert timestamp to Date object', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      const best = LocalScores.getLevelBest(1)

      expect(best?.timestamp).toBeInstanceOf(Date)
    })
  })

  describe('getAllLevelBests', () => {
    it('should return empty array when no bests exist', () => {
      const bests = LocalScores.getAllLevelBests()
      expect(bests).toEqual([])
    })

    it('should return all level bests', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.saveIfLevelBest(2, 1500, 2, 40, 20)
      LocalScores.saveIfLevelBest(3, 2000, 3, 60, 18)

      const bests = LocalScores.getAllLevelBests()
      expect(bests).toHaveLength(3)
      expect(bests.map(b => b.level)).toContain(1)
      expect(bests.map(b => b.level)).toContain(2)
      expect(bests.map(b => b.level)).toContain(3)
    })
  })

  describe('saveIfLevelBest', () => {
    it('should save first score as best', () => {
      const isNewBest = LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      expect(isNewBest).toBe(true)

      const best = LocalScores.getLevelBest(1)
      expect(best?.score).toBe(1000)
    })

    it('should update best when new score is higher', () => {
      LocalScores.saveIfLevelBest(1, 1000, 2, 40, 20)
      const isNewBest = LocalScores.saveIfLevelBest(1, 1500, 3, 60, 15)

      expect(isNewBest).toBe(true)
      const best = LocalScores.getLevelBest(1)
      expect(best?.score).toBe(1500)
      expect(best?.stars).toBe(3)
    })

    it('should not update best when new score is lower', () => {
      LocalScores.saveIfLevelBest(1, 1500, 3, 60, 15)
      const isNewBest = LocalScores.saveIfLevelBest(1, 1000, 2, 40, 20)

      expect(isNewBest).toBe(false)
      const best = LocalScores.getLevelBest(1)
      expect(best?.score).toBe(1500)
    })

    it('should save player name when provided', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15, 'TestPlayer')

      const name = LocalScores.getLastPlayerName()
      expect(name).toBe('TestPlayer')
    })

    it('should add to history even when not a new best', () => {
      LocalScores.saveIfLevelBest(1, 1500, 3, 60, 15)
      LocalScores.saveIfLevelBest(1, 1000, 2, 40, 20)

      const history = LocalScores.getGameHistory()
      expect(history).toHaveLength(2)
    })

    it('should keep separate bests for different levels', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.saveIfLevelBest(2, 1500, 2, 40, 20)

      const best1 = LocalScores.getLevelBest(1)
      const best2 = LocalScores.getLevelBest(2)

      expect(best1?.score).toBe(1000)
      expect(best2?.score).toBe(1500)
    })
  })

  describe('getLastPlayerName / savePlayerName', () => {
    it('should return null when no name is saved', () => {
      const name = LocalScores.getLastPlayerName()
      expect(name).toBeNull()
    })

    it('should save and retrieve player name', () => {
      LocalScores.savePlayerName('TestPlayer')
      const name = LocalScores.getLastPlayerName()
      expect(name).toBe('TestPlayer')
    })

    it('should update player name', () => {
      LocalScores.savePlayerName('Player1')
      LocalScores.savePlayerName('Player2')
      const name = LocalScores.getLastPlayerName()
      expect(name).toBe('Player2')
    })
  })

  describe('getGameHistory', () => {
    it('should return empty array when no history exists', () => {
      const history = LocalScores.getGameHistory()
      expect(history).toEqual([])
    })

    it('should return game history in reverse chronological order', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.saveIfLevelBest(2, 1500, 2, 40, 20)

      const history = LocalScores.getGameHistory()
      expect(history).toHaveLength(2)
      expect(history[0].level).toBe(2) // Most recent first
      expect(history[1].level).toBe(1)
    })

    it('should limit history to MAX_HISTORY (20) entries', () => {
      // Add 25 games
      for (let i = 1; i <= 25; i++) {
        LocalScores.saveIfLevelBest(1, i * 100, 1, 20, 20)
      }

      const history = LocalScores.getGameHistory()
      expect(history).toHaveLength(20)
      expect(history[0].score).toBe(2500) // Most recent (25 * 100)
      expect(history[19].score).toBe(600) // 20th most recent (6 * 100)
    })
  })

  describe('addToHistory', () => {
    it('should add game to history', () => {
      LocalScores.addToHistory(1, 1000, 3, true)

      const history = LocalScores.getGameHistory()
      expect(history).toHaveLength(1)
      expect(history[0].level).toBe(1)
      expect(history[0].score).toBe(1000)
      expect(history[0].stars).toBe(3)
      expect(history[0].success).toBe(true)
    })

    it('should track unsuccessful attempts', () => {
      LocalScores.addToHistory(1, 500, 0, false)

      const history = LocalScores.getGameHistory()
      expect(history[0].success).toBe(false)
    })
  })

  describe('getStats', () => {
    it('should return zero stats when no data exists', () => {
      const stats = LocalScores.getStats()

      expect(stats.totalLevelsCompleted).toBe(0)
      expect(stats.totalStars).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.totalGamesPlayed).toBe(0)
      expect(stats.bestLevel).toBeNull()
      expect(stats.bestScore).toBe(0)
    })

    it('should calculate stats correctly', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.saveIfLevelBest(2, 1500, 2, 40, 20)
      LocalScores.saveIfLevelBest(3, 2000, 3, 60, 18)

      const stats = LocalScores.getStats()

      expect(stats.totalLevelsCompleted).toBe(3)
      expect(stats.totalStars).toBe(8) // 3 + 2 + 3
      expect(stats.averageScore).toBe(1500) // (1000 + 1500 + 2000) / 3
      expect(stats.bestLevel).toBe(3)
      expect(stats.bestScore).toBe(2000)
    })

    it('should count total games played from history', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15) // Game 1
      LocalScores.saveIfLevelBest(1, 800, 2, 40, 20)  // Game 2
      LocalScores.saveIfLevelBest(1, 1200, 3, 60, 18) // Game 3

      const stats = LocalScores.getStats()
      expect(stats.totalGamesPlayed).toBe(3)
      expect(stats.totalLevelsCompleted).toBe(1) // Only 1 level with best
    })
  })

  describe('getLevelHistory', () => {
    it('should return history for specific level', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.saveIfLevelBest(2, 1500, 2, 40, 20)
      LocalScores.saveIfLevelBest(1, 800, 2, 40, 20)

      const level1History = LocalScores.getLevelHistory(1)
      expect(level1History).toHaveLength(2)
      expect(level1History.every(h => h.level === 1)).toBe(true)
    })

    it('should return empty array for level with no history', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      const level2History = LocalScores.getLevelHistory(2)
      expect(level2History).toEqual([])
    })
  })

  describe('clearAll', () => {
    it('should clear all local score data', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.savePlayerName('TestPlayer')

      LocalScores.clearAll()

      expect(LocalScores.getLevelBest(1)).toBeNull()
      expect(LocalScores.getLastPlayerName()).toBeNull()
      expect(LocalScores.getGameHistory()).toEqual([])
    })
  })

  describe('clearHistory', () => {
    it('should clear only history, keeping bests and player name', () => {
      LocalScores.saveIfLevelBest(1, 1000, 3, 60, 15)
      LocalScores.savePlayerName('TestPlayer')

      LocalScores.clearHistory()

      expect(LocalScores.getLevelBest(1)).not.toBeNull()
      expect(LocalScores.getLastPlayerName()).toBe('TestPlayer')
      expect(LocalScores.getGameHistory()).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('phaser-match3-level-bests', 'invalid json')

      const bests = LocalScores.getAllLevelBests()
      expect(bests).toEqual([])
    })

    it('should handle corrupted history data gracefully', () => {
      localStorage.setItem('phaser-match3-game-history', 'invalid json')

      const history = LocalScores.getGameHistory()
      expect(history).toEqual([])
    })
  })
})
