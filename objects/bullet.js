import Entity from './object.js';
import { CONFIG } from '../GAME/config.js';

export default class Bullet extends Entity {
  constructor(x, y, width, height, color, dx, dy, speed, damage) {
    super(x, y, width, height, color);
    this.dx = dx;
    this.dy = dy;
    this.speed = speed;
    this.damage = damage;
    this.remove = false;
    this.active = true;
  }

  update(canvas, dt, walls = []) {
    if (!this.active) return;
    this.move(dt);
    this.checkWallCollisions(walls);
    this.checkOutOfBounds(canvas);
  }

  move(dt) {
    this.x += this.dx * this.speed * dt;
    this.y += this.dy * this.speed * dt;
  }

  checkWallCollisions(walls) {
    for (const wall of walls) {
      if (this.isCollidingWith(wall)) {
        this.remove = true;
        this.active = false;
        break;
      }
    }
  }

  isCollidingWith(wall) {
    return (
      this.x < wall.x + wall.width &&
      this.x + this.width > wall.x &&
      this.y < wall.y + wall.height &&
      this.y + this.height > wall.y
    );
  }

  checkOutOfBounds(canvas) {
    if (
      this.x + this.width < 0 ||
      this.x > CONFIG.VIRTUAL_WIDTH ||
      this.y + this.height < 0 ||
      this.y > CONFIG.VIRTUAL_HEIGHT
    ) {
      this.remove = true;
      this.active = false;
    }
  }

  checkCollision(target) {
    const dx = (this.x + this.width / 2) - (target.x + target.width / 2);
    const dy = (this.y + this.height / 2) - (target.y + target.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = this.width / 2;
    const targetRadius = Math.min(target.width, target.height) / 2;
    return distance < radius + targetRadius;
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
