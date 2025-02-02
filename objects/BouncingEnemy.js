import Enemy from './enemy.js';
import Bullet from './bullet.js';
import { CONFIG } from '../GAME/config.js';

export default class BouncingEnemy extends Enemy {
  constructor(x, y, width, height, color, speed, health, fireRate) {
    // Initialize basic enemy properties via the parent class.
    super(x, y, width, height, color, speed, health);

    // Set a random movement direction.
    const angle = Math.random() * 2 * Math.PI;
    this.dx = Math.cos(angle);
    this.dy = Math.sin(angle);

    // Set shooting properties.
    this.fireRate = fireRate;
    this.lastShotTime = 0;
    this.bullets = [];

    // Set up sprite animation properties.
    this.frameIndex = 0;
    this.frameRate = 300; // milliseconds per frame
    this.lastFrameChange = 0;
  }

  // Calculate bullet direction based on the vector from the enemy's center to the player's center.
  calculateBulletDirection(player) {
    const enemyCenterX = this.x + this.width / 2;
    const enemyCenterY = this.y + this.height / 2;
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const angle = Math.atan2(playerCenterY - enemyCenterY, playerCenterX - enemyCenterX);
    return { dx: Math.cos(angle), dy: Math.sin(angle) };
  }

  // Create a new bullet starting at the enemy's center.
  createBullet(centerX, centerY, dx, dy) {
    this.bullets.push(new Bullet(
      centerX - CONFIG.BOUNCING_ENEMY_BULLET.width / 2,
      centerY - CONFIG.BOUNCING_ENEMY_BULLET.height / 2,
      CONFIG.BOUNCING_ENEMY_BULLET.width,
      CONFIG.BOUNCING_ENEMY_BULLET.height,
      CONFIG.BOUNCING_ENEMY_BULLET.color,
      dx,
      dy,
      CONFIG.BOUNCING_ENEMY_BULLET.speed,
      CONFIG.BOUNCING_ENEMY_BULLET.damage,
      'LargeBullet.png' // Use LargeBullet.png for the bullet image
    ));
  }

  // Attempt to shoot a bullet toward the player if the fire rate interval has passed.
  shoot(timestamp, player, audioManager) {
    if (timestamp - this.lastShotTime >= this.fireRate) {
      const { dx, dy } = this.calculateBulletDirection(player);
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      this.createBullet(centerX, centerY, dx, dy);
      this.lastShotTime = timestamp;
      audioManager.playSound('bouncingEnemyShoot');
    }
  }

  // Update enemy position, check for wall collisions, handle shooting, update bullets, and manage animation.
  update(player, dt, timestamp, canvas, walls, enemies, images, audioManager) {
    // Calculate a new potential position.
    let newX = this.x + this.dx * this.speed * dt;
    let newY = this.y + this.dy * this.speed * dt;
    
    // Simplified wall collision: if colliding with any wall, reverse direction.
    for (let wall of walls) {
      if (
        newX < wall.x + wall.width &&
        newX + this.width > wall.x &&
        newY < wall.y + wall.height &&
        newY + this.height > wall.y
      ) {
        // Reverse both horizontal and vertical directions.
        this.dx *= -1;
        this.dy *= -1;
        // Reset newX/newY to the current position.
        newX = this.x;
        newY = this.y;
        break;
      }
    }
    
    // Update the enemy's position.
    this.x = newX;
    this.y = newY;
    
    // Handle shooting.
    this.shoot(timestamp, player, audioManager);
    
    // Update each bullet and remove any that are flagged for removal.
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(canvas, dt, walls);
      if (bullet.remove) this.bullets.splice(i, 1);
    }
    
    // Update animation frame based on the timestamp.
    if (timestamp - this.lastFrameChange >= this.frameRate) {
      this.frameIndex = (this.frameIndex + 1) % CONFIG.BOUNCING_ENEMY_SPRITESHEET.framesPerRow;
      this.lastFrameChange = timestamp;
    }
    
    // Check for enemy death.
    if (this.health <= 0 && !this.remove) {
      audioManager.playSound('bouncingEnemyDeath');
      this.remove = true;
    }
  }

  // Draw the enemy using its sprite if available; otherwise, draw a simple colored rectangle.
  draw(ctx, images) {
    if (images['bouncingenemy']) {
      const srcX = this.frameIndex * CONFIG.BOUNCING_ENEMY_SPRITESHEET.frameWidth;
      const srcY = 0; // Assuming the sprite sheet has a single row.
      ctx.drawImage(
        images['bouncingenemy'],
        srcX, srcY,
        CONFIG.BOUNCING_ENEMY_SPRITESHEET.frameWidth,
        CONFIG.BOUNCING_ENEMY_SPRITESHEET.frameHeight,
        this.x, this.y,
        this.width, this.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    // Draw all bullets.
    this.bullets.forEach(bullet => bullet.draw(ctx));
  }
}
