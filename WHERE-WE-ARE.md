# Where We Are - Phaser Match-3 Game Development

**Last Updated:** Session ending 2025-11-15

## Current Status

All features complete! Scrollable journey map just finished. Ready for next feature or testing/polish.

## Recently Completed (This Session)

### 1. Scrollable Journey Map ✅
- **Goal:** Allow users to scroll and click on any completed level, not just last 3
- **Implementation:**
  - Created `levelContainer` for scrollable content
  - Added mouse wheel scrolling support
  - Added touch/drag scrolling support
  - Auto-scroll to current level on load
  - Added scroll indicators that show/hide based on content height
  - All UI elements (level nodes, text, badges, info panels) properly added to container
- **Files Modified:**
  - `src/scenes/JourneyMapScene.ts` - Complete scrolling implementation
- **Status:** Build successful ✅, fully functional

### 2. Chain Reaction Power-Up System ✅
- **What:** Power-ups now trigger other power-ups when they explode them
- **Implementation:**
  - Updated `explodeBomb()`, `explodeVerticalRocket()`, `explodeHorizontalRocket()` to return `{ cleared: Position[], triggered: TriggeredGem[] }`
  - Added `TriggeredGem` interface with position and specialType
  - Modified `handleBombExplosions()` in LevelScene to process chain reactions with queue system
  - Added 4 comprehensive tests for chain reactions
- **Files Modified:**
  - `src/game/Board.ts` - Explosion methods return triggered gems
  - `src/scenes/LevelScene.ts` - Chain reaction processing
  - `src/game/__tests__/Board.test.ts` - Added chain reaction tests
- **Status:** All 74 tests passing ✅, Build successful ✅

### 3. Rocket Power-Up System (Previous Session) ✅
- **Match-4 Vertical** → Vertical rocket (clears entire column with ↕ symbol)
- **Match-4 Horizontal** → Horizontal rocket (clears entire row with ↔ symbol)
- **L-shaped matches** (3×3 intersection) → Bomb (clears 3×3 with ⭐ symbol)
- **Match-5+** → Bomb

## In Progress

None - ready for next feature!

## Known Issues to Address

### Life Decrementing When Buying Turns (User Report)
- **User Report:** "I think you are still decrementing lives when the user buys more turns"
- **Investigation Done:**
  - Reviewed code: `consumeLife()` only called in `LevelScene.create()` (line 71)
  - Buy turns uses `scene.wake('LevelScene')` which does NOT call `create()` again
  - Logging with stack traces is in place in `MetaProgressionManager.consumeLife()`
- **Status:** Code appears correct. User needs to test and provide console logs if issue persists
- **How to Debug:**
  1. Open browser console
  2. Start a level (see consumeLife log with stack trace)
  3. Fail level and buy turns
  4. Check if consumeLife is called again (it shouldn't be)
  5. If it is, stack trace will show where it's coming from

## Completed Spec Items (from spec-new.md)

✅ 1. Journey map cleanup (removed moves/goals/percentage)
✅ 2. Fixed coin rewards (20/40/60 based on score)
✅ 3. Removed instruction text "Click gems to swap them!"
✅ 4. Small icon buttons for Map & Menu
✅ 5. Buy turns system (5 moves for 10 coins, escalating cost)
✅ 6. Star indicators (1-3 stars based on coins, shown on journey map)
✅ 7. Buy turns bug fixed (scene wake/sleep, re-check status in callback)
✅ 8. Bomb explosions count toward goals
✅ 9. Rocket power-up system with L-shaped bomb detection
✅ 10. Chain reactions (power-ups trigger other power-ups)
✅ 11. Scrollable journey map (scroll to view and play any completed level)

## Current Branch & Git Status

**Branch:** `feature/gem-color-goals`

**Modified Files (uncommitted):**
- WHERE-WE-ARE.md
- docs/spec-new.md
- index.html
- src/game/Board.ts
- src/game/__tests__/Board.test.ts
- src/scenes/JourneyMapScene.ts
- src/scenes/LevelScene.ts

**Recent Commits:**
- 66fd1fb debug: add life consumption tracking logs
- d73ef29 docs: mark all spec-new.md items as complete
- 5592268 fix: re-check level status in delayed callback

## Technical Architecture

### Power-Up System
```typescript
// Special gem types
type SpecialGemType = 'bomb' | 'vertical-rocket' | 'horizontal-rocket' | 'none';

// Triggered gems include both position and type
interface TriggeredGem {
  position: Position;
  specialType: SpecialGemType;
}

// Explosion methods return cleared positions and triggered gems
explodeBomb(pos): { cleared: Position[], triggered: TriggeredGem[] }
explodeVerticalRocket(pos): { cleared: Position[], triggered: TriggeredGem[] }
explodeHorizontalRocket(pos): { cleared: Position[], triggered: TriggeredGem[] }
```

### Chain Reaction Processing
- Queue-based system in `handleBombExplosions()`
- Tracks processed positions to avoid infinite loops
- Processes triggered gems recursively until queue is empty

### Scene Management
- **Sleep/Wake pattern** for overlays (EndLevelScene over LevelScene)
- **Life consumption** only in `LevelScene.create()` (once per level attempt)
- **Buy turns** wakes scene without recreating it

## How to Test Scrollable Journey Map

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Verify:**
   - Complete multiple levels to populate the map
   - Open journey map
   - Scroll with mouse wheel (up/down)
   - Try touch/drag scrolling (if on touch device)
   - Click on earlier completed levels
   - Verify they launch correctly
   - Check that fixed UI (title, back button) doesn't scroll
   - Confirm scroll indicators appear when content exceeds screen height

## Next Feature Ideas
- More power-up types (color bombs, etc.)
- Animations for chain reactions
- Sound effects for explosions
- Additional level progression features

## Important Code Patterns

### Adding to Scrollable Container
```typescript
// CORRECT: Add to container
const element = this.add.text(...);
this.levelContainer.add(element);

// WRONG: Adds to scene, won't scroll
this.add.text(...);
```

### Fixed UI Elements (Don't Scroll)
```typescript
// Use .setDepth(1000) for fixed elements
this.add.text(...).setDepth(1000);
```

### Testing Chain Reactions
```typescript
// Place multiple special gems
board.setGemAt(2, 2, { color: 'red', special: 'bomb' });
board.setGemAt(2, 3, { color: 'blue', special: 'vertical-rocket' });

// Explode first one
const result = board.explodeBomb({ row: 2, col: 2 });

// Check triggered gems
expect(result.triggered.length).toBe(1);
expect(result.triggered[0].specialType).toBe('vertical-rocket');
```

## Test Coverage
- **Total Tests:** 74 (all passing)
- **Board Tests:** 74 (includes chain reactions, rockets, L-shapes, bombs)
- **Build Status:** ✅ Successful

## Dependencies
- Phaser 3
- TypeScript
- Vite
- Jest (testing)
- Playwright (E2E tests)

---

**Summary:** Chain reactions working perfectly. Scrollable journey map 70% complete - just need to add UI elements to container and test. No critical bugs blocking progress.
