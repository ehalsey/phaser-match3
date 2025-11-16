import Phaser from 'phaser';
import { LevelConfig } from '../game/LevelConfig';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class JourneyMapScene extends Phaser.Scene {
  private metaManager!: MetaProgressionManager;
  private currentLevel: number = 1;
  private readonly LEVEL_NODE_SIZE = 60;
  private readonly MAX_LEVELS_TO_SHOW = 50; // Show up to 50 levels total
  private levelContainer!: Phaser.GameObjects.Container;
  private scrollY: number = 0;
  private readonly SCROLL_SPEED = 30;

  constructor() {
    super({ key: 'JourneyMapScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.metaManager = MetaProgressionManager.getInstance();
    this.currentLevel = this.metaManager.getCurrentLevel();

    // Background (fixed, doesn't scroll)
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title (fixed, doesn't scroll)
    this.add.text(centerX, 60, 'Level Journey', {
      fontSize: '48px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(1000);

    // Subtitle with current level (fixed, doesn't scroll)
    this.add.text(centerX, 110, `Your Progress: Level ${this.currentLevel}`, {
      fontSize: '20px',
      color: '#95a5a6'
    }).setOrigin(0.5).setDepth(1000);

    // Create scrollable container for level map
    this.levelContainer = this.add.container(0, 0);

    // Draw level path/map
    this.createLevelMap(centerX, 180);

    // Scroll to current level
    this.scrollToCurrentLevel();

    // Enable mouse wheel scrolling
    this.input.on('wheel', (_pointer: any, _gameObjects: any, _deltaX: number, deltaY: number) => {
      this.scroll(deltaY > 0 ? this.SCROLL_SPEED : -this.SCROLL_SPEED);
    });

    // Enable touch/drag scrolling
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.getDuration() > 50) {
        this.scroll(-pointer.velocity.y! / 10);
      }
    });

    // Scroll indicators
    this.createScrollIndicators(width, height);

    // Back to menu button (top-left, fixed)
    this.createBackButton(20, 20);
  }

  private scroll(deltaY: number): void {
    this.scrollY += deltaY;

    // Calculate bounds
    const { height } = this.scale;
    const contentHeight = this.levelContainer.getBounds().height;
    const minScroll = 0;
    const maxScroll = Math.max(0, contentHeight - height + 200);

    // Clamp scroll position
    this.scrollY = Phaser.Math.Clamp(this.scrollY, minScroll, maxScroll);

    // Update container position
    this.levelContainer.y = 180 - this.scrollY;
  }

  private scrollToCurrentLevel(): void {
    // Scroll to show current level in the middle of the screen
    const { height } = this.scale;
    const verticalGap = 100;
    const currentLevelY = (this.currentLevel - 1) * verticalGap;
    const targetScroll = currentLevelY - (height / 2) + 180;

    this.scrollY = Math.max(0, targetScroll);
    this.levelContainer.y = 180 - this.scrollY;
  }

  private createScrollIndicators(width: number, height: number): void {
    // Scroll hint text at bottom
    const scrollHint = this.add.text(width / 2, height - 30, '↕ Scroll to view all levels', {
      fontSize: '16px',
      color: '#95a5a6'
    }).setOrigin(0.5).setDepth(1000);

    // Fade in/out based on scroll position
    this.time.addEvent({
      delay: 100,
      loop: true,
      callback: () => {
        const contentHeight = this.levelContainer.getBounds().height;
        const maxScroll = Math.max(0, contentHeight - height + 200);

        if (maxScroll > 0) {
          scrollHint.setAlpha(1);
        } else {
          scrollHint.setAlpha(0);
        }
      }
    });
  }

  private createLevelMap(startX: number, _startY: number): void {
    const startLevel = 1; // Always start from level 1
    const endLevel = Math.min(this.currentLevel + 5, this.MAX_LEVELS_TO_SHOW); // Show current + 5 upcoming

    // Create path with alternating left/right layout
    const verticalGap = 100;
    const horizontalOffset = 150;

    for (let level = startLevel; level <= endLevel; level++) {
      const isCompleted = level < this.currentLevel;
      const isCurrent = level === this.currentLevel;
      const isUpcoming = level > this.currentLevel;

      // Alternate left and right
      const row = level - startLevel;
      const offsetX = (row % 2 === 0) ? -horizontalOffset : horizontalOffset;
      const nodeX = startX + offsetX;
      const nodeY = (row * verticalGap);

      // Draw connecting line to previous level (if not first)
      if (level > startLevel) {
        const prevRow = row - 1;
        const prevOffsetX = (prevRow % 2 === 0) ? -horizontalOffset : horizontalOffset;
        const prevX = startX + prevOffsetX;
        const prevY = (prevRow * verticalGap);

        const lineColor = isCompleted ? 0x2ecc71 : 0x7f8c8d;
        const line = this.add.line(0, 0, prevX, prevY, nodeX, nodeY, lineColor, 0.5);
        line.setOrigin(0, 0);
        line.setLineWidth(4);

        // Add line to scrollable container
        this.levelContainer.add(line);
      }

      // Create level node (will be added to container inside)
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

    // Add to scrollable container
    this.levelContainer.add(circle);

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
    const levelText = this.add.text(x, y - 12, level.toString(), {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.levelContainer.add(levelText);

    // Status indicator
    if (isCompleted) {
      // Star rating for completed levels
      const metaManager = MetaProgressionManager.getInstance();
      const stars = metaManager.getLevelStars(level);
      const starText = '★'.repeat(stars);
      const starsDisplay = this.add.text(x, y + 10, starText, {
        fontSize: '18px',
        color: '#f1c40f'
      }).setOrigin(0.5);
      this.levelContainer.add(starsDisplay);
    } else if (isCurrent) {
      // Indicator for current level
      const currentIndicator = this.add.text(x, y + 12, '▶', {
        fontSize: '16px',
        color: '#ffffff'
      }).setOrigin(0.5);
      this.levelContainer.add(currentIndicator);
    }

    // Difficulty badge (small colored circle next to node)
    const badgeX = x + this.LEVEL_NODE_SIZE / 2 + 15;
    const badge = this.add.circle(badgeX, y, 8, difficultyColor);
    badge.setStrokeStyle(2, 0xffffff, 0.8);
    this.levelContainer.add(badge);

    // Info panel on hover (for current, completed, and upcoming levels)
    if (isCurrent || isCompleted || isUpcoming) {
      const infoPanel = this.createInfoPanel(x, y - 100, levelSettings);
      infoPanel.setVisible(false);
      this.levelContainer.add(infoPanel);

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
    button.setDepth(1000); // Keep button on top

    const text = this.add.text(x + 60, y + 20, '← Menu', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    text.setDepth(1000); // Keep text on top

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
