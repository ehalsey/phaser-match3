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

## Estimation & Tracking Process

### 7. **ALWAYS Follow Estimation Process for Issues**

**CRITICAL REQUIREMENT:** Every GitHub issue worked on MUST have an entry in `c:\source\phaser-match3\docs\estimation-tracking.md`

Before starting ANY GitHub issue implementation:

1. **Create entry in `docs/estimation-tracking.md`** for the issue if it doesn't exist
2. **Estimate and document** how long you think it will take to implement/fix BEFORE starting work:
   - Detailed task breakdown
   - Explicit assumptions
   - Risk factors identified
   - Confidence level stated
3. **Record start time** in issue comment
4. **Track actual time** throughout implementation
5. **Update entry in `estimation-tracking.md`** when confirmed via tests and ready to merge to master branch:
   - Record actual time taken
   - Document variance from estimate
   - Note unexpected complexity encountered
6. **Analyze variance** and document lessons learned

**Critical Rule:** AI estimates are often off by **10-100x**. The estimation-tracking process helps:
- Identify what causes variance
- Improve future estimates
- Set realistic expectations
- Learn from past mistakes

**Red Flags in Estimates:**
- 🚩 "Should be quick"
- 🚩 "Just copy the code"
- 🚩 "Straightforward implementation"
- 🚩 "Similar to X we did before"

When you see these phrases, **multiply the estimate by 2-3x minimum**.

**Process Checklist:**
- [ ] Before starting: Create/review entry in `estimation-tracking.md` for this GH issue
- [ ] Document initial time estimate BEFORE starting work
- [ ] Record start time in GitHub issue comment
- [ ] Note unexpected complexity as you encounter it
- [ ] Record completion time when done
- [ ] Update actuals in `estimation-tracking.md` when ready to merge to master
- [ ] Document variance causes and lessons learned

See `docs/estimation-tracking.md` for complete process and historical tracking.

## Development Workflow for GitHub Issues

### 8. **ALWAYS Follow This Complete Workflow**

When working on a GitHub issue, follow these steps in order:

#### Step 1: Create New Branch from Master
```bash
git checkout master
git pull origin master
git checkout -b feature/issue-XX-short-description
```

**Branch Naming Convention:**
- **Features:** `feature/issue-XX-description`
- **Bug fixes:** `fix/issue-XX-bug-name`
- **Enhancements:** `enhance/issue-XX-description`
- **Refactoring:** `refactor/issue-XX-description`

**Never work directly on master or reuse existing feature branches.**

#### Step 2: Record Start Time
Post a comment on the GitHub issue with the start time:
```bash
gh issue comment XX --body "**Start Time:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")

Working on [brief description of work]"
```

#### Step 3: Implement the Feature/Fix
- Write tests FIRST (TDD approach)
- Implement the feature/fix
- Ensure all changes have corresponding tests

#### Step 4: Verify with Tests
**CRITICAL:** Every GitHub issue implementation MUST include at least 1 test to verify the enhancement or bug fix.

**Testing Requirements:**
- [ ] Minimum 1 test that verifies the new behavior or bug fix
- [ ] Tests must be automated (unit, integration, or E2E)
- [ ] All tests must pass before proceeding
- [ ] Test coverage should match the scope of changes

**Test Types by Change:**
- **Bug fixes:** Test that reproduces the bug and verifies the fix
- **New features:** Tests covering main functionality paths
- **Enhancements:** Tests verifying the enhanced behavior
- **Refactoring:** Tests ensuring behavior unchanged

Run full test suite:
```bash
npm test
```

**All tests must pass before creating a PR.**

#### Step 5: Commit Changes
After tests pass, commit with a descriptive message:
```bash
git add -A
git commit -m "feat: description of changes (#XX)

Detailed explanation of what was implemented.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

#### Step 6: Push Branch
```bash
git push -u origin feature/issue-XX-short-description
```

#### Step 7: Create Pull Request
**REQUIRED:** After tests pass successfully, create a PR:
```bash
gh pr create --title "feat: description (#XX)" --body "## Summary
[Description of changes]

## Test Coverage
[List of tests added]

## Test Results
✅ All XXX tests passing

Closes #XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

**PR Requirements:**
- Clear title referencing the issue number
- Summary of changes
- Test coverage information
- Test results showing all tests pass
- Links to close the issue (use "Closes #XX")

#### Step 8: Update Estimation Tracking
Update `docs/estimation-tracking.md` with actual time and variance analysis.

### Complete Workflow Checklist

For every GitHub issue:
- [ ] Create new branch from master
- [ ] Record start time in issue comment
- [ ] Write tests first (TDD)
- [ ] Implement feature/fix
- [ ] Run full test suite - all tests must pass
- [ ] Commit changes
- [ ] Push branch to remote
- [ ] **Create pull request** (REQUIRED after tests pass)
- [ ] Update estimation tracking
- [ ] Document lessons learned

**No Exceptions:** Manual testing alone is not acceptable. PR creation is mandatory after successful tests.
