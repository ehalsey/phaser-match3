import Phaser from 'phaser';
import { MetaProgressionManager } from '../game/MetaProgressionManager';
import { LevelStatus } from '../game/LevelObjectives';

export class EndLevelScene extends Phaser.Scene {
  private finalScore: number = 0;
  private coinsEarned: number = 0;
  private metaManager!: MetaProgressionManager;
  private levelStatus: LevelStatus = LevelStatus.FAILED;
  private levelNumber: number = 1;
  private continuationAttempts: number = 0;
  private starsEarned: number = 0;

  constructor() {
    super({ key: 'EndLevelScene' });
  }

  init(data: { score: number, status: LevelStatus, movesRemaining: number, levelNumber: number, continuationAttempts?: number }): void {
    this.finalScore = data.score || 0;
    this.levelStatus = data.status || LevelStatus.FAILED;
    this.levelNumber = data.levelNumber || 1;
    this.continuationAttempts = data.continuationAttempts || 0;
    this.metaManager = MetaProgressionManager.getInstance();

    // Handle level completion
    if (this.levelStatus === LevelStatus.PASSED) {
      // Award coins and advance to next level
      this.coinsEarned = this.metaManager.rewardLevelCompletion(this.finalScore, this.levelNumber);
      this.starsEarned = this.metaManager.getLevelStars(this.levelNumber);
      this.metaManager.advanceToNextLevel();
    } else {
      // No coins on failure
      this.coinsEarned = 0;
      this.starsEarned = 0;
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

      // Star rating display
      const starText = '★'.repeat(this.starsEarned) + '☆'.repeat(3 - this.starsEarned);
      this.add.text(centerX, centerY + 70, starText, {
        fontSize: '48px',
        color: '#f1c40f',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    } else {
      // Show failure message
      this.add.text(centerX, centerY + 10, 'Better luck next time!', {
        fontSize: '24px',
        color: '#ecf0f1'
      }).setOrigin(0.5);

      // Add Buy Turns button for failed levels
      this.createBuyTurnsButton(centerX, centerY + 60);
    }

    // Next Level / Try Again button (shifted down if failed)
    const nextButtonY = isPassed ? centerY + 100 : centerY + 135;
    const nextButton = this.add.rectangle(centerX, nextButtonY, 250, 70, 0x3498db);
    const buttonText = isPassed ? 'Next Level' : 'Try Again';
    const nextText = this.add.text(centerX, nextButtonY, buttonText, {
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

    // Main Menu button (shifted down if failed)
    const menuButtonY = isPassed ? centerY + 190 : centerY + 225;
    const menuButton = this.add.rectangle(centerX, menuButtonY, 250, 70, 0x95a5a6);
    menuButton.setInteractive({ useHandCursor: true });

    const menuText = this.add.text(centerX, menuButtonY, 'Main Menu', {
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
      // If level failed, LevelScene is sleeping - stop it first
      if (!isPassed && this.scene.isSleeping('LevelScene')) {
        this.scene.stop('LevelScene');
      }
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
      // If level failed, LevelScene is sleeping - stop it first
      if (!isPassed && this.scene.isSleeping('LevelScene')) {
        this.scene.stop('LevelScene');
      }
      this.scene.start('JourneyMapScene');
    });
  }

  private createBuyTurnsButton(x: number, y: number): void {
    // Cost increases with each continuation attempt: 10, 20, 30, etc.
    const turnsCost = 10 * (this.continuationAttempts + 1);
    const currentCoins = this.metaManager.getCoins();
    const canAfford = currentCoins >= turnsCost;

    // Buy Turns button
    const buyButton = this.add.rectangle(x, y, 250, 60, 0x27ae60);
    const buyText = this.add.text(x, y - 8, 'Buy 5 More Turns', {
      fontSize: '22px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Cost display
    this.add.circle(x - 50, y + 12, 8, 0xf1c40f);
    const costText = this.add.text(x - 20, y + 10, `-${turnsCost}`, {
      fontSize: '18px',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Disable if can't afford
    if (!canAfford) {
      buyButton.setFillStyle(0x7f8c8d);
      buyButton.setAlpha(0.5);
      buyText.setAlpha(0.5);
      costText.setAlpha(0.5);
      buyText.setText('Not enough coins');
      costText.setVisible(false);
    } else {
      buyButton.setInteractive({ useHandCursor: true });

      buyButton.on('pointerover', () => {
        buyButton.setFillStyle(0x229954);
        buyButton.setScale(1.05);
        buyText.setScale(1.05);
        costText.setScale(1.05);
      });

      buyButton.on('pointerout', () => {
        buyButton.setFillStyle(0x27ae60);
        buyButton.setScale(1.0);
        buyText.setScale(1.0);
        costText.setScale(1.0);
      });

      buyButton.on('pointerdown', () => {
        console.log('[BuyTurns] Button clicked');
        console.log('[BuyTurns] Current coins:', this.metaManager.getCoins());
        console.log('[BuyTurns] Turns cost:', turnsCost);

        // Deduct coins
        const success = this.metaManager.spendCoins(turnsCost);
        console.log('[BuyTurns] Coins deducted:', success);

        if (success) {
          // Get the sleeping LevelScene and add bonus moves
          const levelScene = this.scene.get('LevelScene') as any;
          console.log('[BuyTurns] LevelScene found:', !!levelScene);
          console.log('[BuyTurns] LevelScene is sleeping:', this.scene.isSleeping('LevelScene'));

          if (levelScene && levelScene.addBonusMoves) {
            console.log('[BuyTurns] Adding 5 bonus moves');
            levelScene.addBonusMoves(5);
            // Increment continuation attempts for next purchase
            levelScene.continuationAttempts = this.continuationAttempts + 1;
            console.log('[BuyTurns] Continuation attempts now:', levelScene.continuationAttempts);
          }

          // Stop this overlay scene first
          console.log('[BuyTurns] Stopping EndLevelScene');
          this.scene.stop();

          // Wake the sleeping LevelScene
          console.log('[BuyTurns] Waking LevelScene');
          this.scene.wake('LevelScene');
          console.log('[BuyTurns] Scene wake called');
        } else {
          console.log('[BuyTurns] Failed to deduct coins - not enough coins!');
        }
      });
    }
  }
}
