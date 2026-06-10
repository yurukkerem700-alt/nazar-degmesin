import Phaser from 'phaser';
import { Storage, KEYS } from '../utils/storage';

export default class GameOverScene extends Phaser.Scene {
  private score = 0;
  private highScore = 0;
  private coins = 0;
  private totalCoins = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number; highScore: number; coins: number; totalCoins: number }) {
    this.score = data.score || 0;
    this.highScore = data.highScore || 0;
    this.coins = data.coins || 0;
    this.totalCoins = data.totalCoins || 0;
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    const bgKey = Storage.get(KEYS.BG, 'bg');
    const soundOn = Storage.get(KEYS.SOUND, true);

    // Arka plan
    const bg = this.add.image(w / 2, h / 2, bgKey);
    bg.setDisplaySize(w, h);
    this.add.rectangle(w / 2, h / 2, w, h, 0x000022, 0.75);

    // Game Over
    this.add.text(w / 2, h / 2 - 150, 'OYUN BITTI', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '42px',
      color: '#ff4444',
      stroke: '#330000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Üzgün nazar boncuğu
    const skinKey = Storage.get(KEYS.SKIN, 'player');
    const player = this.add.image(w / 2, h / 2 - 70, skinKey);
    player.setScale(1);
    player.setAlpha(0.7);
    this.tweens.add({
      targets: player,
      angle: -8,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Skor
    this.add.text(w / 2, h / 2 + 5, `SKORUN: ${this.score}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '22px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // En yüksek
    this.add.text(w / 2, h / 2 + 40, `EN YUKSEK: ${this.highScore}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '16px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    // Kazanılan koin
    const coinIcon = this.add.image(w / 2 - 50, h / 2 + 75, 'collect_gold').setScale(0.45);
    this.add.text(w / 2 - 25, h / 2 + 75, `+${this.coins}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '18px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0, 0.5);

    this.add.text(w / 2 + 50, h / 2 + 75, `Toplam: ${this.totalCoins}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '12px',
      color: '#aaaaaa',
    }).setOrigin(0, 0.5);

    // Yeni rekor
    if (this.score >= this.highScore && this.score > 0) {
      this.add.text(w / 2, h / 2 + 105, 'YENi REKOR!', {
        fontFamily: 'PixelFont, monospace',
        fontSize: '14px',
        color: '#00ff88',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
    }

    // Tekrar oyna
    this.createButton(w / 2, h / 2 + 155, 260, 50, 0x00ccff, 'TEKRAR OYNA', '#000033', 18, () => {
      if (soundOn) this.sound.play('sfx_click', { volume: 0.4 });
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameScene');
      });
    });

    // Ana menü
    this.createButton(w / 2, h / 2 + 215, 260, 40, 0x333366, 'ANA MENU', '#cccccc', 14, () => {
      if (soundOn) this.sound.play('sfx_click', { volume: 0.4 });
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    // Mağaza
    this.createButton(w / 2, h / 2 + 265, 200, 35, 0xffaa00, 'MAGaza', '#331a00', 12, () => {
      if (soundOn) this.sound.play('sfx_click', { volume: 0.4 });
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('ShopScene');
      });
    });

    // Mesaj
    const messages = [
      'Arkadaslarina meydan oku!',
      'Skorunu paylas, yaris!',
      'Bir kez daha dene!',
      'Nazar degdi...',
      'Sansini bir daha dene!',
    ];
    this.add.text(w / 2, h - 30, messages[Phaser.Math.Between(0, messages.length - 1)], {
      fontFamily: 'PixelFont, monospace',
      fontSize: '10px',
      color: '#888888',
    }).setOrigin(0.5);

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
    });
    btn.on('pointerout', () => btn.setFillStyle(color));
    btn.on('pointerdown', callback);
  }
}
