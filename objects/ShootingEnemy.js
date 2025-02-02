import Enemy from './enemy.js';
import Bullet from './bullet.js';
import { CONFIG } from '../GAME/config.js';

export default class ShootingEnemy extends Enemy {
  constructor(x, y, width, height, color, speed, health, fireRate, audioManager) {
    super(x, y, width, height, color, speed, health);
    this.bullets = [];
    this.fireRate = fireRate;
    this.lastShotTime = 0;
    this.frameIndex = 0;
    this.audioManager = audioManager;
    this.frameRate = 200;
    this.lastFrameChange = 0;
  }

  calculateBulletDirection(player) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const angle = Math.atan2(player.y + player.height / 2 - centerY, player.x + player.width / 2 - centerX);
    return { dx: Math.cos(angle), dy: Math.sin(angle) };
  }

  createBullet(centerX, centerY, dx, dy) {
    this.bullets.push(
      new Bullet(
        centerX - CONFIG.SHOOTING_ENEMY_BULLET.width / 2,
        centerY - CONFIG.SHOOTING_ENEMY_BULLET.height / 2,
        CONFIG.SHOOTING_ENEMY_BULLET.width,
        CONFIG.SHOOTING_ENEMY_BULLET.height,
        CONFIG.SHOOTING_ENEMY_BULLET.color,
        dx,
        dy,
        CONFIG.SHOOTING_ENEMY_BULLET.speed,
        CONFIG.SHOOTING_ENEMY_BULLET.damage
      )
    );
  }

  shoot(timestamp, player, audioManager) {
    if (timestamp - this.lastShotTime >= this.fireRate) {
      const { dx, dy } = this.calculateBulletDirection(player);
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      this.createBullet(centerX, centerY, dx, dy);
      this.lastShotTime = timestamp;
      audioManager.playSound('shootingEnemyShoot');
    }
  }

  update(player, dt, timestamp, canvas, walls, shootingEnemies, images, audioManager) {
    super.update(player, dt, walls, shootingEnemies, images, audioManager);
    this.shoot(timestamp, player, audioManager);
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(canvas, dt, walls);
      if (bullet.remove) this.bullets.splice(i, 1);
    }
    const now = performance.now();
    if (now - this.lastFrameChange >= this.frameRate) {
      this.frameIndex = (this.frameIndex + 1) % CONFIG.SHOOTING_ENEMY_SPRITESHEET.framesPerRow;
      this.lastFrameChange = now;
    }
    if (this.health <= 0 && !this.remove) {
      audioManager.playSound('shootingEnemyDeath');
      this.remove = true;
    }
  }

  draw(ctx, images) {
    if (images['shootingenemy']) {
      const row = this.direction === 'left' ? 0 : 1;
      const col = this.frameIndex;
      const srcX = col * CONFIG.SHOOTING_ENEMY_SPRITESHEET.frameWidth;
      const srcY = row * CONFIG.SHOOTING_ENEMY_SPRITESHEET.frameHeight;
      ctx.drawImage(images['shootingenemy'], srcX, srcY, CONFIG.SHOOTING_ENEMY_SPRITESHEET.frameWidth, CONFIG.SHOOTING_ENEMY_SPRITESHEET.frameHeight, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.bullets.forEach(bullet => {
      if (!bullet.active) return;
      ctx.fillStyle = bullet.color;
      ctx.beginPath();
      ctx.arc(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, bullet.width / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
