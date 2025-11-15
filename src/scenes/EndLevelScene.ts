import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class EndLevelScene extends Phaser.Scene {
  private finalScore: number = 0;
  private coinsEarned: number = 0;
  private metaManager!: MetaProgressionManager;

  constructor() {
    super({ key: 'EndLevelScene' });
  }

  init(data: { score: number }): void {
    this.finalScore = data.score || 0;
    this.metaManager = MetaProgressionManager.getInstance();

    // Calculate and award coins for completing level
    this.coinsEarned = this.metaManager.rewardLevelCompletion(this.finalScore);
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background with semi-transparent overlay
    this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);

    // Game Over title
    this.add.text(centerX, centerY - 200, 'Level Complete!', {
      fontSize: '56px',
      color: '#2ecc71',
      fontStyle: 'bold'
    }).setOrigin(0.5);

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

    // Coins earned display
    this.add.text(centerX, centerY - 10, 'Coins Earned', {
      fontSize: '24px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    const coinsIcon = this.add.circle(centerX - 40, centerY + 30, 12, 0xf1c40f);
    this.add.text(centerX, centerY + 25, `+${this.coinsEarned}`, {
      fontSize: '40px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add.rectangle(centerX, centerY + 100, 250, 70, 0x3498db);
    const playAgainText = this.add.text(centerX, centerY + 100, 'Play Again', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Disable if no lives
    if (this.metaManager.hasLives()) {
      playAgainButton.setInteractive({ useHandCursor: true });
    } else {
      playAgainButton.setFillStyle(0x7f8c8d);
      playAgainText.setText('No Lives!');
    }

    // Main Menu button
    const menuButton = this.add.rectangle(centerX, centerY + 190, 250, 70, 0x95a5a6);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(centerX, centerY + 190, 'Main Menu', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Play Again button hover effects
    playAgainButton.on('pointerover', () => {
      playAgainButton.setFillStyle(0x2980b9);
      playAgainButton.setScale(1.05);
      playAgainText.setScale(1.05);
    });

    playAgainButton.on('pointerout', () => {
      playAgainButton.setFillStyle(0x3498db);
      playAgainButton.setScale(1.0);
      playAgainText.setScale(1.0);
    });

    playAgainButton.on('pointerdown', () => {
      this.scene.start('LevelScene');
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
      this.scene.start('MainMenuScene');
    });
  }
}
