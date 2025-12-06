import Phaser from 'phaser';
import { IconHelper } from './IconHelper';

export type IconType = 'heart' | 'double-heart' | 'coin' | 'hammer' | 'hammer-pack';

export interface ShopButtonConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  description: string;
  price: number;
  icon?: string;
  iconType?: IconType; // Use graphics icon instead of emoji
  onPurchase: () => boolean; // Returns true if purchase successful
}

/**
 * Reusable shop button component for purchasing items
 */
export class ShopButton {
  private scene: Phaser.Scene;
  private config: ShopButtonConfig;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private descText: Phaser.GameObjects.Text;
  private priceText: Phaser.GameObjects.Text;
  private iconText?: Phaser.GameObjects.Text;
  private purchaseButton: Phaser.GameObjects.Rectangle;
  private buttonText: Phaser.GameObjects.Text;

  constructor(config: ShopButtonConfig) {
    this.scene = config.scene;
    this.config = config;

    // Create container
    this.container = this.scene.add.container(config.x, config.y);

    // Background card
    this.background = this.scene.add.rectangle(0, 0, config.width, config.height, 0x2a2a2a)
      .setStrokeStyle(2, 0x444444);
    this.container.add(this.background);

    // Icon (if provided) - prefer iconType for graphics-based icons
    if (config.iconType) {
      const iconX = config.x - config.width / 2 + 35;
      const iconY = config.y - config.height / 2 + 50;

      switch (config.iconType) {
        case 'heart':
          IconHelper.createHeart(this.scene, iconX, iconY, 32);
          break;
        case 'double-heart':
          IconHelper.createDoubleHeart(this.scene, iconX, iconY, 32);
          break;
        case 'coin':
          IconHelper.createCoin(this.scene, iconX, iconY, 32);
          break;
        case 'hammer':
          IconHelper.createHammer(this.scene, iconX, iconY, 32);
          break;
        case 'hammer-pack':
          // Draw 3 hammers
          IconHelper.createHammer(this.scene, iconX - 15, iconY, 24);
          IconHelper.createHammer(this.scene, iconX, iconY - 8, 24);
          IconHelper.createHammer(this.scene, iconX + 15, iconY, 24);
          break;
        default:
          IconHelper.createCoin(this.scene, iconX, iconY, 32);
      }
      // Note: Graphics are added to scene directly at absolute positions
    } else if (config.icon) {
      // Fallback to emoji text (less reliable)
      this.iconText = this.scene.add.text(-config.width / 2 + 20, -config.height / 2 + 30, config.icon, {
        fontSize: '40px',
      }).setOrigin(0, 0);
      this.container.add(this.iconText);
    }

    // Title
    this.titleText = this.scene.add.text(0, -config.height / 2 + 20, config.title, {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0);
    this.container.add(this.titleText);

    // Description
    this.descText = this.scene.add.text(0, -config.height / 2 + 50, config.description, {
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: config.width - 40 }
    }).setOrigin(0.5, 0);
    this.container.add(this.descText);

    // Purchase button
    const buttonY = config.height / 2 - 40;
    this.purchaseButton = this.scene.add.rectangle(0, buttonY, config.width - 40, 35, 0x4CAF50)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0x66BB6A);
    this.container.add(this.purchaseButton);

    // Price text on button
    this.priceText = this.scene.add.text(-15, buttonY, `${config.price}`, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    this.container.add(this.priceText);

    // Coin icon on button
    const coinIcon = this.scene.add.text(0, buttonY, '💰', {
      fontSize: '18px'
    }).setOrigin(0.5);
    this.container.add(coinIcon);

    // Button text
    this.buttonText = this.scene.add.text(config.width / 2 - 50, buttonY, 'Buy', {
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
    this.container.add(this.buttonText);

    // Purchase button events
    this.purchaseButton.on('pointerover', () => {
      this.purchaseButton.setFillStyle(0x66BB6A);
    });

    this.purchaseButton.on('pointerout', () => {
      this.purchaseButton.setFillStyle(0x4CAF50);
    });

    this.purchaseButton.on('pointerdown', () => {
      const success = this.config.onPurchase();
      if (success) {
        // Visual feedback
        this.scene.tweens.add({
          targets: this.container,
          scale: 1.05,
          duration: 100,
          yoyo: true
        });
      } else {
        // Shake animation for failed purchase
        this.scene.tweens.add({
          targets: this.container,
          x: config.x - 5,
          duration: 50,
          yoyo: true,
          repeat: 3
        });
      }
    });
  }

  /**
   * Set whether the button is enabled (can afford)
   */
  public setEnabled(enabled: boolean): void {
    this.purchaseButton.setFillStyle(enabled ? 0x4CAF50 : 0x888888);
    this.purchaseButton.setInteractive(enabled);
    this.buttonText.setColor(enabled ? '#ffffff' : '#666666');
  }

  /**
   * Set button text
   */
  public setButtonText(text: string): void {
    this.buttonText.setText(text);
  }

  /**
   * Get the container for this button
   */
  public getContainer(): Phaser.GameObjects.Container {
    return this.container;
  }

  /**
   * Destroy the button
   */
  public destroy(): void {
    this.container.destroy();
  }
}
