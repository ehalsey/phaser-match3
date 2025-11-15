import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Title
    this.add.text(centerX, centerY - 150, 'Match-3 Game', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 80, 'Match 3 or more gems to score points!', {
      fontSize: '24px',
      color: '#ecf0f1'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.rectangle(centerX, centerY + 50, 250, 80, 0x3498db);
    startButton.setInteractive({ useHandCursor: true });

    const startText = this.add.text(centerX, centerY + 50, 'Start Game', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Button hover effects
    startButton.on('pointerover', () => {
      startButton.setFillStyle(0x2980b9);
      startButton.setScale(1.05);
      startText.setScale(1.05);
    });

    startButton.on('pointerout', () => {
      startButton.setFillStyle(0x3498db);
      startButton.setScale(1.0);
      startText.setScale(1.0);
    });

    // Start game on click
    startButton.on('pointerdown', () => {
      this.scene.start('LevelScene');
    });

    // Instructions
    this.add.text(centerX, centerY + 170, 'Click gems to select, then click adjacent gem to swap', {
      fontSize: '18px',
      color: '#95a5a6'
    }).setOrigin(0.5);

    // Version info
    this.add.text(centerX, height - 30, 'Built with Phaser 3 & TypeScript', {
      fontSize: '14px',
      color: '#7f8c8d'
    }).setOrigin(0.5);
  }
}
