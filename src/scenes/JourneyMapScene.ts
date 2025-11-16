import Phaser from 'phaser';
import { LevelConfig } from '../game/LevelConfig';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class JourneyMapScene extends Phaser.Scene {
  private metaManager!: MetaProgressionManager;
  private currentLevel: number = 1;
  private readonly LEVELS_TO_SHOW = 10; // Show current + 9 more
  private readonly LEVEL_NODE_SIZE = 60;

  constructor() {
    super({ key: 'JourneyMapScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.metaManager = MetaProgressionManager.getInstance();
    this.currentLevel = this.metaManager.getCurrentLevel();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(centerX, 60, 'Level Journey', {
      fontSize: '48px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle with current level
    this.add.text(centerX, 110, `Your Progress: Level ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#95a5a6'
    }).setOrigin(0.5);

    // Draw level path/map
    this.createLevelMap(centerX, 180);

    // Back to menu button (top-left)
    this.createBackButton(20, 20);
  }

  private createLevelMap(startX: number, startY: number): void {
    const startLevel = Math.max(1, this.currentLevel - 2); // Show 2 previous levels
    const endLevel = startLevel + this.LEVELS_TO_SHOW - 1;

    // Create path with alternating left/right layout
    let x = startX;
    let y = startY;
    const verticalGap = 100;
    const horizontalOffset = 150;

    for (let level = startLevel; level <= endLevel; level++) {
      const isCompleted = level < this.currentLevel;
      const isCurrent = level === this.currentLevel;
      const isUpcoming = level > this.currentLevel;

      // Alternate left and right
      const row = level - startLevel;
      const offsetX = (row % 2 === 0) ? -horizontalOffset : horizontalOffset;
      const nodeX = x + offsetX;
      const nodeY = y + (row * verticalGap);

      // Draw connecting line to previous level (if not first)
      if (level > startLevel) {
        const prevRow = row - 1;
        const prevOffsetX = (prevRow % 2 === 0) ? -horizontalOffset : horizontalOffset;
        const prevX = x + prevOffsetX;
        const prevY = y + (prevRow * verticalGap);

        const lineColor = isCompleted ? 0x2ecc71 : 0x7f8c8d;
        const line = this.add.line(0, 0, prevX, prevY, nodeX, nodeY, lineColor, 0.5);
        line.setOrigin(0, 0);
        line.setLineWidth(4);
      }

      // Create level node
      this.createLevelNode(nodeX, nodeY, level, isCompleted, isCurrent, isUpcoming);
    }
  }

  private createLevelNode(x: number, y: number, level: number, isCompleted: boolean, isCurrent: boolean, isUpcoming: boolean): void {
    const levelSettings = LevelConfig.getLevel(level);
    const difficultyColor = LevelConfig.getDifficultyColor(levelSettings.difficulty);

    // Node background circle
    let nodeColor: number;
    let alpha = 1;

    if (isCompleted) {
      nodeColor = 0x2ecc71; // Green for completed
    } else if (isCurrent) {
      nodeColor = 0xf1c40f; // Gold for current
    } else {
      nodeColor = 0x34495e; // Gray for upcoming
      alpha = 0.6;
    }

    const circle = this.add.circle(x, y, this.LEVEL_NODE_SIZE / 2, nodeColor, alpha);
    circle.setStrokeStyle(4, 0xffffff, 0.8);

    // Add pulsing animation to current level
    if (isCurrent) {
      this.tweens.add({
        targets: circle,
        scale: 1.1,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Make current and completed levels clickable
    if (isCurrent || isCompleted) {
      circle.setInteractive({ useHandCursor: true });
      circle.on('pointerdown', () => {
        this.scene.start('LevelJourneyScene', { selectedLevel: level });
      });

      circle.on('pointerover', () => {
        circle.setScale(1.15);
      });

      circle.on('pointerout', () => {
        circle.setScale(1.0);
      });
    }

    // Level number
    this.add.text(x, y - 8, level.toString(), {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Status indicator
    if (isCompleted) {
      // Checkmark for completed levels
      this.add.text(x, y + 12, '✓', {
        fontSize: '24px',
        color: '#ffffff'
      }).setOrigin(0.5);
    } else if (isCurrent) {
      // Star for current level
      this.add.text(x, y + 12, '⭐', {
        fontSize: '20px',
        color: '#ffffff'
      }).setOrigin(0.5);
    }

    // Difficulty badge (small colored circle next to node)
    const badgeX = x + this.LEVEL_NODE_SIZE / 2 + 15;
    const badge = this.add.circle(badgeX, y, 8, difficultyColor);
    badge.setStrokeStyle(2, 0xffffff, 0.8);

    // Info panel on hover (for current, completed, and upcoming levels)
    if (isCurrent || isCompleted || isUpcoming) {
      const infoPanel = this.createInfoPanel(x, y - 100, levelSettings);
      infoPanel.setVisible(false);

      if (isCurrent || isCompleted) {
        circle.on('pointerover', () => {
          infoPanel.setVisible(true);
        });

        circle.on('pointerout', () => {
          infoPanel.setVisible(false);
        });
      }
    }
  }

  private createInfoPanel(x: number, y: number, levelSettings: any): Phaser.GameObjects.Container {
    const panel = this.add.container(x, y);

    // Background - smaller since we removed moves and goals
    const bg = this.add.rectangle(0, 0, 180, 70, 0x2c3e50, 0.95);
    bg.setStrokeStyle(2, 0xf1c40f);
    panel.add(bg);

    // Level info
    const difficulty = levelSettings.difficulty.toUpperCase();
    const difficultyColor = LevelConfig.getDifficultyColor(levelSettings.difficulty);

    const infoText = this.add.text(0, -15, `Level ${levelSettings.levelNumber}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    panel.add(infoText);

    const diffText = this.add.text(0, 10, difficulty, {
      fontSize: '16px',
      color: `#${difficultyColor.toString(16).padStart(6, '0')}`
    }).setOrigin(0.5);
    panel.add(diffText);

    return panel;
  }

  private createBackButton(x: number, y: number): void {
    const button = this.add.rectangle(x + 60, y + 20, 120, 40, 0x34495e);
    button.setStrokeStyle(2, 0x7f8c8d);
    button.setInteractive({ useHandCursor: true });

    const text = this.add.text(x + 60, y + 20, '← Menu', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    button.on('pointerover', () => {
      button.setFillStyle(0x4a5f7f);
      button.setScale(1.05);
      text.setScale(1.05);
    });

    button.on('pointerout', () => {
      button.setFillStyle(0x34495e);
      button.setScale(1.0);
      text.setScale(1.0);
    });

    button.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
