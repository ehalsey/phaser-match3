import Phaser from 'phaser';
import { InteractiveGameScene } from './scenes/InteractiveGameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scene: [InteractiveGameScene]
};

new Phaser.Game(config);
