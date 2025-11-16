import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';
import { LevelStatus } from '../game/LevelObjectives';

export class EndLevelScene extends Phaser.Scene {
  private finalScore: number = 0;
  private coinsEarned: number = 0;
  private metaManager!: MetaProgressionManager;
  private levelStatus: LevelStatus = LevelStatus.FAILED;

  constructor() {
    super({ key: 'EndLevelScene' });
  }

  init(data: { score: number, status: LevelStatus, movesRemaining: number, levelNumber: number }): void {
    this.finalScore = data.score || 0;
    this.levelStatus = data.status || LevelStatus.FAILED;
    this.metaManager = MetaProgressionManager.getInstance();

    // Handle level completion
    if (this.levelStatus === LevelStatus.PASSED) {
      // Award coins and advance to next level
      this.coinsEarned = this.metaManager.rewardLevelCompletion(this.finalScore);
      this.metaManager.advanceToNextLevel();
    } else {
      // Consume a life on failure
      this.metaManager.consumeLife();
      this.coinsEarned = 0;
    }
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background with semi-transparent overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Title based on status
    const isPassed = this.levelStatus === LevelStatus.PASSED;
    const titleText = isPassed ? 'Level Complete!' : 'Level Failed';
    const titleColor = isPassed ? '#2ecc71' : '#e74c3c';

    this.add.text(centerX, centerY - 200, titleText, {
      fontSize: '56px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Show gem goals message
    if (!isPassed) {
      this.add.text(centerX, centerY - 140, `Goals not met!`, {
        fontSize: '20px',
        color: '#95a5a6'
      }).setOrigin(0.5);
    }

    // Score display
    this.add.text(centerX, centerY - 110, 'Final Score', {
      fontSize: '24px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    this.add.text(centerX, centerY - 70, this.finalScore.toString(), {
      fontSize: '56px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Coins earned display (only if passed)
    if (isPassed) {
      this.add.text(centerX, centerY - 10, 'Coins Earned', {
        fontSize: '24px',
        color: '#ecf0f1'
      }).setOrigin(0.5);

      this.add.circle(centerX - 40, centerY + 30, 12, 0xf1c40f);
      this.add.text(centerX, centerY + 25, `+${this.coinsEarned}`, {
        fontSize: '40px',
        color: '#f1c40f',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      // Show failure message
      this.add.text(centerX, centerY + 10, 'Better luck next time!', {
        fontSize: '24px',
        color: '#ecf0f1'
      }).setOrigin(0.5);
    }

    // Next Level / Try Again button
    const nextButton = this.add.rectangle(centerX, centerY + 100, 250, 70, 0x3498db);
    const buttonText = isPassed ? 'Next Level' : 'Try Again';
    const nextText = this.add.text(centerX, centerY + 100, buttonText, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Disable if no lives
    if (this.metaManager.hasLives()) {
      nextButton.setInteractive({ useHandCursor: true });
    } else {
      nextButton.setFillStyle(0x7f8c8d);
      nextText.setText('No Lives!');
    }

    // Main Menu button
    const menuButton = this.add.rectangle(centerX, centerY + 190, 250, 70, 0x95a5a6);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(centerX, centerY + 190, 'Main Menu', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Next Level / Try Again button hover effects
    nextButton.on('pointerover', () => {
      nextButton.setFillStyle(0x2980b9);
      nextButton.setScale(1.05);
      nextText.setScale(1.05);
    });

    nextButton.on('pointerout', () => {
      nextButton.setFillStyle(0x3498db);
      nextButton.setScale(1.0);
      nextText.setScale(1.0);
    });

    nextButton.on('pointerdown', () => {
      this.scene.start('JourneyMapScene');
    });

    // Main Menu button hover effects
    menuButton.on('pointerover', () => {
      menuButton.setFillStyle(0x7f8c8d);
      menuButton.setScale(1.05);
      menuText.setScale(1.05);
    });

    menuButton.on('pointerout', () => {
      menuButton.setFillStyle(0x95a5a6);
      menuButton.setScale(1.0);
      menuText.setScale(1.0);
    });

    menuButton.on('pointerdown', () => {
      this.scene.start('JourneyMapScene');
    });
  }
}
