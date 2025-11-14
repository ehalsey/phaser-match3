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

### Next Steps
- Implement match detection (horizontal and vertical)
- Add swap mechanics
- Continue TDD approach for all new features
