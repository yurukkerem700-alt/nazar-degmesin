import Phaser from 'phaser';
import { Storage, KEYS } from '../utils/storage';

interface ObstacleData {
  sprite: Phaser.Physics.Arcade.Sprite;
  passed: boolean;
  hasHit: boolean;
}

interface PowerUpState {
  magnet: boolean;
  shield: boolean;
  double: boolean;
  magnetTimer: number;
  shieldTimer: number;
  doubleTimer: number;
}

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.GameObjects.TileSprite;
  private bg!: Phaser.GameObjects.TileSprite;
  private obstacles: ObstacleData[] = [];
  private collectibles: Phaser.Physics.Arcade.Sprite[] = [];
  private powerups: Phaser.Physics.Arcade.Sprite[] = [];
  private score = 0;
  private coins = 0;
  private lives = 5;
  private maxLives = 5;
  private scoreText!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private powerupText!: Phaser.GameObjects.Text;
  private gameSpeed = 200;
  private spawnTimer = 0;
  private spawnInterval = 2200;
  private isGameOver = false;
  private invincible = false;
  private powerUpState: PowerUpState;
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private shieldEffect!: Phaser.GameObjects.Image;
  private magnetEffect!: Phaser.GameObjects.Image;
  private soundOn = true;
  private skinKey = 'player';
  private bgKey = 'bg';
  private totalCoinsEarned = 0;
  private heartIcons: Phaser.GameObjects.Image[] = [];
  // Efekt referanslari
  private wingSprite!: Phaser.GameObjects.Image | null;
  private crownSprite!: Phaser.GameObjects.Image | null;
  private trailEmitter!: Phaser.GameObjects.Particles.ParticleEmitter | null;

  constructor() {
    super('GameScene');
    this.powerUpState = {
      magnet: false,
      shield: false,
      double: false,
      magnetTimer: 0,
      shieldTimer: 0,
      doubleTimer: 0,
    };
    this.wingSprite = null;
    this.crownSprite = null;
    this.trailEmitter = null;
  }

  create() {
    this.resetState();
    const w = this.scale.width;
    const h = this.scale.height;
    this.soundOn = Storage.get(KEYS.SOUND, true);
    this.skinKey = Storage.get(KEYS.SKIN, 'player');
    this.bgKey = Storage.get(KEYS.BG, 'bg');

    this.physics.world.setBounds(0, 0, w, h);

    // Arka plan
    this.bg = this.add.tileSprite(w / 2, h / 2, w, h, this.bgKey);

    // Parcacik sistemi
    this.particles = this.add.particles(0, 0, 'collect_gold', {
      speed: { min: 60, max: 180 },
      scale: { start: 0.4, end: 0 },
      lifespan: 700,
      quantity: 1,
      emitting: false,
      tint: [0xffcc00, 0xffaa00, 0xffffff],
    });

    // Oyuncu - AGIR (daha fazla gravity, daha az ziplama)
    this.player = this.physics.add.sprite(w * 0.2, h / 2, this.skinKey);
    this.player.setScale(0.7);
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.setGravityY(950);          // AGIR - daha cok gravity
    this.player.setCircle(32, 32, 32);

    // Ziplama animasyonu
    this.tweens.add({
      targets: this.player,
      scaleX: 0.78,
      scaleY: 0.62,
      duration: 100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Efektleri uygula
    this.applyCosmetics();

    // Kalkan efekti
    this.shieldEffect = this.add.image(0, 0, 'powerup_shield').setScale(0.9).setAlpha(0).setDepth(10);
    this.magnetEffect = this.add.image(0, 0, 'powerup_magnet').setScale(0.5).setAlpha(0).setDepth(10);

    // Yer
    this.ground = this.add.tileSprite(w / 2, h - 30, w, 60, 'ground');
    const groundBody = this.physics.add.staticBody(w / 2 - w / 2, h - 60, w, 60);
    this.physics.add.collider(this.player, groundBody, () => {
      if (!this.isGameOver) {
        this.player.setVelocityY(-350);
        this.takeDamage();
      }
    });

    // Tavan
    const ceilingBody = this.physics.add.staticBody(0, -5, w, 15);
    this.physics.add.collider(this.player, ceilingBody, () => {
      this.player.setVelocityY(60);
    });

    // HUD
    this.scoreText = this.add.text(20, 15, 'SKOR: 0', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    });

    const coinIcon = this.add.image(w - 120, 23, 'collect_gold').setScale(0.4);
    this.coinText = this.add.text(w - 100, 15, '0', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '16px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 4,
    });

    this.powerupText = this.add.text(w / 2, 50, '', {
      fontFamily: 'PixelFont, monospace',
      fontSize: '14px',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5);

    this.updateHearts();

    // Input
    this.input.on('pointerdown', () => this.jump());
    this.input.keyboard?.on('keydown-SPACE', () => this.jump());
    this.input.keyboard?.on('keydown-UP', () => this.jump());
    this.input.keyboard?.on('keydown-W', () => this.jump());

    this.cameras.main.fadeIn(300);
  }

  private applyCosmetics() {
    const wingKey = Storage.get(KEYS.WING, 'none');
    const crownKey = Storage.get(KEYS.CROWN, 'none');
    const trailKey = Storage.get(KEYS.TRAIL, 'none');

    // Kanat
    if (wingKey !== 'none') {
      this.wingSprite = this.add.image(this.player.x - 25, this.player.y, wingKey)
        .setScale(0.5)
        .setDepth(5);
    }

    // Tac
    if (crownKey !== 'none') {
      this.crownSprite = this.add.image(this.player.x, this.player.y - 35, crownKey)
        .setScale(0.35)
        .setDepth(11);
    }

    // Iz (trail)
    if (trailKey !== 'none') {
      this.trailEmitter = this.add.particles(0, 0, trailKey, {
        speed: { min: 20, max: 60 },
        scale: { start: 0.25, end: 0 },
        lifespan: 500,
        frequency: 80,
        quantity: 1,
        follow: this.player,
        followOffset: { x: -30, y: 0 },
        emitting: true,
      });
    }
  }

  private updateCosmetics() {
    if (this.wingSprite) {
      this.wingSprite.setPosition(this.player.x - 22, this.player.y);
      // Kanat hafif hareket
      this.wingSprite.setAngle(Math.sin(this.time.now / 150) * 5);
    }
    if (this.crownSprite) {
      this.crownSprite.setPosition(this.player.x, this.player.y - 34);
    }
  }

  private resetState() {
    this.isGameOver = false;
    this.score = 0;
    this.coins = 0;
    this.lives = 5;
    this.gameSpeed = 200;
    this.spawnInterval = 2200;
    this.spawnTimer = 0;
    this.obstacles = [];
    this.collectibles = [];
    this.powerups = [];
    this.heartIcons = [];
    this.invincible = false;
    this.totalCoinsEarned = 0;
    this.wingSprite = null;
    this.crownSprite = null;
    this.trailEmitter = null;
    this.powerUpState = {
      magnet: false,
      shield: false,
      double: false,
      magnetTimer: 0,
      shieldTimer: 0,
      doubleTimer: 0,
    };
  }

  update(time: number, delta: number) {
    if (this.isGameOver) return;
    const dt = delta;

    // Efekt pozisyonlarini guncelle
    this.updateCosmetics();

    // Arka plan ve yer kaydirma
    this.bg.tilePositionX += this.gameSpeed * 0.08 * (dt / 1000);
    this.ground.tilePositionX += this.gameSpeed * (dt / 1000);

    // Efekt pozisyonlari
    this.shieldEffect.setPosition(this.player.x, this.player.y);
    this.magnetEffect.setPosition(this.player.x, this.player.y);

    // Guclendirme sureleri
    this.updatePowerUps(dt);

    // Miknatis etkisi
    if (this.powerUpState.magnet) {
      this.collectibles.forEach(col => {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, col.x, col.y);
        if (dist < 220) {
          const angle = Phaser.Math.Angle.Between(col.x, col.y, this.player.x, this.player.y);
          col.x += Math.cos(angle) * 450 * (dt / 1000);
          col.y += Math.sin(angle) * 450 * (dt / 1000);
        }
      });
    }

    // Engel spawn
    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnObstacleSet();
    }

    // Engel hareketi ve carpisma
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.sprite.x -= this.gameSpeed * (dt / 1000);

      if (!obs.hasHit && this.checkCollision(this.player, obs.sprite)) {
        obs.hasHit = true;
        this.hitObstacle(obs);
      }

      if (!obs.passed && obs.sprite.x + obs.sprite.width / 2 < this.player.x - this.player.width / 2) {
        obs.passed = true;
        this.addScore(1);
      }

      if (obs.sprite.x < -150) {
        obs.sprite.destroy();
        this.obstacles.splice(i, 1);
      }
    }

    // Toplanabilir hareketi
    for (let i = this.collectibles.length - 1; i >= 0; i--) {
      const col = this.collectibles[i];
      col.x -= this.gameSpeed * (dt / 1000);

      if (this.checkCollision(this.player, col)) {
        this.collectItem(col);
        this.collectibles.splice(i, 1);
        col.destroy();
        continue;
      }

      if (col.x < -60) {
        col.destroy();
        this.collectibles.splice(i, 1);
      }
    }

    // Guclendirme hareketi
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pup = this.powerups[i];
      pup.x -= this.gameSpeed * (dt / 1000);

      if (this.checkCollision(this.player, pup)) {
        this.activatePowerUp(pup.texture.key as string);
        this.powerups.splice(i, 1);
        pup.destroy();
        continue;
      }

      if (pup.x < -60) {
        pup.destroy();
        this.powerups.splice(i, 1);
      }
    }

    // Zorluk artisi
    this.gameSpeed = Math.min(400, 200 + this.score * 3.5);
    this.spawnInterval = Math.max(1000, 2200 - this.score * 30);
  }

  private checkCollision(a: Phaser.Physics.Arcade.Sprite, b: Phaser.Physics.Arcade.Sprite | Phaser.GameObjects.Image): boolean {
    const boundsA = a.getBounds();
    const boundsB = b.getBounds();
    return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
  }

  private jump() {
    if (this.isGameOver) return;
    this.player.setVelocityY(-400);   // AGIR - daha dusuk ziplama
    this.player.setAngle(-12);
    this.tweens.add({
      targets: this.player,
      angle: 0,
      duration: 350,
      ease: 'Sine.easeOut',
    });
  }

  private spawnObstacleSet() {
    const w = this.scale.width;
    const h = this.scale.height;
    // GENIS BOŞLUK - engeller arasi mesafe acildi
    const gapSize = 260;
    const gapY = Phaser.Math.Between(140, h - 140);

    const topType = ['obstacle_cat', 'obstacle_mirror', 'obstacle_shoe'][Phaser.Math.Between(0, 2)];
    const topObs = this.physics.add.sprite(w + 60, gapY - gapSize / 2 - 50, topType);
    topObs.setScale(0.7);
    topObs.setFlipY(true);
    (topObs.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    topObs.setImmovable(true);
    this.obstacles.push({ sprite: topObs, passed: false, hasHit: false });

    const botType = ['obstacle_cat', 'obstacle_mirror', 'obstacle_shoe'][Phaser.Math.Between(0, 2)];
    const botObs = this.physics.add.sprite(w + 60, gapY + gapSize / 2 + 50, botType);
    botObs.setScale(0.7);
    (botObs.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    botObs.setImmovable(true);
    this.obstacles.push({ sprite: botObs, passed: false, hasHit: false });

    if (Phaser.Math.Between(0, 100) < 65) {
      const types = ['collect_gold', 'collect_clover', 'collect_life'];
      const weights = [55, 30, 15];
      const type = this.weightedRandom(types, weights);
      const col = this.physics.add.sprite(w + 60, gapY + Phaser.Math.Between(-30, 30), type);
      col.setScale(0.55);
      (col.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.collectibles.push(col);

      this.tweens.add({
        targets: col,
        y: col.y + 12,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    if (Phaser.Math.Between(0, 100) < 18) {
      const pupTypes = ['powerup_magnet', 'powerup_shield', 'powerup_double'];
      const pupType = pupTypes[Phaser.Math.Between(0, 2)];
      const pup = this.physics.add.sprite(w + 60, gapY + Phaser.Math.Between(-40, 40), pupType);
      pup.setScale(0.6);
      (pup.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.powerups.push(pup);

      this.tweens.add({
        targets: pup,
        scale: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private weightedRandom(items: string[], weights: number[]): string {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Phaser.Math.Between(1, total);
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) return items[i];
    }
    return items[0];
  }

  private hitObstacle(obs: ObstacleData) {
    if (this.invincible || this.isGameOver) return;

    if (this.powerUpState.shield) {
      this.playSfx('sfx_score');
      obs.sprite.setAlpha(0.3);
      this.tweens.add({
        targets: obs.sprite,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          const idx = this.obstacles.findIndex(o => o.sprite === obs.sprite);
          if (idx >= 0) {
            this.obstacles[idx].sprite.destroy();
            this.obstacles.splice(idx, 1);
          }
        },
      });
      return;
    }

    this.takeDamage();

    obs.sprite.setAlpha(0.3);
    this.tweens.add({
      targets: obs.sprite,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        const idx = this.obstacles.findIndex(o => o.sprite === obs.sprite);
        if (idx >= 0) {
          this.obstacles[idx].sprite.destroy();
          this.obstacles.splice(idx, 1);
        }
      },
    });
  }

  private takeDamage() {
    if (this.invincible || this.isGameOver) return;

    this.lives--;
    this.updateHearts();

    this.invincible = true;
    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 6,
      onComplete: () => {
        this.player.setAlpha(1);
        this.invincible = false;
      },
    });

    // Efektler de yanıp sönsün
    if (this.wingSprite) {
      this.tweens.add({ targets: this.wingSprite, alpha: 0.3, duration: 120, yoyo: true, repeat: 6 });
    }
    if (this.crownSprite) {
      this.tweens.add({ targets: this.crownSprite, alpha: 0.3, duration: 120, yoyo: true, repeat: 6 });
    }

    this.cameras.main.shake(250, 0.015);

    if (this.lives <= 0) {
      this.gameOver();
    }
  }

  private collectItem(item: Phaser.Physics.Arcade.Sprite) {
    if (this.isGameOver) return;

    const type = item.texture.key;
    this.particles.emitParticleAt(item.x, item.y, 10);

    let coinGain = 0;
    if (type === 'collect_gold') {
      coinGain = this.powerUpState.double ? 2 : 1;
      this.playSfx('sfx_collect');
    } else if (type === 'collect_clover') {
      coinGain = this.powerUpState.double ? 2 : 1;
      this.playSfx('sfx_collect');
    } else if (type === 'collect_life') {
      this.lives = Math.min(this.maxLives, this.lives + 1);
      this.updateHearts();
      this.playSfx('sfx_score');
    }

    if (coinGain > 0) {
      this.coins += coinGain;
      this.totalCoinsEarned += coinGain;
      this.coinText.setText(`${this.coins}`);

      const floatText = this.add.text(item.x, item.y, `+${coinGain}`, {
        fontFamily: 'PixelFont, monospace',
        fontSize: '16px',
        color: '#ffcc00',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: floatText,
        y: item.y - 40,
        alpha: 0,
        duration: 600,
        onComplete: () => floatText.destroy(),
      });
    }
  }

  private activatePowerUp(type: string) {
    this.particles.emitParticleAt(this.player.x, this.player.y, 15);
    this.playSfx('sfx_score');

    if (type === 'powerup_magnet') {
      this.powerUpState.magnet = true;
      this.powerUpState.magnetTimer = 5000;
      this.magnetEffect.setAlpha(0.6);
      this.showPowerUpText('MIKNATIS!');
    } else if (type === 'powerup_shield') {
      this.powerUpState.shield = true;
      this.powerUpState.shieldTimer = 5000;
      this.shieldEffect.setAlpha(0.7);
      this.showPowerUpText('KALKAN!');
    } else if (type === 'powerup_double') {
      this.powerUpState.double = true;
      this.powerUpState.doubleTimer = 5000;
      this.showPowerUpText('CIft KOiN!');
    }
  }

  private updatePowerUps(dt: number) {
    if (this.powerUpState.magnet) {
      this.powerUpState.magnetTimer -= dt;
      if (this.powerUpState.magnetTimer <= 0) {
        this.powerUpState.magnet = false;
        this.magnetEffect.setAlpha(0);
      }
    }
    if (this.powerUpState.shield) {
      this.powerUpState.shieldTimer -= dt;
      this.shieldEffect.setAlpha(0.5 + Math.sin(this.time.now / 200) * 0.2);
      if (this.powerUpState.shieldTimer <= 0) {
        this.powerUpState.shield = false;
        this.shieldEffect.setAlpha(0);
      }
    }
    if (this.powerUpState.double) {
      this.powerUpState.doubleTimer -= dt;
      if (this.powerUpState.doubleTimer <= 0) {
        this.powerUpState.double = false;
      }
    }

    const active: string[] = [];
    if (this.powerUpState.magnet) active.push(`M:${Math.ceil(this.powerUpState.magnetTimer / 1000)}s`);
    if (this.powerUpState.shield) active.push(`K:${Math.ceil(this.powerUpState.shieldTimer / 1000)}s`);
    if (this.powerUpState.double) active.push(`2x:${Math.ceil(this.powerUpState.doubleTimer / 1000)}s`);
    this.powerupText.setText(active.join('  '));
  }

  private showPowerUpText(text: string) {
    const txt = this.add.text(this.player.x, this.player.y - 40, text, {
      fontFamily: 'PixelFont, monospace',
      fontSize: '14px',
      color: '#00ff88',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScale(0);
    this.tweens.add({
      targets: txt,
      scale: 1.2,
      y: this.player.y - 70,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: txt,
          alpha: 0,
          y: txt.y - 20,
          duration: 400,
          onComplete: () => txt.destroy(),
        });
      },
    });
  }

  private addScore(points: number) {
    this.score += points;
    this.scoreText.setText(`SKOR: ${this.score}`);
  }

  private updateHearts() {
    this.heartIcons.forEach(h => h.destroy());
    this.heartIcons = [];

    const startX = this.scale.width - 20;
    const startY = 50;
    for (let i = 0; i < this.maxLives; i++) {
      const heart = this.add.image(startX - i * 26, startY, 'collect_life').setScale(0.32);
      if (i >= this.lives) {
        heart.setAlpha(0.15);
        heart.setTint(0x333333);
      }
      this.heartIcons.push(heart);
    }
  }

  private gameOver() {
    this.isGameOver = true;
    this.player.setVelocity(0, 0);

    // Trail'i durdur
    if (this.trailEmitter) {
      this.trailEmitter.stop();
    }

    const highScore = Storage.getInt(KEYS.HIGH_SCORE, 0);
    if (this.score > highScore) {
      Storage.set(KEYS.HIGH_SCORE, this.score);
    }

    const currentCoins = Storage.getInt(KEYS.COINS, 0);
    Storage.set(KEYS.COINS, currentCoins + this.totalCoinsEarned);
    const totalCoins = Storage.getInt(KEYS.TOTAL_COINS, 0);
    Storage.set(KEYS.TOTAL_COINS, totalCoins + this.totalCoinsEarned);

    const gamesPlayed = Storage.getInt(KEYS.GAMES_PLAYED, 0);
    Storage.set(KEYS.GAMES_PLAYED, gamesPlayed + 1);

    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene', {
          score: this.score,
          highScore: Math.max(highScore, this.score),
          coins: this.totalCoinsEarned,
          totalCoins: currentCoins + this.totalCoinsEarned,
        });
      });
    });
  }

  private playSfx(key: string) {
    if (this.soundOn) this.sound.play(key, { volume: 0.4 });
  }
}
