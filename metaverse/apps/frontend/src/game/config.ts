import { AUTO, Scale } from 'phaser';
import type { Types } from 'phaser';
import { OfficeScene } from './scenes/OfficeScene';

export const GameConfig: Types.Core.GameConfig = {
  type: AUTO,
  parent: 'game-container',
  backgroundColor: '#ffffff',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    width: 480,
    height: 480
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: true
    }
  },
  scene: OfficeScene,
  audio: {
    disableWebAudio: true
  }
};