import Phaser from 'phaser';

/**
 * Helper class to create consistent icons using Phaser graphics
 * Replaces emoji text which doesn't render reliably across platforms
 */
export class IconHelper {
  /**
   * Create a heart icon (for lives)
   */
  static createHeart(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xe74c3c): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);

    // Draw heart shape using bezier curves
    const scale = size / 20;
    graphics.fillCircle(x - 6 * scale, y - 4 * scale, 8 * scale);
    graphics.fillCircle(x + 6 * scale, y - 4 * scale, 8 * scale);
    graphics.fillTriangle(
      x - 14 * scale, y,
      x + 14 * scale, y,
      x, y + 16 * scale
    );

    return graphics;
  }

  /**
   * Create a coin icon
   */
  static createCoin(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xf1c40f): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();

    // Outer circle
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x, y, size / 2);

    // Inner shine
    graphics.fillStyle(0xf9e076, 1);
    graphics.fillCircle(x - size * 0.15, y - size * 0.15, size * 0.2);

    // Dollar sign or coin mark
    graphics.lineStyle(2, 0xc9a227, 1);
    graphics.beginPath();
    graphics.moveTo(x, y - size * 0.25);
    graphics.lineTo(x, y + size * 0.25);
    graphics.strokePath();

    return graphics;
  }

  /**
   * Create a hammer icon
   */
  static createHammer(scene: Phaser.Scene, x: number, y: number, size: number = 20, _color: number = 0x8b4513): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const scale = size / 20;

    // Handle
    graphics.fillStyle(0x8b4513, 1); // Brown
    graphics.fillRect(x - 2 * scale, y - 2 * scale, 4 * scale, 18 * scale);

    // Head
    graphics.fillStyle(0x696969, 1); // Gray metal
    graphics.fillRect(x - 10 * scale, y - 10 * scale, 20 * scale, 8 * scale);

    // Highlight on head
    graphics.fillStyle(0x909090, 1);
    graphics.fillRect(x - 8 * scale, y - 9 * scale, 16 * scale, 2 * scale);

    return graphics;
  }

  /**
   * Create a star icon (for bombs/special gems)
   */
  static createStar(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xffd700): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    graphics.fillStyle(color, 1);

    const points: number[] = [];
    const outerRadius = size / 2;
    const innerRadius = size / 4;

    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI / 5) - Math.PI / 2;
      points.push(x + radius * Math.cos(angle));
      points.push(y + radius * Math.sin(angle));
    }

    graphics.fillPoints(points, true);

    return graphics;
  }

  /**
   * Create vertical arrow icon (for vertical rockets)
   */
  static createVerticalArrow(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xffffff): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const scale = size / 20;

    graphics.lineStyle(3 * scale, color, 1);

    // Vertical line
    graphics.beginPath();
    graphics.moveTo(x, y - 8 * scale);
    graphics.lineTo(x, y + 8 * scale);
    graphics.strokePath();

    // Top arrow
    graphics.beginPath();
    graphics.moveTo(x - 5 * scale, y - 4 * scale);
    graphics.lineTo(x, y - 8 * scale);
    graphics.lineTo(x + 5 * scale, y - 4 * scale);
    graphics.strokePath();

    // Bottom arrow
    graphics.beginPath();
    graphics.moveTo(x - 5 * scale, y + 4 * scale);
    graphics.lineTo(x, y + 8 * scale);
    graphics.lineTo(x + 5 * scale, y + 4 * scale);
    graphics.strokePath();

    return graphics;
  }

  /**
   * Create horizontal arrow icon (for horizontal rockets)
   */
  static createHorizontalArrow(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xffffff): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const scale = size / 20;

    graphics.lineStyle(3 * scale, color, 1);

    // Horizontal line
    graphics.beginPath();
    graphics.moveTo(x - 8 * scale, y);
    graphics.lineTo(x + 8 * scale, y);
    graphics.strokePath();

    // Left arrow
    graphics.beginPath();
    graphics.moveTo(x - 4 * scale, y - 5 * scale);
    graphics.lineTo(x - 8 * scale, y);
    graphics.lineTo(x - 4 * scale, y + 5 * scale);
    graphics.strokePath();

    // Right arrow
    graphics.beginPath();
    graphics.moveTo(x + 4 * scale, y - 5 * scale);
    graphics.lineTo(x + 8 * scale, y);
    graphics.lineTo(x + 4 * scale, y + 5 * scale);
    graphics.strokePath();

    return graphics;
  }

  /**
   * Create cross/plus icon (for cross blast)
   */
  static createCross(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xffffff): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const scale = size / 20;

    graphics.fillStyle(color, 1);

    // Vertical bar
    graphics.fillRect(x - 2 * scale, y - 8 * scale, 4 * scale, 16 * scale);

    // Horizontal bar
    graphics.fillRect(x - 8 * scale, y - 2 * scale, 16 * scale, 4 * scale);

    return graphics;
  }

  /**
   * Create paint palette icon (for color clear)
   */
  static createPalette(scene: Phaser.Scene, x: number, y: number, size: number = 20): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const scale = size / 20;

    // Palette base (oval)
    graphics.fillStyle(0xdeb887, 1); // Tan
    graphics.fillEllipse(x, y, 18 * scale, 14 * scale);

    // Paint dots
    const colors = [0xe74c3c, 0x3498db, 0x2ecc71, 0xf1c40f];
    const offsets = [
      { dx: -4, dy: -3 },
      { dx: 4, dy: -3 },
      { dx: -2, dy: 3 },
      { dx: 5, dy: 2 }
    ];

    colors.forEach((color, i) => {
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x + offsets[i].dx * scale, y + offsets[i].dy * scale, 2.5 * scale);
    });

    // Thumb hole
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillCircle(x + 6 * scale, y, 2 * scale);

    return graphics;
  }

  /**
   * Create disco ball icon
   */
  static createDiscoBall(scene: Phaser.Scene, x: number, y: number, size: number = 20): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();
    const radius = size / 2;

    // Main ball
    graphics.fillStyle(0xc0c0c0, 1);
    graphics.fillCircle(x, y, radius);

    // Sparkle squares
    graphics.fillStyle(0xffffff, 1);
    const offsets = [
      { dx: -0.3, dy: -0.3 },
      { dx: 0.3, dy: -0.1 },
      { dx: -0.1, dy: 0.3 },
      { dx: 0.2, dy: 0.2 }
    ];

    offsets.forEach(offset => {
      graphics.fillRect(
        x + offset.dx * size - 2,
        y + offset.dy * size - 2,
        4, 4
      );
    });

    // Highlight
    graphics.fillStyle(0xffffff, 0.5);
    graphics.fillCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.2);

    return graphics;
  }

  /**
   * Create a filled heart icon (for refill lives - double heart)
   */
  static createDoubleHeart(scene: Phaser.Scene, x: number, y: number, size: number = 20, color: number = 0xff69b4): Phaser.GameObjects.Graphics {
    const graphics = scene.add.graphics();

    // Back heart (slightly offset)
    graphics.fillStyle(0xc71585, 1);
    const scale = size / 20;
    graphics.fillCircle(x - 4 * scale, y - 4 * scale, 6 * scale);
    graphics.fillCircle(x + 4 * scale, y - 4 * scale, 6 * scale);
    graphics.fillTriangle(
      x - 10 * scale, y,
      x + 10 * scale, y,
      x, y + 12 * scale
    );

    // Front heart
    graphics.fillStyle(color, 1);
    graphics.fillCircle(x - 4 * scale + 3, y - 4 * scale + 3, 6 * scale);
    graphics.fillCircle(x + 4 * scale + 3, y - 4 * scale + 3, 6 * scale);
    graphics.fillTriangle(
      x - 10 * scale + 3, y + 3,
      x + 10 * scale + 3, y + 3,
      x + 3, y + 12 * scale + 3
    );

    return graphics;
  }
}
