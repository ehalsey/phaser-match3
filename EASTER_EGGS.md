# Easter Eggs Guide

This game contains several hidden easter eggs that grant bonus coins and power-ups. Can you find them all?

---

## 1. Wolf Mode (URL Parameter)

**Difficulty:** Easy
**Reward:** 99,999 coins, max lives, 99 hammers

### How to Activate
Add `?wolf=true` to the game URL:
```
http://localhost:3035/?wolf=true
```

### What You Get
- 99,999 coins (essentially unlimited)
- All 5 lives restored
- 99 hammers

*This is essentially "god mode" for testing or just having fun!*

---

## 2. Konami Code

**Difficulty:** Medium
**Reward:** 500 coins, 10 hammers

### How to Activate
Enter the classic Konami code on your keyboard:

```
↑ ↑ ↓ ↓ ← → ← → B A
```

**Keys to press:**
1. Up Arrow (twice)
2. Down Arrow (twice)
3. Left Arrow
4. Right Arrow
5. Left Arrow
6. Right Arrow
7. B key
8. A key

**Tips:**
- You have 2 seconds between key presses before the sequence resets
- Works on any screen in the game
- Can only be activated once per session

---

## 3. Secret Corner Click

**Difficulty:** Hard
**Reward:** 250 coins, 5 hammers

### How to Activate
Click the **corner cells of the game board** in this specific order:

```
Top-Left Cell → Top-Right Cell → Bottom-Right Cell → Bottom-Left Cell → Top-Left Cell
```

Think of it as tracing the board clockwise, then returning to the start.

**Diagram (click the corner gems on the board):**
```
[1,5][ ][ ][ ][ ][ ][ ][2]
[ ]                    [ ]
[ ]                    [ ]
[ ]                    [ ]
[ ]                    [ ]
[ ]                    [ ]
[ ]                    [ ]
[4][ ][ ][ ][ ][ ][ ][3]
```

**Tips:**
- Click directly on the corner **gem cells** of the board
- You have 3 seconds between clicks before the sequence resets
- Any click outside a corner cell resets the sequence
- Can only be activated once per session
- Must be on the game board screen to work

---

## 4. Special Date Bonuses

**Difficulty:** Just show up!
**Reward:** 100 coins, 3 hammers

### Special Dates
Play the game on these special dates to receive automatic bonuses:

| Date | Holiday | Emoji |
|------|---------|-------|
| January 1 | New Year's Day | 🎆 |
| February 14 | Valentine's Day | 💝 |
| March 17 | St. Patrick's Day | ☘️ |
| April 1 | April Fools' Day | 🃏 |
| July 4 | Independence Day | 🎆 |
| October 31 | Halloween | 🎃 |
| December 25 | Christmas | 🎄 |
| December 31 | New Year's Eve | 🥳 |

**Tips:**
- Bonuses are automatically applied when you load the game on a special date
- Each date bonus can only be claimed once per day
- The bonus persists in localStorage, so refreshing won't give it again

---

## Summary

| Easter Egg | Coins | Hammers | Lives | Difficulty |
|------------|-------|---------|-------|------------|
| Wolf Mode | 99,999 | 99 | Max | Easy |
| Konami Code | 500 | 10 | - | Medium |
| Corner Click | 250 | 5 | - | Hard |
| Date Bonus | 100 | 3 | - | Show up! |

---

## Developer Notes

All easter eggs log their activation to the browser console with `[EasterEgg]` prefix. Open your browser's developer tools (F12) to see activation messages.

Example console output:
```
[EasterEgg] 🐺 WOLF MODE ACTIVATED! 🐺
[EasterEgg] Granted 99999 coins
[EasterEgg] Lives set to maximum (5)
[EasterEgg] Granted 99 hammers
[EasterEgg] 🐺 You are now in god mode! Have fun! 🐺
```

Happy hunting! 🎮
