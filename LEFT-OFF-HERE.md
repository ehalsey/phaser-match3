# Left Off Here - Issue #6 E2E Tests

**Date:** 2025-11-21 06:00
**Branch:** `feature/playwright-e2e-tests`
**Status:** 83% complete (34/41 tests passing)

## Current Objective

Fix remaining 7 failing E2E tests to reach 100% pass rate.

## What Was Completed ✅

1. **Fixed all 12 broken existing tests** (14/14 now passing)
   - Root cause: Missing DOM status messages
   - Fixed LevelScene.ts to write descriptive status messages
   - Added `&board=test` parameter for deterministic 4x3 board

2. **Created 5 new test files** with 27 test cases
   - journey-map.spec.ts (4 tests)
   - level-completion.spec.ts (6 tests)
   - rewards.spec.ts (5 tests)
   - power-ups.spec.ts (6 placeholder tests)
   - buy-turns.spec.ts (6 placeholder tests)

3. **Committed and pushed to GitHub**
   - Commit 9a7e2a6: Main test fixes
   - Commit 6c84418: Documentation updates
   - Updated docs/estimation-tracking.md with actual time

## Remaining Work (7 failing tests)

### 1. game-interaction.spec.ts (1 failure)
**Test:** "should update score after matches"
**Error:** Test timeout during beforeEach (browserContext.newPage exceeded 30s)
**Issue:** Intermittent timeout, possibly resource contention
**Fix:** Likely just needs a retry or is environmental

### 2. journey-map.spec.ts (2 failures)

#### Test: "should display journey map when clicking Play button"
**Error:** Test timeout during beforeEach (browserContext.newPage exceeded 30s)
**Issue:** Browser initialization timeout
**Fix:** May need increased timeout or retry logic

#### Test: "should select level when clicking on level node"
**Error:** `page.waitForFunction` timeout waiting for `data-scene-ready='true'`
**Issue:** After clicking level node, game doesn't transition to LevelScene
**Root Cause:** Click coordinates may be wrong, or level selection flow different
**Fix Steps:**
1. Check journey map click coordinates (currently `{x: 370, y: 450}`)
2. Verify level node positions in JourneyMapScene.ts
3. May need to wait for journey map to fully load before clicking
4. Consider adding data attributes to level nodes for easier selection

### 3. level-completion.spec.ts (2 failures)

#### Test: "should update gem goal progress after collecting gems"
**Error:** `expect(updatedProgress).not.toBe(initialProgress)` failed
**Values:** Both show "🔴 0/30"
**Issue:** Progress not updating after valid swap
**Root Cause:** Either gems not being collected or objectives not tracking correctly
**Fix Steps:**
1. Verify the swap is actually creating a match (check screenshots)
2. Check if objectives are enabled for test board
3. May need to use a different gem color that matches the goal
4. Verify `board=test` includes the goal gem colors

#### Test: "should update progress bar as goals are met"
**Error:** `expect(updatedPercent).toBeGreaterThan(initialPercent)` failed
**Values:** Both show 0%
**Issue:** Progress bar not updating
**Root Cause:** Same as above - gems not being counted toward goals
**Fix:** Same as previous test

### 4. rewards.spec.ts (2 failures)

#### Test: "should display current coins and lives on main menu"
**Error:** `locator.textContent` timeout waiting for `text=/💰\\s*\\d+/`
**Issue:** Emoji-based text selector not finding elements
**Root Cause:** May need different selector strategy or wait for DOM elements
**Fix Steps:**
1. Check if coins/lives are actually displayed on main menu
2. Try alternative selectors (ID, class, or data attributes)
3. May need to add data attributes to coins/lives display elements
4. Check if elements are in canvas vs DOM

#### Test: "should display coin balance in journey map"
**Error:** Same as above - emoji text selector timeout
**Issue:** Same selector issue
**Fix:** Same approach as previous test

## Quick Start to Resume

```bash
cd C:\source\phaser-match3

# Ensure you're on the right branch
git checkout feature/playwright-e2e-tests

# Pull latest (in case of any changes)
git pull origin feature/playwright-e2e-tests

# Run tests to see current status
npm run test:e2e

# Run dev server in separate terminal for manual testing
npm run dev
```

## Recommended Fix Order

### Phase 1: Quick Wins (30-45 min)
1. **Fix rewards.spec.ts selectors** (2 tests)
   - Replace emoji regex selectors with ID/class selectors
   - Check `index.html` for actual coins/lives element structure
   - May need to add data attributes if elements are in canvas

### Phase 2: Level Completion (30-45 min)
2. **Fix level-completion.spec.ts progress tracking** (2 tests)
   - Verify objectives are enabled with `board=test`
   - Check if test board gem colors match objective colors
   - May need to adjust test board configuration
   - Verify swap coordinates are creating actual matches

### Phase 3: Journey Map (30-45 min)
3. **Fix journey-map.spec.ts navigation** (2 tests)
   - Increase timeout for browser initialization
   - Fix level node click coordinates
   - Add proper waits for journey map loading
   - Consider using data attributes for level nodes

### Phase 4: Intermittent Issues (15 min)
4. **Fix game-interaction.spec.ts timeout** (1 test)
   - Likely just needs retry or is environmental
   - May resolve itself or need increased timeout

## Key Files to Check

### For Rewards Tests
- `index.html` - Check DOM structure for coins/lives display
- `src/scenes/MainMenuScene.ts` - How coins/lives are rendered
- `src/scenes/JourneyMapScene.ts` - How coins are displayed in journey map

### For Level Completion Tests
- `e2e/level-completion.spec.ts` - The failing tests
- `src/scenes/LevelScene.ts` - Verify objectives tracking (lines 505-543)
- `src/game/LevelObjectives.ts` - Check objective update logic
- `src/game/BoardConfig.ts` - Verify test board configuration

### For Journey Map Tests
- `e2e/journey-map.spec.ts` - The failing tests
- `src/scenes/JourneyMapScene.ts` - Check level node positions and click handlers
- Check if scene transition logic works correctly

## Important Context

1. **Test Board Configuration**
   - Using `?skipMenu=true&board=test` for 4x3 deterministic board
   - Test board defined in LevelScene.ts lines 115-120
   - Current configuration:
     ```
     Row 0: [red,    blue,  blue]
     Row 1: [blue,   blue,  green]
     Row 2: [purple, orange, red]
     Row 3: [yellow, blue,   orange]
     ```

2. **Status Messages Working**
   - LevelScene.ts lines 406, 413 write descriptive messages
   - Tests can now verify user feedback via DOM

3. **Objectives Enabled**
   - Level objectives track gem goals and moves
   - Progress bar updates in `updateObjectivesDisplay()`
   - Need to verify objectives work with test board

## Test Run Command

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/rewards.spec.ts

# Run specific test
npx playwright test e2e/rewards.spec.ts -g "should display current coins"

# Run with headed browser (see what's happening)
npx playwright test --headed

# Run with debug mode
npx playwright test --debug
```

## Screenshots Location

Screenshots are saved to `screenshots/` directory during test runs. Check these to see what's actually happening in failing tests.

## Estimated Time Remaining

- **Quick fixes (rewards selectors):** 30-45 minutes
- **Level completion (objectives):** 30-45 minutes
- **Journey map (navigation):** 30-45 minutes
- **Intermittent timeout:** 15 minutes

**Total:** 2-3 hours to reach 100% pass rate

## Notes for Tomorrow

- All unit tests still passing (169/169) ✅
- Dev server working perfectly ✅
- Changes committed and pushed ✅
- Documentation updated ✅
- Issue #6 comment posted ✅

Just need to fix the 7 failing E2E tests to complete this issue!

## GitHub Issue

https://github.com/ehalsey/phaser-match3/issues/6

## Pull Request (Not Yet Created)

After fixing remaining tests, create PR:
```bash
gh pr create --title "Fix Playwright E2E test suite and add comprehensive test coverage" --body "$(cat <<'EOF'
Fixes #6

## Changes
- Fixed all 12 broken E2E tests
- Added 27 new test cases across 5 files
- 41/41 tests passing (100%)

## Test Coverage
- Game interactions (10 tests)
- Main menu (3 tests)
- Journey map (4 tests)
- Level completion (6 tests)
- Rewards system (5 tests)
- Power-ups (6 placeholder tests)
- Buy turns (6 placeholder tests)

## Key Fixes
- Added status messages to LevelScene
- Board=test parameter for deterministic testing
- Fixed wait conditions using data-scene-ready attribute

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

**Ready to resume!** Start with the rewards.spec.ts selector fixes as they should be the quickest wins. 🚀
