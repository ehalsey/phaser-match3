# Lessons Learned

## Session 1: Initial Setup and Visual Testing

### Key Takeaways

1. **No Manual Testing**
   - Goal: Automate everything to avoid manual verification
   - Solution: Implemented Playwright for automated screenshot testing
   - Script: `node take-screenshot.mjs` captures visual state automatically
   - Benefit: Can verify visual layouts programmatically

2. **Visual Debugging with Color-Coding**
   - Problem: Text elements overlapping, hard to identify which element has issues
   - Solution: Temporarily added [TEXT-X] labels and unique colors to each text element
   - Result: Clear identification of layout issues (TEXT-2 too close to board)
   - Lesson: Color-coding and labeling UI elements makes debugging much easier

3. **UI Layout Spacing**
   - Problem: Board too close to header text (TEXT-2)
   - Solution: Increased BOARD_OFFSET_Y from 100 → 120 → 150 pixels
   - Lesson: Start with generous spacing between UI elements, easier to reduce than increase
   - Iterations matter: Required multiple screenshots to get spacing right

4. **Color Scheme for Game Elements**
   - Problem: Blue and green gems looked too similar (cyan/teal vs mint/aqua)
   - Solution: Used distinct, vibrant colors from a standard palette
   - Final colors: True blue (#3498db), bright green (#2ecc71), etc.
   - Lesson: Test color schemes visually to ensure accessibility and clarity

5. **Test-Driven Development Setup**
   - Established pattern: Write test → Watch it fail → Implement → Make it pass
   - Started with foundational tests (board creation, initialization)
   - Lesson: Build on validated foundation before adding complexity

6. **Git Workflow**
   - Commit frequently at logical checkpoints
   - Clear commit messages describing what and why
   - Each commit represents a working, tested state
   - Makes it easy to roll back if needed

### Tools Added
- **Playwright** - Browser automation for visual testing
- **Jest** - Unit testing framework
- **Vite** - Fast dev server with hot reload
- **TypeScript** - Type safety for game logic

## Session 2: Complete Testing Strategy - Hybrid DOM + Canvas

### Key Achievements

1. **Solved the Phaser Canvas Testing Problem**
   - **Problem**: E2E tests couldn't read text inside Phaser canvas
   - **Solution**: Hybrid architecture - DOM elements for testability + Canvas for visuals
   - **Implementation**:
     - Added `<h1 id="game-title">`, `<div id="game-status">` to HTML
     - Updated `updateStatus()` to write to BOTH canvas AND DOM
   - **Result**: All 7 E2E tests now pass (was 0/7, now 7/7)

2. **Complete 3-Tier Testing**
   - **Unit Tests** (Jest): 26 tests for game logic (~0.7s)
   - **Manual Testing**: Interactive gameplay via dev server
   - **E2E Tests** (Playwright): 7 integration tests (~12s)
   - **Total**: All 33 automated tests passing

3. **Benefits of Hybrid Architecture**
   - ✅ E2E tests can query actual DOM elements
   - ✅ Better accessibility (semantic HTML)
   - ✅ No changes to visual appearance
   - ✅ No test-specific workarounds needed
   - ✅ Production-ready code (no window.game hacks)

4. **E2E Test Coverage Achieved**
   - Display game board with all gems
   - Click gem to select it
   - Perform valid swap and create match
   - Reject invalid swap (no match)
   - Reject non-adjacent swap
   - Allow deselecting by clicking same gem
   - Full game flow: select → swap → verify

5. **Alternative Approaches Evaluated**
   - **Visual Regression Testing**: Too brittle for text assertions
   - **Custom Test Harness**: Would add test-specific code to production
   - **Hybrid DOM + Canvas**: ✅ Best solution - clean, accessible, testable

### Technical Implementation

**HTML Structure:**
```html
<div id="game-wrapper">
  <h1 id="game-title">Interactive Match-3 Game</h1>
  <div id="game-container"></div> <!-- Canvas renders here -->
  <div id="game-status">Status messages</div>
</div>
```

**Status Update Pattern:**
```typescript
private updateStatus(message: string): void {
  // Canvas (for visuals)
  const canvasText = this.children.getByName('status-text');
  if (canvasText) canvasText.setText(message);

  // DOM (for testing)
  const domElement = document.getElementById('game-status');
  if (domElement) domElement.textContent = message;
}
```

### Performance Metrics

- **Unit Tests**: 0.7 seconds (26 tests)
- **E2E Tests**: 12-15 seconds (7 tests)
- **Total Suite**: < 20 seconds (all 33 tests)
- **Fast feedback loop** enables confident refactoring

### Key Lessons

1. **Don't Fight the Framework**: Instead of fighting Phaser's canvas, we embraced it and added complementary DOM elements
2. **Accessibility is Testability**: DOM elements improve both testing AND user experience
3. **TDD Pays Off**: Having solid unit tests gave confidence to refactor for E2E testing
4. **Hybrid > Pure**: Mixing approaches (DOM + Canvas) often better than dogmatic purity
5. **Iterate on Solutions**: Started with "tests don't work", evaluated 3 options, implemented best one

### What's Next
- Gem clearing after matches
- Gravity/falling gems
- Refilling empty spaces
- Scoring system
- All with full test coverage from day one
