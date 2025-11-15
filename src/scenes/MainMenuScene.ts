import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class MainMenuScene extends Phaser.Scene {
  private metaManager!: MetaProgressionManager;
  private livesText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent!: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    // Get meta progression manager
    this.metaManager = MetaProgressionManager.getInstance();

    // Background
    this.add.rectangle(0, 0, width, height, 0x2c3e50).setOrigin(0);

    // Lives and Coins display (top-left)
    this.createResourceDisplay(20, 20);

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
      if (this.metaManager.hasLives()) {
        this.scene.start('LevelScene');
      }
    });

    // Disable button if no lives
    if (!this.metaManager.hasLives()) {
      startButton.setFillStyle(0x7f8c8d);
      startText.setText('No Lives!');
      startButton.disableInteractive();
    }

    // Shop button
    const shopButton = this.add.rectangle(centerX, centerY + 150, 200, 60, 0x27ae60);
    shopButton.setInteractive({ useHandCursor: true });

    const shopText = this.add.text(centerX, centerY + 150, 'Shop', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    shopButton.on('pointerover', () => {
      shopButton.setFillStyle(0x229954);
      shopButton.setScale(1.05);
      shopText.setScale(1.05);
    });

    shopButton.on('pointerout', () => {
      shopButton.setFillStyle(0x27ae60);
      shopButton.setScale(1.0);
      shopText.setScale(1.0);
    });

    shopButton.on('pointerdown', () => {
      this.scene.start('ShopScene');
    });

    // Instructions
    this.add.text(centerX, centerY + 230, 'Click gems to select, then click adjacent gem to swap', {
      fontSize: '18px',
      color: '#95a5a6'
    }).setOrigin(0.5);

    // Version info
    this.add.text(centerX, height - 30, 'Built with Phaser 3 & TypeScript', {
      fontSize: '14px',
      color: '#7f8c8d'
    }).setOrigin(0.5);

    // Update timer every second
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  private createResourceDisplay(x: number, y: number): void {
    // Lives display
    const livesIcon = this.add.circle(x + 15, y + 15, 12, 0xe74c3c);
    this.livesText = this.add.text(x + 35, y + 5, `${this.metaManager.getLives()}/${this.metaManager.getMaxLives()}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // Timer for next life (if not at max)
    this.timerText = this.add.text(x + 35, y + 30, '', {
      fontSize: '16px',
      color: '#95a5a6'
    });
    this.updateTimer();

    // Coins display (below lives)
    const coinsIcon = this.add.circle(x + 15, y + 75, 12, 0xf1c40f);
    this.coinsText = this.add.text(x + 35, y + 65, `${this.metaManager.getCoins()}`, {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
  }

  private updateTimer(): void {
    const lives = this.metaManager.getLives();
    this.livesText.setText(`${lives}/${this.metaManager.getMaxLives()}`);
    this.coinsText.setText(`${this.metaManager.getCoins()}`);

    if (lives < this.metaManager.getMaxLives()) {
      const timeString = this.metaManager.getTimeUntilNextLifeFormatted();
      this.timerText.setText(`Next: ${timeString}`);
    } else {
      this.timerText.setText('FULL');
    }
  }

  destroy(): void {
    if (this.timerEvent) {
      this.timerEvent.remove();
    }
    super.destroy();
  }
}
