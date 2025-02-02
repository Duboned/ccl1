// objects/wall.js

import Entity from './object.js';
import { CONFIG } from '../GAME/config.js';

/**
 * Wall Class
 * Represents either an indestructible or destructible wall in the game.
 */
export default class Wall extends Entity {
  constructor(x, y, width, height, color, texture, isDestructible = false, health = CONFIG.DESTRUCTIBLE_WALL.maxHealth) {
    super(x, y, width, height, color);
    this.texture = texture;
    this.isDestructible = isDestructible;
    this.health = isDestructible ? health : Infinity; // Indestructible walls have infinite health
    this.remove = false; // Flag to remove the wall when destroyed
    this.currentFrame = 0; // Current sprite frame index

    if (this.isDestructible) {
      const { frames, frameWidth, frameHeight, framesPerRow } = CONFIG.DESTRUCTIBLE_WALL;
      Object.assign(this, { frames, frameWidth, frameHeight, framesPerRow });
    }
  }

  takeDamage(damage, audioManager) {
    if (!this.isDestructible) return;
    this.health = Math.max(0, this.health - damage);
    this.remove = this.health === 0;
    audioManager.playSound('enemyHitWall');
    if (!this.remove) this.updateFrame();
  }

  updateFrame() {
    if (!this.isDestructible) return;
    const { maxHealth } = CONFIG.DESTRUCTIBLE_WALL;
    this.currentFrame = maxHealth - Math.max(1, Math.min(this.health, maxHealth));
  }

  draw(ctx, images) {
    if (this.health <= 0) return;
    if (this.isDestructible && images['wall2']) {
      const srcX = this.currentFrame * this.frameWidth;
      ctx.drawImage(images['wall2'], srcX, 0, this.frameWidth, this.frameHeight, this.x, this.y, this.width, this.height);
    } else if (this.texture) {
      ctx.drawImage(this.texture, this.x, this.y, this.width, this.height);
    } else {
      // Fallback color
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}
