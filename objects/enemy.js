import Entity from './object.js';
import { CONFIG } from '../GAME/config.js';

function checkRectangleCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

export default class Enemy extends Entity {
  constructor(x, y, width, height, color, speed, health) {
    super(x, y, width, height, color);
    this.speed = speed;
    this.health = health;
    this.lastCollisionDamageTime = 0;
    this.direction = 'left';
    this.frameIndex = 0;
    this.frameRate = 200;
    this.lastFrameChange = 0;
    this.bullets = [];
  }

  update(player, dt, walls, enemies, images, audioManager) {
    this.direction = (player.x + player.width / 2) < (this.x + this.width / 2) ? 'left' : 'right';
    const angle = Math.atan2(player.y - this.y, player.x - this.x);
    const velocityX = Math.cos(angle) * this.speed * dt;
    const velocityY = Math.sin(angle) * this.speed * dt;
    let newX = this.x + velocityX;
    let newY = this.y + velocityY;

    const newEnemyRectX = { x: newX, y: this.y, width: this.width, height: this.height };
    const newEnemyRectY = { x: this.x, y: newY, width: this.width, height: this.height };
    let collisionWithWallX = false;
    let collisionWithWallY = false;

    for (const wall of walls) {
      if (checkRectangleCollision(newEnemyRectX, wall)) {
        collisionWithWallX = true;
        if (wall.isDestructible) {
          this.handleDestructibleWallCollision(wall, 'x', audioManager);
        }
        break;
      }
    }

    for (const wall of walls) {
      if (checkRectangleCollision(newEnemyRectY, wall)) {
        collisionWithWallY = true;
        if (wall.isDestructible) {
          this.handleDestructibleWallCollision(wall, 'y', audioManager);
        }
        break;
      }
    }

    if (!collisionWithWallX) {
      this.x = newX;
    }

    if (!collisionWithWallY) {
      this.y = newY;
    }

    let collisionWithEnemy = false;
    for (const enemy of enemies) {
      if (enemy === this) continue;
      if (checkRectangleCollision(this, enemy)) {
        collisionWithEnemy = true;
        break;
      }
    }

    if (collisionWithEnemy) {
      if (collisionWithWallX) {
        this.x -= velocityX;
      }
      if (collisionWithWallY) {
        this.y -= velocityY;
      }
    }

    this.x = Math.max(0, Math.min(CONFIG.VIRTUAL_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.VIRTUAL_HEIGHT - this.height, this.y));

    const now = performance.now();
    if (now - this.lastFrameChange >= this.frameRate) {
      this.frameIndex = (this.frameIndex + 1) % CONFIG.ENEMY_SPRITESHEET.framesPerRow;
      this.lastFrameChange = now;
    }

    if (this.health <= 0 && !this.remove) {
      audioManager.playSound('enemyDeath');
      this.remove = true;
    }
  }

  handleDestructibleWallCollision(wall, axis, audioManager) {
    const penetrationDepth = 5;
    if (axis === 'x') {
      if (this.x < wall.x) {
        this.x = wall.x - this.width - penetrationDepth;
      } else {
        this.x = wall.x + wall.width + penetrationDepth;
      }
    } else if (axis === 'y') {
      if (this.y < wall.y) {
        this.y = wall.y - this.height - penetrationDepth;
      } else {
        this.y = wall.y + wall.height + penetrationDepth;
      }
    }

    const currentTime = performance.now();
    if (!this.lastCollisionDamageTime || (currentTime - this.lastCollisionDamageTime >= CONFIG.COLLISION_DAMAGE_INTERVAL)) {
      wall.takeDamage(1, audioManager);
      this.lastCollisionDamageTime = currentTime;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health < 0) this.health = 0;
  }

  draw(ctx, images) {
    if (images['enemy']) {
      const row = this.direction === 'left' ? 0 : 1;
      const col = this.frameIndex;
      const srcX = col * CONFIG.ENEMY_SPRITESHEET.frameWidth;
      const srcY = row * CONFIG.ENEMY_SPRITESHEET.frameHeight;
      ctx.drawImage(images['enemy'], srcX, srcY, CONFIG.ENEMY_SPRITESHEET.frameWidth, CONFIG.ENEMY_SPRITESHEET.frameHeight, this.x, this.y, this.width, this.height);
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
