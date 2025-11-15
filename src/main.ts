import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { LevelScene } from './scenes/LevelScene';
import { EndLevelScene } from './scenes/EndLevelScene';
import { BoardConfig } from './game/BoardConfig';

// Calculate required canvas size based on board dimensions
const boardConfig = BoardConfig.fromURL();
const CELL_SIZE = 80;
const BOARD_OFFSET_X = 50;
const BOARD_OFFSET_Y = 150;
const MARGIN = 50;

// Calculate canvas dimensions
const boardWidth = boardConfig.cols * CELL_SIZE;
const boardHeight = boardConfig.rows * CELL_SIZE;
const canvasWidth = BOARD_OFFSET_X + boardWidth + MARGIN;
const canvasHeight = Math.max(600, BOARD_OFFSET_Y + boardHeight + MARGIN);

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: canvasWidth,
  height: canvasHeight,
  parent: 'game-container',
  backgroundColor: '#2c3e50',
  scene: [MainMenuScene, LevelScene, EndLevelScene]
};

console.log(`[Game] Canvas size: ${canvasWidth}×${canvasHeight} for ${boardConfig.rows}×${boardConfig.cols} board`);

new Phaser.Game(config);
