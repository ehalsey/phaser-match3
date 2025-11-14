import Phaser from 'phaser';
import { TestBoardScene } from './scenes/TestBoardScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scene: [TestBoardScene]
};

new Phaser.Game(config);
