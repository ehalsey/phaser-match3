import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';
import { ShopButton } from '../ui/ShopButton';
import { IconHelper } from '../ui/IconHelper';

export class ShopScene extends Phaser.Scene {
  private metaManager!: MetaProgressionManager;
  private livesText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private hammersText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private shopButtons: ShopButton[] = [];

  constructor() {
    super({ key: 'ShopScene' });
  }

  create(): void {
    const { width, height } = this.scale;
    const centerX = width / 2;

    this.metaManager = MetaProgressionManager.getInstance();

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);

    // Title
    this.add.text(centerX, 60, 'Shop', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Current resources display
    this.createResourceDisplay(centerX, 130);

    // Shop items grid
    this.createShopItems(centerX, 240);

    // Status message
    this.statusText = this.add.text(centerX, height - 120, '', {
      fontSize: '18px',
      color: '#4CAF50',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Back button
    const backButton = this.add.rectangle(centerX, height - 60, 160, 45, 0x7f8c8d);
    backButton.setInteractive({ useHandCursor: true });

    this.add.text(centerX, height - 60, 'Back', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backButton.on('pointerover', () => {
      backButton.setFillStyle(0x95a5a6);
    });

    backButton.on('pointerout', () => {
      backButton.setFillStyle(0x7f8c8d);
    });

    backButton.on('pointerdown', () => {
      this.scene.start('JourneyMapScene');
    });

    // Initial update of button states
    this.updateButtonStates();
  }

  private createResourceDisplay(x: number, y: number): void {
    const spacing = 100;

    // Lives - use graphics icon
    IconHelper.createHeart(this, x - spacing, y - 15, 24);
    this.livesText = this.add.text(x - spacing, y + 15, `${this.metaManager.getLives()}/${this.metaManager.getMaxLives()}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Coins - use graphics icon
    IconHelper.createCoin(this, x, y - 15, 24);
    this.coinsText = this.add.text(x, y + 15, `${this.metaManager.getCoins()}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Hammers - use graphics icon
    IconHelper.createHammer(this, x + spacing, y - 15, 24);
    this.hammersText = this.add.text(x + spacing, y + 15, `${this.metaManager.getHammers()}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private createShopItems(centerX: number, startY: number): void {
    const buttonWidth = 200;
    const buttonHeight = 150;
    const spacing = 20;

    // Calculate positions for 2x2 grid
    const col1X = centerX - buttonWidth / 2 - spacing / 2;
    const col2X = centerX + buttonWidth / 2 + spacing / 2;
    const row1Y = startY;
    const row2Y = startY + buttonHeight + spacing;

    // Single Life (10 coins)
    const singleLifeButton = new ShopButton({
      scene: this,
      x: col1X,
      y: row1Y,
      width: buttonWidth,
      height: buttonHeight,
      title: 'Single Life',
      description: '+1 Life',
      price: this.metaManager.getShopSingleLifeCost(),
      iconType: 'heart',
      onPurchase: () => this.purchaseSingleLife()
    });
    this.shopButtons.push(singleLifeButton);

    // Refill All Lives (50 coins)
    const refillLivesButton = new ShopButton({
      scene: this,
      x: col2X,
      y: row1Y,
      width: buttonWidth,
      height: buttonHeight,
      title: 'Refill Lives',
      description: 'Fill to max (5)',
      price: this.metaManager.getShopRefillLivesCost(),
      iconType: 'double-heart',
      onPurchase: () => this.purchaseRefillLives()
    });
    this.shopButtons.push(refillLivesButton);

    // Single Hammer (20 coins)
    const singleHammerButton = new ShopButton({
      scene: this,
      x: col1X,
      y: row2Y,
      width: buttonWidth,
      height: buttonHeight,
      title: 'Hammer',
      description: '+1 Hammer',
      price: this.metaManager.getShopSingleHammerCost(),
      iconType: 'hammer',
      onPurchase: () => this.purchaseSingleHammer()
    });
    this.shopButtons.push(singleHammerButton);

    // Hammer 3-Pack (50 coins)
    const hammerPackButton = new ShopButton({
      scene: this,
      x: col2X,
      y: row2Y,
      width: buttonWidth,
      height: buttonHeight,
      title: 'Hammer Pack',
      description: `+${this.metaManager.getShopHammerPackSize()} Hammers (save 10!)`,
      price: this.metaManager.getShopHammerPackCost(),
      iconType: 'hammer-pack',
      onPurchase: () => this.purchaseHammerPack()
    });
    this.shopButtons.push(hammerPackButton);
  }

  private purchaseSingleLife(): boolean {
    const success = this.metaManager.buySingleLife();

    if (success) {
      this.showStatus('Life purchased!', '#4CAF50');
      this.updateDisplays();
      return true;
    } else {
      if (this.metaManager.getLives() >= this.metaManager.getMaxLives()) {
        this.showStatus('Lives already full!', '#f39c12');
      } else {
        this.showStatus('Not enough coins!', '#e74c3c');
      }
      return false;
    }
  }

  private purchaseRefillLives(): boolean {
    const success = this.metaManager.buyAllLives();

    if (success) {
      this.showStatus('Lives refilled!', '#4CAF50');
      this.updateDisplays();
      return true;
    } else {
      if (this.metaManager.getLives() >= this.metaManager.getMaxLives()) {
        this.showStatus('Lives already full!', '#f39c12');
      } else {
        this.showStatus('Not enough coins!', '#e74c3c');
      }
      return false;
    }
  }

  private purchaseSingleHammer(): boolean {
    const success = this.metaManager.buySingleHammer();

    if (success) {
      this.showStatus('Hammer purchased!', '#4CAF50');
      this.updateDisplays();
      return true;
    } else {
      this.showStatus('Not enough coins!', '#e74c3c');
      return false;
    }
  }

  private purchaseHammerPack(): boolean {
    const success = this.metaManager.buyHammerPack();

    if (success) {
      this.showStatus('Hammer pack purchased!', '#4CAF50');
      this.updateDisplays();
      return true;
    } else {
      this.showStatus('Not enough coins!', '#e74c3c');
      return false;
    }
  }

  private showStatus(message: string, color: string): void {
    this.statusText.setText(message);
    this.statusText.setColor(color);

    // Clear status after 2 seconds
    this.time.delayedCall(2000, () => {
      this.statusText.setText('');
    });
  }

  private updateDisplays(): void {
    this.livesText.setText(`${this.metaManager.getLives()}/${this.metaManager.getMaxLives()}`);
    this.coinsText.setText(`${this.metaManager.getCoins()}`);
    this.hammersText.setText(`${this.metaManager.getHammers()}`);
    this.updateButtonStates();
  }

  private updateButtonStates(): void {
    const coins = this.metaManager.getCoins();
    const lives = this.metaManager.getLives();
    const maxLives = this.metaManager.getMaxLives();

    // Update each button based on affordability
    if (this.shopButtons.length >= 4) {
      // Single Life
      const canAffordSingleLife = coins >= this.metaManager.getShopSingleLifeCost();
      const livesNotFull = lives < maxLives;
      this.shopButtons[0].setEnabled(canAffordSingleLife && livesNotFull);
      if (!livesNotFull) {
        this.shopButtons[0].setButtonText('Full');
      }

      // Refill Lives
      const canAffordRefill = coins >= this.metaManager.getShopRefillLivesCost();
      this.shopButtons[1].setEnabled(canAffordRefill && livesNotFull);
      if (!livesNotFull) {
        this.shopButtons[1].setButtonText('Full');
      }

      // Single Hammer
      const canAffordHammer = coins >= this.metaManager.getShopSingleHammerCost();
      this.shopButtons[2].setEnabled(canAffordHammer);

      // Hammer Pack
      const canAffordPack = coins >= this.metaManager.getShopHammerPackCost();
      this.shopButtons[3].setEnabled(canAffordPack);
    }
  }
}
