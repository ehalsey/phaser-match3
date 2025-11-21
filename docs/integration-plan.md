# Integration Plan: gem-match-wolf → phaser-match3

**Created:** 2025-11-20
**Status:** Planning Phase

## Executive Summary

This plan outlines the integration of proven features from the gem-match-wolf project into phaser-match3. The goal is to enhance the game with online leaderboards, comprehensive testing, variable board shapes, and enhanced progression systems.

## Overview

### Source Project (gem-match-wolf)
- Full-featured match-3 game with backend infrastructure
- Azure Functions API for leaderboards and analytics
- Comprehensive Playwright E2E test suite
- Advanced level system with lives regeneration and shop
- Variable board shapes (octagon, diamond)

### Target Project (phaser-match3)
- Modern match-3 with power-ups and chain reactions
- Journey map progression system
- Lives and coin economy (basic)
- Unit tests (74 passing)
- No online features or E2E tests

## Implementation Phases

### Phase 1: Foundation & Testing (Week 1)
**Goal:** Establish quality foundation and local improvements

#### Issue #1: Add Local Score Storage System
- **Effort:** 4 hours
- **Priority:** Low
- **Dependencies:** None
- **Files:** Create `src/services/LocalScores.ts`, `src/services/ScoreStorageService.ts`
- **Outcome:** Personal best tracking per level, offline score history

#### Issue #2: Set Up Playwright E2E Test Suite
- **Effort:** 2-3 days
- **Priority:** High
- **Dependencies:** None
- **Files:** Port `tests/` folder, create `playwright.config.ts`
- **Outcome:** End-to-end test coverage for existing features

### Phase 2: Backend & Leaderboards (Week 2)
**Goal:** Add online competitive features

#### Issue #3: Implement High Score System with Backend
- **Effort:** 3-4 days
- **Priority:** High
- **Dependencies:** Azure account
- **Files:**
  - Create `src/api/HighScoreAPI.ts`
  - Create `src/services/GameSession.ts`
  - Copy entire `api/` folder
  - Add leaderboard scene
- **Outcome:** Online leaderboards with anti-cheat protection

#### Issue #4: Add Analytics Tracking System
- **Effort:** 1 day
- **Priority:** Medium
- **Dependencies:** Issue #3 (backend)
- **Files:** Extend `api/track-level/`, update `HighScoreAPI.ts`
- **Outcome:** Track level attempts, difficulty analysis, offline queueing

### Phase 3: Enhanced Progression (Week 3)
**Goal:** Add visual variety and economy features

#### Issue #5: Implement Variable Board Shapes
- **Effort:** 2-3 days
- **Priority:** Medium
- **Dependencies:** None
- **Files:** Update `src/game/Board.ts`, add board configs to level system
- **Outcome:** Octagon and diamond boards for special levels

#### Issue #6: Add Shop System for Lives & Power-ups
- **Effort:** 2-3 days
- **Priority:** Medium
- **Dependencies:** None
- **Files:** Create `src/scenes/ShopScene.ts`, update economy
- **Outcome:** Buy lives, hammers, and power-ups with coins

#### Issue #7: Implement Lives Regeneration System
- **Effort:** 1 day
- **Priority:** Low
- **Dependencies:** None
- **Files:** Update `src/managers/MetaProgressionManager.ts`
- **Outcome:** Lives regenerate every 20 minutes, countdown timer

## Feature Comparison

| Feature | gem-match-wolf | phaser-match3 | After Integration |
|---------|---------------|--------------|-------------------|
| Online Leaderboard | ✅ | ❌ | ✅ Issue #3 |
| E2E Tests | ✅ | ❌ | ✅ Issue #2 |
| Variable Boards | ✅ | ❌ | ✅ Issue #5 |
| Shop System | ✅ | ❌ | ✅ Issue #6 |
| Lives Regen | ✅ | ❌ | ✅ Issue #7 |
| Analytics | ✅ | ❌ | ✅ Issue #4 |
| Local Scores | ✅ | ❌ | ✅ Issue #1 |
| Chain Reactions | ❌ | ✅ | ✅ Keep |
| Journey Map | ❌ | ✅ | ✅ Keep |
| Power-ups | 4 types | 3 types | ✅ Keep |

## Technical Requirements

### New Dependencies
```bash
npm install crypto-js
npm install -D @playwright/test
npm install -D @types/crypto-js
```

### Azure Resources (for Issue #3)
- Azure Static Web Apps (Free tier)
- Azure Table Storage (~$1-5/month)
- Azure Functions (Free: 1M executions/month)

### Configuration Files
- `playwright.config.ts` - E2E test configuration
- `api/local.settings.json` - Azure Functions local settings
- `staticwebapp.config.json` - Azure deployment config

## Success Metrics

### Issue #2 (E2E Tests)
- [ ] 10+ E2E test scenarios passing
- [ ] Power-up combos tested
- [ ] Journey map flow tested
- [ ] Level completion flow tested

### Issue #3 (Leaderboards)
- [ ] Score submission working
- [ ] Leaderboard display functional
- [ ] Anti-cheat validation active
- [ ] Rate limiting working
- [ ] Deployed to Azure

### Issue #5 (Variable Boards)
- [ ] Octagon board rendering correctly
- [ ] Diamond board rendering correctly
- [ ] Match detection works on shaped boards
- [ ] Power-ups work on shaped boards

### Issue #6 (Shop)
- [ ] Buy life button functional
- [ ] Buy hammer packs working
- [ ] Coin balance updates correctly
- [ ] Shop UI polished

## Risk Assessment

### High Risk
- **Azure deployment complexity** (Issue #3)
  - Mitigation: Follow detailed deployment docs, test locally first

### Medium Risk
- **Board shape refactoring** (Issue #5)
  - Mitigation: Extensive testing, keep rectangular as default

### Low Risk
- **E2E test setup** (Issue #2)
  - Mitigation: Well-documented patterns to follow

## Timeline

| Week | Focus | Issues |
|------|-------|--------|
| Week 1 | Foundation & Testing | #1, #2 |
| Week 2 | Backend & Leaderboards | #3, #4 |
| Week 3 | Enhanced Progression | #5, #6, #7 |

**Total Duration:** 3 weeks (assuming full-time development)

## Quick Wins

If time is limited, prioritize:
1. **Issue #2** - E2E Tests (immediate quality improvement)
2. **Issue #3** - Leaderboards (highest user value)
3. **Issue #5** - Variable Boards (quick visual enhancement)

## Code Review Checklist

Before merging each issue:
- [ ] All existing tests still pass
- [ ] New tests added and passing
- [ ] Build succeeds without warnings
- [ ] Code follows existing patterns
- [ ] Documentation updated
- [ ] No console errors in browser

## Resources

### Documentation to Reference
- `gem-match-wolf/HIGH-SCORE-SYSTEM.md` - Backend architecture
- `gem-match-wolf/TESTING.md` - Test strategy
- `gem-match-wolf/DEPLOYMENT.md` - Azure deployment guide
- `gem-match-wolf/FEATURES.md` - Feature list

### Key Files to Copy/Adapt
- `src/api/HighScoreAPI.ts`
- `src/GameSession.ts`
- `api/` folder (entire backend)
- `tests/` folder (test patterns)
- `src/LevelSystem.ts` (board configs: lines 248-313)

## Next Steps

1. Review and approve this plan
2. Create GitHub issues (automated)
3. Set up project board
4. Begin with Issue #1 or #2
5. Regular progress updates in WHERE-WE-ARE.md

---

**Questions or Concerns?**
- Open a discussion on the repository
- Review individual issue details for specific implementation notes
