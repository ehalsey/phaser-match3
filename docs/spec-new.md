✅ We don't want the score, moves, target and percentage bar on the journey map
✅ The number of coins earned should be 20, 40 or 60 depending on the score achieved
✅ Please remove the text "Click gems to swap them! Create matches of 3+"
✅ Map & Menu buttons too big and should be located below the title and be small icons so we don't waste space
✅ Instead of buying a life on the level failed scene we should allow the user to buy 5 more turns for 10 coins on the first attempt, on the 2nd attempt buy 5 turns for 20 coins, etc.
✅ We should have an indicator for the number of coins won per level. We can use stars for now 1, 2 or 3 depending on the number of coins won. should also be displayed on the journey map.
✅ Clicking on buy 5 moves does not take the user back to the board.  You have to buy 5 more and then it goes back to the board.
✅ Using a bomb should apply blown up gems to the goal
✅ We should change the match 4 from bomb to a vertical rocket when matching 4 vertical tiles, and to a horizontal rocket when matching 4 horizontal tiles.  Vertical rocket should blow up the whole column that the rocket is dropped on and the horizontal rocket should blow up the whole row the horizontal rocket is dropped on. Bomb's should be created when matching L 2x3 or 3x2
✅ Can we integrate a payment processor so that users can purchase coins with a credit card?  We should use an addin if already available and select a financial service payment processor that we can test and use for free.
✅ Can we add some non-match power ups the user can use?  The first will be one that the user can select a gem and it will be removed.
✅ We should create a new power up for matching 2x2.  I'll let you come up with something (Cross Blast - clears entire row + column)

## Power-Up Positioning Requirements

When implementing power-ups, follow these rules for positioning:

### Match-Based Power-Ups:
- **Match-3**: No power-up created
- **Match-4**: Create rocket at center position
  - Vertical match → Vertical Rocket
  - Horizontal match → Horizontal Rocket
- **Match-5+**: Create Bomb at center position
- **L-Shape (2x3 or 3x2)**: Create Bomb at intersection

### 2x2 Block Power-Ups:
- **Cross Blast Positioning**:
  - If swap creates the 2x2 from the LEFT side → place Cross at bottom-left
  - If swap creates the 2x2 from the RIGHT side → place Cross at bottom-right
  - The 4 gems that form the 2x2 are cleared
  - The Cross gem is placed in one of those cleared positions

### General Rules:
- Power-ups are created AFTER clearing matched gems
- Power-ups are created BEFORE triggering existing special gems
- Multiple power-ups can be created from a single move (e.g., L-shape + 2x2)