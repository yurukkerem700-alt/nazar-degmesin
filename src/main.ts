import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import ShopScene from './scenes/ShopScene';
import GameScene from './scenes/GameScene';
import GameOverScene from './scenes/GameOverScene';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0a1628',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  scene: [BootScene, MenuScene, ShopScene, GameScene, GameOverScene],
  audio: {
    disableWebAudio: false,
  },
  render: {
    pixelArt: false,
    antialias: true,
  },
});
