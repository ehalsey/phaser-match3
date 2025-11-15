import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';

export class ShopScene extends Phaser.Scene {
  private metaManager!: MetaProgressionManager;
  private livesText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;
    const centerY = height / 2;

    this.metaManager = MetaProgressionManager.getInstance();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a252f).setOrigin(0);

    // Title
    this.add.text(centerX, 80, 'Shop', {
      fontSize: '64px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Current resources display
    this.createResourceDisplay(centerX, 160);

    // Shop items
    this.createShopItems(centerX, centerY);

    // Back button
    const backButton = this.add.rectangle(centerX, height - 80, 200, 60, 0x95a5a6);
    backButton.setInteractive({ useHandCursor: true });

    const backText = this.add.text(centerX, height - 80, 'Back', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

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

    // Status message
    this.statusText = this.add.text(centerX, height - 140, '', {
      fontSize: '20px',
      color: '#e74c3c',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createResourceDisplay(x: number, y: number): void {
    // Lives
    this.add.circle(x - 120, y, 15, 0xe74c3c);
    this.livesText = this.add.text(x - 95, y - 15, `${this.metaManager.getLives()}/${this.metaManager.getMaxLives()}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });

    // Coins
    this.add.circle(x + 40, y, 15, 0xf1c40f);
    this.coinsText = this.add.text(x + 65, y - 15, `${this.metaManager.getCoins()}`, {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
  }

  private createShopItems(x: number, y: number): void {
    // Shop item container
    const itemBox = this.add.rectangle(x, y, 350, 180, 0x2c3e50);
    itemBox.setStrokeStyle(3, 0x3498db);

    // Life icon
    this.add.circle(x - 140, y - 40, 25, 0xe74c3c);
    this.add.text(x - 140, y - 42, '+1', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Item title
    this.add.text(x, y - 60, 'Buy 1 Life', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Cost
    this.add.circle(x - 40, y, 12, 0xf1c40f);
    this.add.text(x - 20, y - 10, `${this.metaManager.getLifeCost()}`, {
      fontSize: '28px',
      color: '#f1c40f',
      fontStyle: 'bold'
    });

    // Buy button
    const buyButton = this.add.rectangle(x, y + 50, 200, 60, 0x27ae60);
    buyButton.setInteractive({ useHandCursor: true });

    const buyText = this.add.text(x, y + 50, 'Buy', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Buy button hover
    buyButton.on('pointerover', () => {
      buyButton.setFillStyle(0x229954);
      buyButton.setScale(1.05);
      buyText.setScale(1.05);
    });

    buyButton.on('pointerout', () => {
      buyButton.setFillStyle(0x27ae60);
      buyButton.setScale(1.0);
      buyText.setScale(1.0);
    });

    // Buy button click
    buyButton.on('pointerdown', () => {
      this.purchaseLife();
    });
  }

  private purchaseLife(): void {
    const success = this.metaManager.buyLife();

    if (success) {
      // Update displays
      this.livesText.setText(`${this.metaManager.getLives()}/${this.metaManager.getMaxLives()}`);
      this.coinsText.setText(`${this.metaManager.getCoins()}`);
      this.statusText.setText('Purchase successful!');
      this.statusText.setColor('#2ecc71');

      // Clear status after 2 seconds
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
      });
    } else {
      // Show error
      if (this.metaManager.getLives() >= this.metaManager.getMaxLives()) {
        this.statusText.setText('Lives already full!');
      } else {
        this.statusText.setText('Not enough coins!');
      }
      this.statusText.setColor('#e74c3c');

      // Clear status after 2 seconds
      this.time.delayedCall(2000, () => {
        this.statusText.setText('');
      });
    }
  }
}
