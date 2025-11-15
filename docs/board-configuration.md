# Board Configuration

The game supports flexible board configuration through URL parameters and console commands, making it easy to test different board sizes.

## URL Parameters

Add URL parameters to configure the board when loading the game:

### Custom Dimensions
```
http://localhost:3002/?rows=10&cols=10
```

Creates a custom 10x10 board.

- `rows`: Number of rows (3-20)
- `cols`: Number of columns (3-20)

### Presets

Use predefined board sizes:

```
http://localhost:3002/?board=large
```

Available presets:
- `default`: 4x3 (test board with known matches)
- `small`: 6x6
- `medium`: 8x8
- `large`: 10x10 (recommended for testing)
- `huge`: 12x12

## Console API

Once the game loads, you can use console commands to change configuration:

### List Available Presets
```javascript
gameConfig.listPresets()
```

Output:
```
Available board presets:
  default: 4x3 - Default 4x3 board for testing
  small: 6x6 - Small 6x6 board
  medium: 8x8 - Medium 8x8 board
  large: 10x10 - Large 10x10 board for extensive testing
  huge: 12x12 - Huge 12x12 board
```

### Set Custom Board Size
```javascript
gameConfig.setBoard(10, 10)
```

Sets board to 10 rows × 10 columns and reloads the page.

### Use a Preset
```javascript
gameConfig.usePreset('large')
```

Switches to the "large" preset (10x10) and reloads.

### Get Current Configuration
```javascript
gameConfig.getCurrent()
```

Output:
```
Current board: 10x10
{rows: 10, cols: 10}
```

### Restart Game
```javascript
gameConfig.restart()
```

Reloads the page with current configuration.

## Board Initialization

- **Default (4x3)**: Uses predefined test configuration with known match scenarios
- **Custom sizes**: Generates random board without initial matches

## Testing Workflow

1. **Start with default board for E2E tests:**
   ```
   http://localhost:3002/
   ```

2. **Test cascade behavior on large board:**
   ```
   http://localhost:3002/?board=large
   ```

3. **Test specific dimensions:**
   ```
   http://localhost:3002/?rows=15&cols=15
   ```

4. **Quick preset switching in console:**
   ```javascript
   gameConfig.usePreset('huge')  // Switch to 12x12
   ```

## Implementation Details

- **BoardConfig class**: `src/game/BoardConfig.ts`
- **URL parsing**: Happens in `BoardConfig.fromURL()`
- **Console API**: Set up in `BoardConfig.setupConsoleAPI()`
- **Scene integration**: `InteractiveGameScene.create()`

## Examples

### Testing 10x10 Board
```bash
# Open browser to:
http://localhost:3002/?board=large

# Or use console:
gameConfig.usePreset('large')
```

### Custom Testing Setup
```bash
# Open browser with custom size:
http://localhost:3002/?rows=8&cols=12

# Or use console:
gameConfig.setBoard(8, 12)
```

### Quick Preset Comparison
```javascript
// Try different sizes quickly
gameConfig.usePreset('small')   // 6x6
gameConfig.usePreset('medium')  // 8x8
gameConfig.usePreset('large')   // 10x10
gameConfig.usePreset('huge')    // 12x12
```

## Notes

- Valid dimensions: 3-20 (rows and columns)
- Invalid dimensions fall back to default (4x3)
- Board reloads when changing configuration
- Console API is always available as `gameConfig`
- Random boards avoid initial matches
- Default board keeps test scenarios for E2E tests
