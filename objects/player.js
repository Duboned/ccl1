// objects/player.js
import Entity from './object.js';
import { CONFIG } from '../GAME/config.js';
import { checkRectangleCollision } from '../utils/collisions.js';

/**
 * Player Class
 */
export default class Player extends Entity {
  constructor(x, y, width, height, color, speed) {
    super(x, y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT, color);
    this.speed = speed;
    this.health = CONFIG.PLAYER_MAX_HEALTH;
    this.frameIndex = 0;
    this.direction = 'right';
    this.frameRate = 300;
    this.lastFrameChange = 0;
  }

  takeDamage(amount) {
    this.health = Math.max(0, this.health - amount);
    console.log(`Player took ${amount} damage, health now: ${this.health}`);
  }

  update(input, canvas, dt, walls) {
    let { velocityX, velocityY } = this.calculateVelocity(input, dt);

    this.direction = velocityX < 0 ? 'left' : velocityX > 0 ? 'right' : this.direction;

    let newX = this.x + velocityX;
    let newY = this.y + velocityY;

    if (!this.checkWallCollision(newX, newY, walls)) {
      this.x = newX;
      this.y = newY;
    } else {
      this.handleAxisCollision(velocityX, 0, walls);
      this.handleAxisCollision(0, velocityY, walls);
    }

    this.clampPosition();
    this.updateAnimationFrame();

    if (input.isMouseDown()) {
      this.changeDirectionOnShoot(input.mouseX);
    }
  }

  calculateVelocity(input, dt) {
    let velocityX = 0;
    let velocityY = 0;

    if (input.isKeyDown('w')) velocityY -= this.speed * dt;
    if (input.isKeyDown('s')) velocityY += this.speed * dt;
    if (input.isKeyDown('a')) velocityX -= this.speed * dt;
    if (input.isKeyDown('d')) velocityX += this.speed * dt;

    if (velocityX !== 0 && velocityY !== 0) {
      velocityX *= Math.SQRT1_2;
      velocityY *= Math.SQRT1_2;
    }

    return { velocityX, velocityY };
  }

  handleAxisCollision(velocityX, velocityY, walls) {
    let newX = this.x + velocityX;
    let newY = this.y + velocityY;

    if (!this.checkWallCollision(newX, newY, walls)) {
      this.x = newX;
      this.y = newY;
    }
  }

  clampPosition() {
    this.x = Math.max(0, Math.min(CONFIG.VIRTUAL_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.VIRTUAL_HEIGHT - this.height, this.y));
  }

  updateAnimationFrame() {
    const now = performance.now();
    if (now - this.lastFrameChange >= this.frameRate) {
      this.frameIndex = (this.frameIndex + 1) % CONFIG.PLAYER_SPRITESHEET.framesPerRow;
      this.lastFrameChange = now;
    }
  }

  checkWallCollision(x, y, walls) {
    return walls.some(wall => checkRectangleCollision({ x, y, width: this.width, height: this.height }, wall));
  }

  adjustPosition(x, y, walls) {
    walls.forEach(wall => {
      if (checkRectangleCollision({ x, y, width: this.width, height: this.height }, wall)) {
        const overlapX = (x + this.width / 2) - (wall.x + wall.width / 2);
        const overlapY = (y + this.height / 2) - (wall.y + wall.height / 2);
        const halfWidths = (wall.width + this.width) / 2;
        const halfHeights = (wall.height + this.height) / 2;

        if (Math.abs(overlapX) < halfWidths && Math.abs(overlapY) < halfHeights) {
          const offsetX = halfWidths - Math.abs(overlapX);
          const offsetY = halfHeights - Math.abs(overlapY);

          if (offsetX < offsetY) {
            this.x += overlapX > 0 ? offsetX : -offsetX;
          } else {
            this.y += overlapY > 0 ? offsetY : -offsetY;
          }
        }
      }
    });
  }

  draw(ctx, images) {
    if (images['player']) {
      const row = this.direction === 'left' ? 0 : 1;
      const col = this.frameIndex;
      const srcX = col * CONFIG.PLAYER_SPRITESHEET.frameWidth;
      const srcY = row * CONFIG.PLAYER_SPRITESHEET.frameHeight;

      ctx.drawImage(
        images['player'],
        srcX,
        srcY,
        CONFIG.PLAYER_SPRITESHEET.frameWidth,
        CONFIG.PLAYER_SPRITESHEET.frameHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    const barWidth = this.width;
    const barHeight = 5;
    const healthRatio = this.health / CONFIG.PLAYER_MAX_HEALTH;
    ctx.fillStyle = 'red';
    ctx.fillRect(this.x, this.y - barHeight - 2, barWidth, barHeight);
    ctx.fillStyle = 'green';
    ctx.fillRect(this.x, this.y - barHeight - 2, barWidth * healthRatio, barHeight);
  }

  changeDirectionOnShoot(mouseX) {
    const playerCenterX = this.x + this.width / 2;
    this.direction = mouseX < playerCenterX ? 'left' : 'right';
  }
}
