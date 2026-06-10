import Phaser from 'phaser';
import { Storage, KEYS, SKINS, BACKGROUNDS, WINGS, CROWNS, TRAILS } from '../utils/storage';

export default class ShopScene extends Phaser.Scene {
  private coins = 0;
  private soundOn = true;

  constructor() {
    super('ShopScene');
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.soundOn = Storage.get(KEYS.SOUND, true);

    this.add.rectangle(w / 2, h / 2, w, h, 0x0a1628);

    this.coins = Storage.getInt(KEYS.COINS, 0);

    // Baslik
    this.add.text(w / 2, 30, 'MAGaza', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '26px',
      color: '#ffaa00',
      stroke: '#331a00',
      strokeThickness: 5,
    }).setOrigin(0.5);

    // Koin gostergesi
    const coinIcon = this.add.image(w / 2 - 50, 62, 'collect_gold').setScale(0.4);
    this.add.text(w / 2 - 28, 62, `${this.coins}`, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '16px',
      color: '#ffcc00',
    }).setOrigin(0, 0.5);

    // === NAZAR BONCuGu ===
    this.add.text(30, 88, 'NAZAR', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0, 0.5);

    const skinStartX = 70;
    SKINS.forEach((skin, i) => {
      const isUnlocked = Storage.get(KEYS.UNLOCKED_SKINS, ['player']).includes(skin.key);
      const isSelected = Storage.get(KEYS.SKIN, 'player') === skin.key;
      const cx = skinStartX + i * 140;
      const cy = 125;

      this.drawItemCard(cx, cy, 120, 65, isSelected, isUnlocked);

      const img = this.add.image(cx, cy - 8, skin.key).setScale(0.45);
      if (!isUnlocked) img.setAlpha(0.4);

      this.add.text(cx, cy + 18, skin.name, {
        fontFamily: 'PixelFont, monospace', fontSize: '8px', color: isUnlocked ? '#fff' : '#888'
      }).setOrigin(0.5);

      this.drawActionButton(cx, cy + 32, skin.key, KEYS.SKIN, KEYS.UNLOCKED_SKINS, skin.price, isSelected, isUnlocked);
    });

    // === ARKA PLAN ===
    this.add.text(30, 170, 'ARKA PLAN', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0, 0.5);

    const bgStartX = 100;
    BACKGROUNDS.forEach((bg, i) => {
      const isUnlocked = Storage.get(KEYS.UNLOCKED_BGS, ['bg']).includes(bg.key);
      const isSelected = Storage.get(KEYS.BG, 'bg') === bg.key;
      const cx = bgStartX + i * 180;
      const cy = 210;

      this.drawItemCard(cx, cy, 150, 60, isSelected, isUnlocked);

      const img = this.add.image(cx, cy - 5, bg.key);
      img.setDisplaySize(130, 32);
      if (!isUnlocked) img.setAlpha(0.3);

      this.add.text(cx, cy + 20, bg.name, {
        fontFamily: 'PixelFont, monospace', fontSize: '8px', color: isUnlocked ? '#fff' : '#888'
      }).setOrigin(0.5);

      this.drawActionButton(cx, cy + 32, bg.key, KEYS.BG, KEYS.UNLOCKED_BGS, bg.price, isSelected, isUnlocked);
    });

    // === KANATLAR ===
    this.add.text(30, 260, 'KANATLAR', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0, 0.5);

    const wingStartX = 100;
    WINGS.forEach((wing, i) => {
      const isUnlocked = Storage.get(KEYS.UNLOCKED_WINGS, ['none']).includes(wing.key);
      const isSelected = Storage.get(KEYS.WING, 'none') === wing.key;
      const cx = wingStartX + i * 180;
      const cy = 300;

      this.drawItemCard(cx, cy, 150, 60, isSelected, isUnlocked);

      if (wing.key !== 'none') {
        const img = this.add.image(cx, cy - 5, wing.key).setScale(0.4);
        if (!isUnlocked) img.setAlpha(0.4);
      }

      this.add.text(cx, cy + 18, wing.name, {
        fontFamily: 'PixelFont, monospace', fontSize: '8px', color: isUnlocked ? '#fff' : '#888'
      }).setOrigin(0.5);

      this.drawActionButton(cx, cy + 32, wing.key, KEYS.WING, KEYS.UNLOCKED_WINGS, wing.price, isSelected, isUnlocked);
    });

    // === TACLAR ===
    this.add.text(30, 350, 'TACLAR', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0, 0.5);

    const crownStartX = 100;
    CROWNS.forEach((crown, i) => {
      const isUnlocked = Storage.get(KEYS.UNLOCKED_CROWNS, ['none']).includes(crown.key);
      const isSelected = Storage.get(KEYS.CROWN, 'none') === crown.key;
      const cx = crownStartX + i * 180;
      const cy = 390;

      this.drawItemCard(cx, cy, 150, 60, isSelected, isUnlocked);

      if (crown.key !== 'none') {
        const img = this.add.image(cx, cy - 5, crown.key).setScale(0.35);
        if (!isUnlocked) img.setAlpha(0.4);
      }

      this.add.text(cx, cy + 18, crown.name, {
        fontFamily: 'PixelFont, monospace', fontSize: '8px', color: isUnlocked ? '#fff' : '#888'
      }).setOrigin(0.5);

      this.drawActionButton(cx, cy + 32, crown.key, KEYS.CROWN, KEYS.UNLOCKED_CROWNS, crown.price, isSelected, isUnlocked);
    });

    // === IZLER (TRAIL) ===
    this.add.text(30, 440, 'IZLER', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '11px',
      color: '#00ccff',
    }).setOrigin(0, 0.5);

    const trailStartX = 100;
    TRAILS.forEach((trail, i) => {
      const isUnlocked = Storage.get(KEYS.UNLOCKED_TRAILS, ['none']).includes(trail.key);
      const isSelected = Storage.get(KEYS.TRAIL, 'none') === trail.key;
      const cx = trailStartX + i * 140;
      const cy = 480;

      this.drawItemCard(cx, cy, 120, 60, isSelected, isUnlocked);

      if (trail.key !== 'none') {
        const img = this.add.image(cx, cy - 5, trail.key).setScale(0.3);
        if (!isUnlocked) img.setAlpha(0.4);
      }

      this.add.text(cx, cy + 18, trail.name, {
        fontFamily: 'PixelFont, monospace', fontSize: '8px', color: isUnlocked ? '#fff' : '#888'
      }).setOrigin(0.5);

      this.drawActionButton(cx, cy + 32, trail.key, KEYS.TRAIL, KEYS.UNLOCKED_TRAILS, trail.price, isSelected, isUnlocked);
    });

    // Geri butonu
    const backBtn = this.add.rectangle(w / 2, h - 22, 160, 32, 0x333366).setInteractive();
    this.add.text(w / 2, h - 22, 'ANA MENU', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '12px',
      color: '#cccccc',
    }).setOrigin(0.5);
    backBtn.on('pointerover', () => backBtn.setFillStyle(0x444477));
    backBtn.on('pointerout', () => backBtn.setFillStyle(0x333366));
    backBtn.on('pointerdown', () => {
      this.playSfx('sfx_click');
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });

    this.cameras.main.fadeIn(300);
  }

  private drawItemCard(x: number, y: number, w: number, h: number, isSelected: boolean, isUnlocked: boolean) {
    const color = isSelected ? 0x004488 : (isUnlocked ? 0x1a3a5c : 0x333333);
    this.add.rectangle(x, y, w, h, color)
      .setStrokeStyle(isSelected ? 3 : 1, isSelected ? 0x00ccff : 0x555555);
  }

  private drawActionButton(
    x: number, y: number,
    itemKey: string, selectedKey: string, unlockedKey: string,
    price: number, isSelected: boolean, isUnlocked: boolean
  ) {
    if (isSelected) {
      this.add.text(x, y, 'SECILI', {
        fontFamily: 'PixelFont, monospace', fontSize: '7px', color: '#00ff88'
      }).setOrigin(0.5);
      return;
    }

    if (isUnlocked) {
      const btn = this.add.rectangle(x, y, 70, 16, 0x008844).setInteractive();
      this.add.text(x, y, 'KULLAN', {
        fontFamily: 'PixelFont', fontSize: '7px', color: '#ffffff'
      }).setOrigin(0.5);
      btn.on('pointerdown', () => {
        Storage.set(selectedKey, itemKey);
        this.playSfx('sfx_click');
        this.scene.restart();
      });
      return;
    }

    const canBuy = this.coins >= price;
    const btn = this.add.rectangle(x, y, 70, 16, canBuy ? 0xffaa00 : 0x664400).setInteractive();
    this.add.text(x, y, `${price} K`, {
      fontFamily: 'PixelFont, monospace', fontSize: '7px', color: canBuy ? '#331a00' : '#888888'
    }).setOrigin(0.5);
    btn.on('pointerdown', () => {
      if (canBuy) {
        this.coins -= price;
        Storage.set(KEYS.COINS, this.coins);
        const unlocked = Storage.get(unlockedKey, []);
        unlocked.push(itemKey);
        Storage.set(unlockedKey, unlocked);
        Storage.set(selectedKey, itemKey);
        this.playSfx('sfx_score');
        this.scene.restart();
      }
    });
  }

  private playSfx(key: string) {
    if (this.soundOn) this.sound.play(key, { volume: 0.4 });
  }
}
