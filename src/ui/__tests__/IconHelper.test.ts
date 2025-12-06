import { IconHelper } from '../IconHelper';

// Mock Phaser.GameObjects.Graphics
class MockGraphics {
  public depth: number = 0;
  public scrollFactorX: number = 1;
  public scrollFactorY: number = 1;
  public drawCalls: string[] = [];

  fillStyle(color: number, _alpha?: number) {
    this.drawCalls.push(`fillStyle:${color.toString(16)}`);
    return this;
  }

  lineStyle(width: number, color: number, _alpha?: number) {
    this.drawCalls.push(`lineStyle:${width}:${color.toString(16)}`);
    return this;
  }

  fillCircle(x: number, y: number, radius: number) {
    this.drawCalls.push(`fillCircle:${x}:${y}:${radius}`);
    return this;
  }

  fillRect(x: number, y: number, width: number, height: number) {
    this.drawCalls.push(`fillRect:${x}:${y}:${width}:${height}`);
    return this;
  }

  fillTriangle(_x1: number, _y1: number, _x2: number, _y2: number, _x3: number, _y3: number) {
    this.drawCalls.push(`fillTriangle`);
    return this;
  }

  fillEllipse(x: number, y: number, width: number, height: number) {
    this.drawCalls.push(`fillEllipse:${x}:${y}:${width}:${height}`);
    return this;
  }

  fillPoints(points: number[], _close?: boolean) {
    this.drawCalls.push(`fillPoints:${points.length / 2}points`);
    return this;
  }

  strokePoints(points: number[], _close?: boolean) {
    this.drawCalls.push(`strokePoints:${points.length / 2}points`);
    return this;
  }

  beginPath() {
    this.drawCalls.push('beginPath');
    return this;
  }

  moveTo(x: number, y: number) {
    this.drawCalls.push(`moveTo:${x}:${y}`);
    return this;
  }

  lineTo(x: number, y: number) {
    this.drawCalls.push(`lineTo:${x}:${y}`);
    return this;
  }

  strokePath() {
    this.drawCalls.push('strokePath');
    return this;
  }

  setDepth(value: number) {
    this.depth = value;
    return this;
  }

  setScrollFactor(x: number, y?: number) {
    this.scrollFactorX = x;
    this.scrollFactorY = y ?? x;
    return this;
  }
}

// Mock Phaser Scene
const createMockScene = () => {
  const graphics: MockGraphics[] = [];

  return {
    add: {
      graphics: () => {
        const g = new MockGraphics();
        graphics.push(g);
        return g;
      }
    },
    getGraphics: () => graphics,
    getLastGraphics: () => graphics[graphics.length - 1]
  };
};

describe('IconHelper', () => {
  describe('createHeart', () => {
    it('should create a heart icon with default color', () => {
      const scene = createMockScene();
      const result = IconHelper.createHeart(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:e74c3c'); // Default red color
      // Heart is made of 2 circles and a triangle
      expect(graphics.drawCalls.filter(c => c.startsWith('fillCircle')).length).toBe(2);
      expect(graphics.drawCalls.filter(c => c === 'fillTriangle').length).toBe(1);
    });

    it('should create a heart icon with custom color', () => {
      const scene = createMockScene();
      IconHelper.createHeart(scene as any, 100, 100, 20, 0xff0000);

      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:ff0000');
    });

    it('should scale the heart based on size parameter', () => {
      const scene = createMockScene();
      IconHelper.createHeart(scene as any, 100, 100, 40); // Double size

      const graphics = scene.getLastGraphics();
      // Should have circle calls with scaled radius
      const circleCalls = graphics.drawCalls.filter(c => c.startsWith('fillCircle'));
      expect(circleCalls.length).toBe(2);
    });
  });

  describe('createCoin', () => {
    it('should create a coin icon with default gold color', () => {
      const scene = createMockScene();
      const result = IconHelper.createCoin(scene as any, 50, 50, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:f1c40f'); // Gold color
      // Coin has main circle, highlight circle, and line detail
      expect(graphics.drawCalls.filter(c => c.startsWith('fillCircle')).length).toBeGreaterThanOrEqual(2);
    });

    it('should include shine effect on coin', () => {
      const scene = createMockScene();
      IconHelper.createCoin(scene as any, 50, 50, 20);

      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:f9e076'); // Shine color
    });
  });

  describe('createHammer', () => {
    it('should create a hammer icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createHammer(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Hammer has handle (brown) and head (gray)
      expect(graphics.drawCalls).toContain('fillStyle:8b4513'); // Brown handle
      expect(graphics.drawCalls).toContain('fillStyle:696969'); // Gray head
      // Should have rectangles for handle and head
      expect(graphics.drawCalls.filter(c => c.startsWith('fillRect')).length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('createStar', () => {
    it('should create a star icon with default gold color', () => {
      const scene = createMockScene();
      const result = IconHelper.createStar(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:ffd700'); // Gold
      // Star uses fillPoints with 10 points (5 outer, 5 inner)
      expect(graphics.drawCalls).toContain('fillPoints:10points');
    });

    it('should create a star with custom color', () => {
      const scene = createMockScene();
      IconHelper.createStar(scene as any, 100, 100, 20, 0xffff00);

      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls).toContain('fillStyle:ffff00');
    });
  });

  describe('createVerticalArrow', () => {
    it('should create a vertical arrow icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createVerticalArrow(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Should have line style and stroke paths for arrows
      expect(graphics.drawCalls.filter(c => c.startsWith('lineStyle')).length).toBeGreaterThanOrEqual(1);
      expect(graphics.drawCalls.filter(c => c === 'strokePath').length).toBeGreaterThanOrEqual(3); // Line + 2 arrowheads
    });
  });

  describe('createHorizontalArrow', () => {
    it('should create a horizontal arrow icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createHorizontalArrow(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      expect(graphics.drawCalls.filter(c => c === 'strokePath').length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('createCross', () => {
    it('should create a cross icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createCross(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Cross has vertical and horizontal bars (2 rectangles)
      expect(graphics.drawCalls.filter(c => c.startsWith('fillRect')).length).toBe(2);
    });
  });

  describe('createPalette', () => {
    it('should create a palette icon with multiple colors', () => {
      const scene = createMockScene();
      const result = IconHelper.createPalette(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Palette has base ellipse + 4 paint dots + thumb hole
      expect(graphics.drawCalls.filter(c => c.startsWith('fillEllipse')).length).toBe(1);
      // Should have multiple fillCircle calls for paint dots
      expect(graphics.drawCalls.filter(c => c.startsWith('fillCircle')).length).toBeGreaterThanOrEqual(4);
    });

    it('should include standard gem colors on palette', () => {
      const scene = createMockScene();
      IconHelper.createPalette(scene as any, 100, 100, 20);

      const graphics = scene.getLastGraphics();
      // Check for gem colors: red, blue, green, yellow
      expect(graphics.drawCalls).toContain('fillStyle:e74c3c'); // Red
      expect(graphics.drawCalls).toContain('fillStyle:3498db'); // Blue
      expect(graphics.drawCalls).toContain('fillStyle:2ecc71'); // Green
      expect(graphics.drawCalls).toContain('fillStyle:f1c40f'); // Yellow
    });
  });

  describe('createDiscoBall', () => {
    it('should create a disco ball icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createDiscoBall(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Disco ball has main circle and sparkle squares
      expect(graphics.drawCalls).toContain('fillStyle:c0c0c0'); // Silver ball
      expect(graphics.drawCalls.filter(c => c.startsWith('fillCircle')).length).toBeGreaterThanOrEqual(1);
      expect(graphics.drawCalls.filter(c => c.startsWith('fillRect')).length).toBeGreaterThanOrEqual(4); // Sparkles
    });
  });

  describe('createDoubleHeart', () => {
    it('should create a double heart icon', () => {
      const scene = createMockScene();
      const result = IconHelper.createDoubleHeart(scene as any, 100, 100, 20);

      expect(result).toBeDefined();
      const graphics = scene.getLastGraphics();
      // Double heart has back heart (darker) and front heart (lighter)
      expect(graphics.drawCalls).toContain('fillStyle:c71585'); // Back heart
      expect(graphics.drawCalls).toContain('fillStyle:ff69b4'); // Front heart (default pink)
      // Should have 4 circles total (2 per heart) and 2 triangles
      expect(graphics.drawCalls.filter(c => c.startsWith('fillCircle')).length).toBe(4);
      expect(graphics.drawCalls.filter(c => c === 'fillTriangle').length).toBe(2);
    });
  });

  describe('positioning', () => {
    it('should position icons at specified coordinates', () => {
      const scene = createMockScene();
      IconHelper.createCoin(scene as any, 200, 150, 20);

      const graphics = scene.getLastGraphics();
      // Main circle should be at 200, 150
      expect(graphics.drawCalls).toContain('fillCircle:200:150:10'); // radius = size/2 = 10
    });
  });

  describe('graphics object', () => {
    it('should return a graphics object that supports setDepth', () => {
      const scene = createMockScene();
      const result = IconHelper.createStar(scene as any, 100, 100, 20);

      result.setDepth(5);
      expect(result.depth).toBe(5);
    });

    it('should return a graphics object that supports setScrollFactor', () => {
      const scene = createMockScene();
      const result = IconHelper.createHeart(scene as any, 100, 100, 20);

      // Should not throw
      expect(() => result.setScrollFactor(0)).not.toThrow();
    });
  });
});
