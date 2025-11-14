# Claude Code Assistant Guidelines

## Critical Rules for This Project

### 1. **ALWAYS Verify State Changes Before Documenting**

When describing game operations (swaps, moves, state transitions):

**❌ WRONG APPROACH:**
```
"Swap cell 7 ↔ 10 creates 4 blues at cells 1, 4, 7, 10"
```
*Problem: Didn't trace through the actual swap operation*

**✅ CORRECT APPROACH:**
```
Before: column 1 = [blue(1), blue(4), orange(7), blue(10)]
Swap: 7↔10 means orange→10, blue→7
After: column 1 = [blue(1), blue(4), blue(7), orange(10)]
Result: 3 blues at cells 1, 4, 7
```

### 2. **Verification Checklist for Instructions**

Before giving the user manual testing steps:

- [ ] Write out "Before:" state explicitly
- [ ] Trace through each operation step-by-step
- [ ] Write out "After:" state explicitly
- [ ] Count items if stating quantities ("x 3", "x 4", etc.)
- [ ] Read back what I wrote - does it match my traced logic?
- [ ] If describing a board state, draw it out mentally or in text

### 3. **State-Changing Operations Require Extra Care**

Operations that modify game state include:
- Swaps
- Match detection
- Gem removal (future)
- Gravity/falling (future)
- Board refill (future)

For each of these, **ALWAYS**:
1. Document the initial state
2. Describe the operation
3. Document the final state
4. Verify the logic is sound

### 4. **Test What You Document**

If giving manual testing instructions:
- Trace through the logic mentally first
- Check that cell numbers are correct
- Verify the expected result matches the actual board logic
- Double-check any counts or quantities

### 5. **Admit Uncertainty**

If unsure about a game state or operation:
- ❌ Don't guess and present as fact
- ✅ Say "Let me verify this by checking the code"
- ✅ Read the actual implementation first
- ✅ Trace through the logic before answering

### 6. **Quality Over Speed**

The user values **accurate, verified information** over fast responses.
- Take the extra 30 seconds to verify state changes
- Don't rush through logical operations
- Precision prevents wasted user time

## Incident Log

### Incident #1: Incorrect Vertical Match Instructions (2025-01-13)

**What happened:**
- Gave instructions: "Swap 7↔10 creates 4 blues at cells 1, 4, 7, 10"
- User tested and found it only creates 3 blues (cells 1, 4, 7)
- Cell 10 becomes orange after the swap (not blue)

**Root cause:**
- Failed to trace through the swap operation step-by-step
- Assumed cell 10 would remain blue after swapping
- Didn't write out "Before" and "After" states

**Corrective action:**
- Created this document
- Established verification checklist (Rule #2)
- Committed to always tracing state changes explicitly

**Prevention:**
- ALWAYS write "Before/After" states for swaps
- ALWAYS count resulting matches explicitly
- NEVER assume final state without tracing through operation

---

## Project-Specific Context

### Board Layout
- 4 rows × 3 columns = 12 cells (numbered 0-11)
- Cell numbering: left-to-right, top-to-bottom
- Row 0: cells 0, 1, 2
- Row 1: cells 3, 4, 5
- Row 2: cells 6, 7, 8
- Row 3: cells 9, 10, 11

### Current Test Board
```
Row 0: [red(0),    blue(1),  blue(2)]
Row 1: [blue(3),   blue(4),  green(5)]
Row 2: [purple(6), orange(7), red(8)]
Row 3: [yellow(9), blue(10),  orange(11)]
```

**Test Scenarios:**
1. Horizontal: Swap 2↔5 → 3 blues in row 1 (cells 2,3,4)
2. Vertical: Swap 7↔10 → 3 blues in column 1 (cells 1,4,7)

### User Expectations
- **No manual testing** - automate everything
- **TDD approach** - tests first, then implementation
- **Accurate documentation** - wrong instructions waste time and break trust
- **Incremental development** - build and validate one feature at a time
