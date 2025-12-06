# 2x2 Test Board Configurations

## Test Board 1: Create 2x2 via Gravity

Use this board configuration to test 2x2 blocks forming after gravity:

```
Row 0: red    red    red    yellow  purple  orange  blue   green
Row 1: blue   blue   blue   green   orange  purple  red    blue
Row 2: red    red    green  purple  orange  red     green  yellow
Row 3: yellow green  purple red     blue    orange  yellow green
Row 4: purple orange blue   orange  red     green   purple orange
Row 5: orange purple green  blue    yellow  red     orange purple
Row 6: red    blue   orange green   purple  yellow  red    blue
Row 7: blue   yellow orange purple  orange  green   blue   red
```

**How to test:**
1. Match the 3 blues in row 1 (positions 0, 1, 2)
2. This will clear those gems
3. Gravity will drop the 2 reds from row 2 down
4. Refill will add 3 new gems at top of columns 0, 1, 2
5. If refill creates 2 matching reds, you'll have a 2x2 red block at top-left!

## Test Board 2: Pre-existing 2x2 (for manual testing)

This board has a 2x2 red block already present at top-left:

```
Row 0: red    red    green   yellow  purple  orange  blue   green
Row 1: red    red    yellow  green   orange  purple  red    blue
Row 2: green  yellow blue    purple  orange  red     green  yellow
Row 3: yellow green  purple  red     blue    orange  yellow green
Row 4: purple orange blue    orange  red     green   purple orange
Row 5: orange purple green   blue    yellow  red     orange purple
Row 6: red    blue   orange  green   purple  yellow  red    blue
Row 7: blue   yellow orange  purple  orange  green   blue   red
```

**How to test:**
- The 2x2 is already there
- After refill/cascade, it should be detected
- A cross gem should appear at one of the 4 positions
- Those 4 gems should be cleared

## Why You Can't Create 2x2 by Direct Swap

Swapping always **replaces** one position, so you can't create a contiguous 2x2 by swapping.

Example:
```
Before:  red  red     After:  red  red
         red  blue    Swap→   blue red  ← (1,0) is now blue!
```

**2x2 blocks are created by gravity filling in after matches!**
