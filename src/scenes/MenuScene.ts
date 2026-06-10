import Phaser from 'phaser';
import { Storage, KEYS } from '../utils/storage';

export default class MenuScene extends Phaser.Scene {
  private coins = 0;
  private highScore = 0;
  private soundOn = true;

  constructor() {
    super('MenuScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bgKey = Storage.get(KEYS.BG, 'bg');
    this.soundOn = Storage.get(KEYS.SOUND, true);
    this.sound.mute = !this.soundOn;

    // Arka plan
    const bg = this.add.image(w / 2, h / 2, bgKey);
    bg.setDisplaySize(w, h);
    this.add.rectangle(w / 2, h / 2, w, h, 0x000033, 0.35);

    // Yüzen nazar boncuğu
    const skinKey = Storage.get(KEYS.SKIN, 'player');
    const player = this.add.image(w / 2, h / 2 - 130, skinKey);
    player.setScale(1.4);
    this.tweens.add({
      targets: player,
      y: h / 2 - 110,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Başlık
    this.add.text(w / 2, h / 2 - 50, 'NAZAR', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '52px',
      color: '#00ccff',
      stroke: '#003366',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(w / 2, h / 2 + 15, 'DEGMESIN', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '52px',
      color: '#ffffff',
      stroke: '#003366',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Alt başlık
    this.add.text(w / 2, h / 2 + 70, 'Ugursuzluklardan kac, koin topla!', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '13px',
      color: '#cccccc',
    }).setOrigin(0.5);

    // Koin ve skor bilgisi
    this.coins = Storage.getInt(KEYS.COINS, 0);
    this.highScore = Storage.getInt(KEYS.HIGH_SCORE, 0);

    const coinIcon = this.add.image(w / 2 - 80, h / 2 + 105, 'collect_gold').setScale(0.5);
    this.add.text(w / 2 - 55, h / 2 + 105, `${this.coins}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '16px',
      color: '#ffcc00',
    }).setOrigin(0, 0.5);

    this.add.text(w / 2 + 20, h / 2 + 105, `EN YUKSEK: ${this.highScore}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '14px',
      color: '#ffcc00',
    }).setOrigin(0, 0.5);

    // BAŞLA butonu
    this.createButton(w / 2, h / 2 + 160, 240, 55, 0x00ccff, 'BASLA', '#000033', 24, () => {
      this.scene.start('GameScene');
    });

    // MAĞAZA butonu
    this.createButton(w / 2, h / 2 + 225, 240, 45, 0xffaa00, 'MAGaza', '#331a00', 18, () => {
      this.scene.start('ShopScene');
    });

    // Ses butonu
    const soundBtn = this.add.text(w - 20, 20, this.soundOn ? '🔊' : '🔇', {
      fontSize: '28px',
    }).setOrigin(1, 0).setInteractive();
    soundBtn.on('pointerdown', () => {
      this.soundOn = !this.soundOn;
      Storage.set(KEYS.SOUND, this.soundOn);
      this.sound.mute = !this.soundOn;
      soundBtn.setText(this.soundOn ? '🔊' : '🔇');
      this.playSfx('sfx_click');
    });

    // Nasıl oynanır
    this.add.text(w / 2, h - 55, 'TIKLA / SPACE / DOKUN ile zipla', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#888888',
    }).setOrigin(0.5);

    this.add.text(w / 2, h - 30, 'Engellerden kac, koin ve gucleme topla!', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '10px',
      color: '#666666',
    }).setOrigin(0.5);

    // Yıldız parçacıkları
    this.createStars();

    this.cameras.main.fadeIn(300);
  }

  private createButton(x: number, y: number, w: number, h: number, color: number, text: string, textColor: string, fontSize: number, callback: () => void) {
    const btn = this.add.rectangle(x, y, w, h, color).setInteractive();
    const txt = this.add.text(x, y, text, {
      fontFamily: 'PixelFont, monospace',
      fontSize: `${fontSize}px`,
      color: textColor,
    }).setOrigin(0.5);

    btn.on('pointerover', () => {
      btn.setFillStyle(Phaser.Display.Color.GetColor(
        Math.min(255, ((color >> 16) & 0xFF) + 40),
        Math.min(255, ((color >> 8) & 0xFF) + 40),
        Math.min(255, (color & 0xFF) + 40)
      ));
      btn.setScale(1.05);
      txt.setScale(1.05);
    });
    btn.on('pointerout', () => {
      btn.setFillStyle(color);
      btn.setScale(1);
      txt.setScale(1);
    });
    btn.on('pointerdown', () => {
      this.playSfx('sfx_click');
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', callback);
    });
  }

  private createStars() {
    for (let i = 0; i < 25; i++) {
      const x = Phaser.Math.Between(0, this.scale.width);
      const y = Phaser.Math.Between(0, this.scale.height);
      const star = this.add.circle(x, y, Phaser.Math.Between(1, 3), 0xffffff, Phaser.Math.FloatBetween(0.3, 0.8));
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private playSfx(key: string) {
    if (this.soundOn) this.sound.play(key, { volume: 0.4 });
  }
}
