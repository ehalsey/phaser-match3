import Phaser from 'phaser';
import { LevelConfig, LevelDifficulty } from '../game/LevelConfig';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class LevelJourneyScene extends Phaser.Scene {
  private currentLevel: number = 1;
  private metaManager!: MetaProgressionManager;

  constructor() {
    super({ key: 'LevelJourneyScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.metaManager = MetaProgressionManager.getInstance();

    // Load current level from localStorage
    this.currentLevel = this.metaManager.getCurrentLevel();

    // Get level configuration
    const levelSettings = LevelConfig.getLevel(this.currentLevel);
    const difficultyColor = LevelConfig.getDifficultyColor(levelSettings.difficulty);
    const difficultyName = LevelConfig.getDifficultyName(levelSettings.difficulty);

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a252f).setOrigin(0);

    // Title
    this.add.text(centerX, 80, 'Level Journey', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level number display (large)
    this.add.text(centerX, 180, `Level ${this.currentLevel}`, {
      fontSize: '64px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Difficulty badge
    const badgeY = 270;
    const badge = this.add.rectangle(centerX, badgeY, 200, 50, difficultyColor);
    badge.setStrokeStyle(3, 0xffffff);

    this.add.text(centerX, badgeY, difficultyName, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Level details
    const detailsY = 350;
    const detailsBox = this.add.rectangle(centerX, detailsY + 60, 400, 180, 0x34495e);
    detailsBox.setStrokeStyle(2, 0x7f8c8d);

    this.add.text(centerX, detailsY, 'Level Objectives', {
      fontSize: '24px',
      color: '#ecf0f1',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, detailsY + 40, `Moves: ${levelSettings.moves}`, {
      fontSize: '22px',
      color: '#3498db'
    }).setOrigin(0.5);

    this.add.text(centerX, detailsY + 75, `Target Score: ${levelSettings.targetScore}`, {
      fontSize: '22px',
      color: '#2ecc71'
    }).setOrigin(0.5);

    this.add.text(centerX, detailsY + 110, `Board: ${levelSettings.boardRows}×${levelSettings.boardCols}`, {
      fontSize: '22px',
      color: '#9b59b6'
    }).setOrigin(0.5);

    // Start Level button
    const startButton = this.add.rectangle(centerX, height - 150, 300, 80, 0x27ae60);
    const startText = this.add.text(centerX, height - 150, 'Start Level', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Disable if no lives
    if (this.metaManager.hasLives()) {
      startButton.setInteractive({ useHandCursor: true });
    } else {
      startButton.setFillStyle(0x7f8c8d);
      startText.setText('No Lives!');
    }

    // Back to menu button
    const backButton = this.add.rectangle(centerX, height - 60, 200, 50, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });

    const backText = this.add.text(centerX, height - 60, 'Main Menu', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Button hover effects and handlers
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x229954);
      startButton.setScale(1.05);
      startText.setScale(1.05);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x27ae60);
      startButton.setScale(1.0);
      startText.setScale(1.0);
    });

    startButton.on('pointerdown', () => {
      this.scene.start('LevelScene', {
        levelNumber: this.currentLevel,
        levelSettings: levelSettings
      });
    });

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x7f8c8d);
      backButton.setScale(1.05);
      backText.setScale(1.05);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x95a5a6);
      backButton.setScale(1.0);
      backText.setScale(1.0);
    });

    backButton.on('pointerdown', () => {
      this.scene.start('MainMenuScene');
    });

    // Show progress indicator (levels completed)
    const levelsCompleted = this.currentLevel - 1;
    if (levelsCompleted > 0) {
      this.add.text(centerX, 560, `Levels Completed: ${levelsCompleted}`, {
        fontSize: '18px',
        color: '#95a5a6'
      }).setOrigin(0.5);
    }
  }
}
