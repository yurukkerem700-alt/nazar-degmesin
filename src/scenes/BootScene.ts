import Phaser from 'phaser';
import { Storage, KEYS } from '../utils/storage';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a1628);
    this.add.text(w / 2, h / 2 - 50, 'YUKLENIYOR...', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const bar = this.add.rectangle(w / 2, h / 2 + 20, 300, 20, 0x1a3a5c).setStrokeStyle(2, 0x00ccff);
    const fill = this.add.rectangle(w / 2 - 150, h / 2 + 20, 0, 16, 0x00ccff).setOrigin(0, 0.5);

    this.load.on('progress', (value: number) => {
      fill.setSize(300 * value, 16);
    });

    // Arka planlar
    this.load.image('bg', 'images/bg.png');
    this.load.image('bg_kapadokya', 'images/bg_kapadokya.png');
    this.load.image('bg_pamukkale', 'images/bg_pamukkale.png');
    this.load.image('bg_efes', 'images/bg_efes.png');

    // Skinler
    this.load.image('player', 'sprites/player.png');
    this.load.image('player_red', 'sprites/player_red.png');
    this.load.image('player_gold', 'sprites/player_gold.png');
    this.load.image('player_green', 'sprites/player_green.png');
    this.load.image('player_purple', 'sprites/player_purple.png');

    // Engel ve toplanabilir
    this.load.image('ground', 'sprites/ground.png');
    this.load.image('obstacle_cat', 'sprites/obstacle_cat.png');
    this.load.image('obstacle_mirror', 'sprites/obstacle_mirror.png');
    this.load.image('obstacle_shoe', 'sprites/obstacle_shoe.png');
    this.load.image('collect_gold', 'sprites/collect_gold.png');
    this.load.image('collect_life', 'sprites/collect_life.png');
    this.load.image('collect_clover', 'sprites/collect_clover.png');
    this.load.image('powerup_magnet', 'sprites/powerup_magnet.png');
    this.load.image('powerup_shield', 'sprites/powerup_shield.png');
    this.load.image('powerup_double', 'sprites/powerup_double.png');

    // Efektler - Kanat, Tac, Iz
    this.load.image('wing_blue', 'sprites/wing_blue.png');
    this.load.image('wing_gold', 'sprites/wing_gold.png');
    this.load.image('wing_dark', 'sprites/wing_dark.png');
    this.load.image('crown_gold', 'sprites/crown_gold.png');
    this.load.image('crown_silver', 'sprites/crown_silver.png');
    this.load.image('trail_sparkle', 'sprites/trail_sparkle.png');
    this.load.image('trail_rainbow', 'sprites/trail_rainbow.png');
    this.load.image('trail_fire', 'sprites/trail_fire.png');

    // Sesler
    this.load.audio('sfx_collect', 'sfx/collect.ogg');
    this.load.audio('sfx_score', 'sfx/score.ogg');
    this.load.audio('sfx_click', 'sfx/click.wav');

    this.initStorage();
  }

  private initStorage() {
    const defaults: Record<string, any> = {
      [KEYS.UNLOCKED_SKINS]: ['player'],
      [KEYS.UNLOCKED_BGS]: ['bg'],
      [KEYS.UNLOCKED_WINGS]: ['none'],
      [KEYS.UNLOCKED_CROWNS]: ['none'],
      [KEYS.UNLOCKED_TRAILS]: ['none'],
      [KEYS.SKIN]: 'player',
      [KEYS.BG]: 'bg',
      [KEYS.WING]: 'none',
      [KEYS.CROWN]: 'none',
      [KEYS.TRAIL]: 'none',
      [KEYS.SOUND]: true,
    };
    for (const [key, val] of Object.entries(defaults)) {
      if (Storage.get(key) === null) Storage.set(key, val);
    }
  }

  create() {
    this.time.delayedCall(600, () => {
      this.scene.start('MenuScene');
    });
  }
}
