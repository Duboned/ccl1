import { CONFIG } from '../GAME/config.js';

// Checks if two rectangular objects (with x, y, width, height) overlap.
export function checkRectangleCollision(a, b) {
  // Returns true if the rectangles intersect on both the x and y axes.
  return (
    a.x < b.x + b.width &&    // a's left edge is left of b's right edge
    a.x + a.width > b.x &&    // a's right edge is right of b's left edge
    a.y < b.y + b.height &&   // a's top is above b's bottom
    a.y + a.height > b.y      // a's bottom is below b's top
  );
}

// Calculates the Minimum Translation Vector (MTV) to separate two overlapping objects.
export function getMTV(a, b) {
  // Compute the amount of overlap along the x-axis.
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  // Compute the amount of overlap along the y-axis.
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  
  // If there is no overlap, return a zero vector.
  if (overlapX <= 0 || overlapY <= 0) return { dx: 0, dy: 0 };

  // Determine whether to separate along x or y by choosing the smaller overlap.
  if (overlapX < overlapY) {
    // Find the center points to decide the direction on the x-axis.
    const aCenterX = a.x + a.width / 2;
    const bCenterX = b.x + b.width / 2;
    // Return a vector that moves a left or right based on the relative positions.
    return { dx: aCenterX < bCenterX ? -overlapX : overlapX, dy: 0 };
  } else {
    // Find the center points to decide the direction on the y-axis.
    const aCenterY = a.y + a.height / 2;
    const bCenterY = b.y + b.height / 2;
    // Return a vector that moves a up or down based on the relative positions.
    return { dx: 0, dy: aCenterY < bCenterY ? -overlapY : overlapY };
  }
}

// Resolves a collision between an entity and a wall by moving the entity out of the wall.
export function resolveEntityWallCollision(entity, wall) {
  // Get the minimum translation vector required to separate the entity from the wall.
  const mtv = getMTV(entity, wall);
  // Apply the translation if needed.
  if (mtv.dx !== 0 || mtv.dy !== 0) {
    entity.x += mtv.dx;
    entity.y += mtv.dy;
  }
}

// Processes collisions between bullets and enemies. If a collision occurs,
// the enemy takes damage and the bullet is removed.
export function resolveBulletCollisions(bullets, enemies) {
  // Loop over enemies from the end to allow safe removal.
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    // Loop over bullets from the end.
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      // Check if the bullet collides with the enemy.
      if (checkRectangleCollision(bullet, enemy)) {
        enemy.takeDamage(bullet.damage);
        // Remove the bullet upon collision.
        bullets.splice(j, 1);
      }
    }
    // If the enemy's health has been depleted, mark it for removal.
    if (enemy.health <= 0) enemy.remove = true;
  }
}

// Checks collisions between the player and enemies. If a collision occurs,
// the player takes damage at set intervals and the death callback is invoked if necessary.
export function handleEnemyPlayerCollisions(player, enemies, onPlayerDeath, timestamp) {
  enemies.forEach(enemy => {
    // If the enemy and player overlap...
    if (checkRectangleCollision(player, enemy)) {
      // Check if enough time has passed since the last collision damage.
      if (!enemy.lastCollisionDamageTime || (timestamp - enemy.lastCollisionDamageTime >= CONFIG.COLLISION_DAMAGE_INTERVAL)) {
        player.takeDamage(1);
        enemy.lastCollisionDamageTime = timestamp;
        // If the player's health reaches zero, call the provided death callback.
        if (player.health <= 0) onPlayerDeath();
      }
    }
  });
}

// Handles collisions between enemies and walls. When an enemy collides with a wall,
// it is separated from the wall and a collision sound is played.
export function handleEnemyWallCollisions(enemies, walls, audioManager) {
  enemies.forEach(enemy => {
    walls.forEach(wall => {
      if (checkRectangleCollision(enemy, wall)) {
        resolveEntityWallCollision(enemy, wall);
        audioManager.playSound('enemyHitWall');
      }
    });
  });
}

// Prevents enemies from overlapping with the player, walls, or each other.
export function preventEnemyOverlaps(enemies, player, walls) {
  enemies.forEach((enemy, index) => {
    // Separate enemy and player if they overlap.
    if (checkRectangleCollision(enemy, player)) separateEntities(enemy, player, walls);
    
    // Separate enemy from non-destructible walls.
    walls.forEach(wall => {
      if (!wall.isDestructible && checkRectangleCollision(enemy, wall)) separateEntities(enemy, wall, walls);
    });
    
    // Separate enemy from other enemies.
    enemies.forEach((otherEnemy, i) => {
      if (i !== index && checkRectangleCollision(enemy, otherEnemy)) separateEntities(enemy, otherEnemy, walls);
    });
  });
}

// Separates two overlapping entities by moving one entity away using the MTV.
// Then checks and resolves any resulting collisions with walls.
function separateEntities(entity, other, walls) {
  // Calculate the minimum translation vector to separate the two entities.
  const mtv = getMTV(entity, other);
  // Move the entity by the computed vector.
  entity.x += mtv.dx;
  entity.y += mtv.dy;
  // After separation, resolve any remaining collisions with walls.
  walls.forEach(wall => {
    if (checkRectangleCollision(entity, wall)) resolveEntityWallCollision(entity, wall);
  });
}
