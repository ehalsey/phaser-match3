export interface BoardDimensions {
  rows: number;
  cols: number;
}

export interface BoardPreset {
  name: string;
  dimensions: BoardDimensions;
  description: string;
}

export class BoardConfig {
  private static readonly PRESETS: Record<string, BoardPreset> = {
    default: {
      name: 'default',
      dimensions: { rows: 8, cols: 8 },
      description: 'Default Level 1 board (8x8)'
    },
    test: {
      name: 'test',
      dimensions: { rows: 4, cols: 3 },
      description: 'Test board for E2E tests (4x3)'
    },
    small: {
      name: 'small',
      dimensions: { rows: 6, cols: 6 },
      description: 'Small 6x6 board'
    },
    medium: {
      name: 'medium',
      dimensions: { rows: 8, cols: 8 },
      description: 'Medium 8x8 board'
    },
    large: {
      name: 'large',
      dimensions: { rows: 10, cols: 10 },
      description: 'Large 10x10 board for extensive testing'
    },
    huge: {
      name: 'huge',
      dimensions: { rows: 12, cols: 12 },
      description: 'Huge 12x12 board'
    }
  };

  /**
   * Parse board configuration from URL parameters
   * Examples:
   *   ?rows=10&cols=10  - Custom dimensions
   *   ?board=large      - Use preset
   */
  static fromURL(): BoardDimensions {
    const params = new URLSearchParams(window.location.search);

    // Check for preset first
    const presetName = params.get('board');
    if (presetName && this.PRESETS[presetName]) {
      console.log(`[BoardConfig] Using preset: ${presetName} (${this.PRESETS[presetName].description})`);
      return this.PRESETS[presetName].dimensions;
    }

    // Check for custom dimensions
    const rows = params.get('rows');
    const cols = params.get('cols');

    if (rows && cols) {
      const parsedRows = parseInt(rows, 10);
      const parsedCols = parseInt(cols, 10);

      if (this.isValidDimension(parsedRows) && this.isValidDimension(parsedCols)) {
        console.log(`[BoardConfig] Using custom dimensions: ${parsedRows}x${parsedCols}`);
        return { rows: parsedRows, cols: parsedCols };
      } else {
        console.warn(`[BoardConfig] Invalid dimensions (${rows}x${cols}), using default`);
      }
    }

    // Default
    console.log('[BoardConfig] Using default dimensions: 8x8');
    return this.PRESETS.default.dimensions;
  }

  /**
   * Get a preset by name
   */
  static getPreset(name: string): BoardDimensions | null {
    if (this.PRESETS[name]) {
      return this.PRESETS[name].dimensions;
    }
    return null;
  }

  /**
   * Get all available presets
   */
  static getAllPresets(): BoardPreset[] {
    return Object.values(this.PRESETS);
  }

  /**
   * Validate dimension is within reasonable bounds
   */
  private static isValidDimension(dim: number): boolean {
    return !isNaN(dim) && dim >= 3 && dim <= 20;
  }

  /**
   * Setup console API for runtime configuration
   */
  static setupConsoleAPI(): void {
    (window as any).gameConfig = {
      /**
       * Set custom board dimensions
       * Usage: gameConfig.setBoard(10, 10)
       */
      setBoard: (rows: number, cols: number) => {
        if (this.isValidDimension(rows) && this.isValidDimension(cols)) {
          console.log(`[GameConfig] Setting board to ${rows}x${cols}`);
          const url = new URL(window.location.href);
          url.searchParams.set('rows', rows.toString());
          url.searchParams.set('cols', cols.toString());
          url.searchParams.delete('board');
          window.location.href = url.toString();
        } else {
          console.error(`[GameConfig] Invalid dimensions: ${rows}x${cols} (must be 3-20)`);
        }
      },

      /**
       * Use a preset board configuration
       * Usage: gameConfig.usePreset('large')
       */
      usePreset: (name: string) => {
        if (this.PRESETS[name]) {
          console.log(`[GameConfig] Using preset: ${name}`);
          const url = new URL(window.location.href);
          url.searchParams.set('board', name);
          url.searchParams.delete('rows');
          url.searchParams.delete('cols');
          window.location.href = url.toString();
        } else {
          console.error(`[GameConfig] Unknown preset: ${name}`);
          console.log('Available presets:', Object.keys(this.PRESETS).join(', '));
        }
      },

      /**
       * List all available presets
       */
      listPresets: () => {
        console.log('Available board presets:');
        this.getAllPresets().forEach(preset => {
          console.log(`  ${preset.name}: ${preset.dimensions.rows}x${preset.dimensions.cols} - ${preset.description}`);
        });
      },

      /**
       * Get current board config
       */
      getCurrent: () => {
        const config = this.fromURL();
        console.log(`Current board: ${config.rows}x${config.cols}`);
        return config;
      },

      /**
       * Restart the game with current config
       */
      restart: () => {
        console.log('[GameConfig] Restarting game...');
        window.location.reload();
      }
    };

    console.log('[GameConfig] Console API ready! Try: gameConfig.listPresets()');
  }
}
