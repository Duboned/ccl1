import Enemy from '../objects/enemy.js';
import ShootingEnemy from '../objects/ShootingEnemy.js';
import BouncingEnemy from '../objects/BouncingEnemy.js';
import { CONFIG } from '../GAME/config.js';

/*
 * Shuffles an array in place using the Fisher-Yates algorithm.
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/*
 * Computes all valid spawn positions for a given configuration.
 * If a player is provided, ensures positions are not too close.
 */
function getValidSpawnPositions(tileMap, config, player) {
  const positions = [];

  for (let rowIndex = 0; rowIndex < tileMap.length; rowIndex++) {
    for (let colIndex = 0; colIndex < tileMap[rowIndex].length; colIndex++) {
      if (tileMap[rowIndex][colIndex] !== 0) continue; // Only open tiles
      
      const x = colIndex * CONFIG.TILE_SIZE;
      const y = rowIndex * CONFIG.TILE_SIZE;

      // Boundary check
      if (x < 0 || x + config.width > CONFIG.VIRTUAL_WIDTH || y < 0 || y + config.height > CONFIG.VIRTUAL_HEIGHT) {
        continue;
      }

      // Player proximity check if needed
      if (player) {
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const enemyCenterX = x + config.width / 2;
        const enemyCenterY = y + config.height / 2;
        const distance = Math.hypot(enemyCenterX - playerCenterX, enemyCenterY - playerCenterY);
        if (distance < CONFIG.MIN_SPAWN_DISTANCE) continue;
      }
      
      // Use a unique key if you need to enforce no duplication
      positions.push({ x, y, posKey: `${colIndex},${rowIndex}` });
    }
  }
  return positions;
}

/*
 * Generalized function to spawn multiple entities of a given type.
 * - EntityClass: The enemy class (Enemy, ShootingEnemy, etc.)
 * - entityArray: The array to push new entities onto.
 * - count: The number of entities to spawn.
 * - config: The configuration for the enemy type.
 * - player: The player object for proximity check (if applicable).
 * - tileMap: The level layout.
 * - audioManager: Audio manager for enemy sound effects (if needed).
 */
function spawnMultipleEntities(EntityClass, entityArray, count, config, player, tileMap, audioManager) {
  // Compute all valid positions only once.
  const validPositions = getValidSpawnPositions(tileMap, config, player);
  
  if (validPositions.length < count) {
    console.warn(`Requested ${count} spawns but only ${validPositions.length} valid positions found.`);
  }
  
  // Shuffle the valid positions.
  shuffleArray(validPositions);
  
  // Use a set to track occupied positions if needed.
  const occupiedPositions = new Set();
  
  // Spawn up to 'count' entities.
  for (let i = 0, spawned = 0; i < validPositions.length && spawned < count; i++) {
    const pos = validPositions[i];
    
    // Ensure we haven't used this position already
    if (occupiedPositions.has(pos.posKey)) continue;
    occupiedPositions.add(pos.posKey);
    
    const entity = new EntityClass(
      pos.x,
      pos.y,
      config.width,
      config.height,
      config.color,
      config.speed,
      config.health,
      config.fireRate,
      audioManager
    );
    entityArray.push(entity);
    spawned++;
  }
}

/*
 * Spawns basic enemies.
 */
export function spawnEnemies(enemies, player, count, tileMap) {
  const config = {
    width: CONFIG.ENEMY_WIDTH,
    height: CONFIG.ENEMY_HEIGHT,
    color: CONFIG.ENEMY_COLOR,
    speed: CONFIG.ENEMY_SPEED,
    health: CONFIG.ENEMY_HEALTH,
    fireRate: null  // Basic enemies do not shoot
  };
  spawnMultipleEntities(Enemy, enemies, count, config, player, tileMap);
}

/*
 * Spawns shooting enemies.
 */
export function spawnShootingEnemies(shootingEnemies, count, tileMap, audioManager) {
  const config = {
    width: CONFIG.SHOOTING_ENEMY_WIDTH,
    height: CONFIG.SHOOTING_ENEMY_HEIGHT,
    color: CONFIG.SHOOTING_ENEMY_COLOR,
    speed: CONFIG.SHOOTING_ENEMY_SPEED,
    health: CONFIG.SHOOTING_ENEMY_HEALTH,
    fireRate: CONFIG.SHOOTING_ENEMY_FIRE_RATE
  };
  // Player parameter is not used for shooting enemies in this example.
  spawnMultipleEntities(ShootingEnemy, shootingEnemies, count, config, null, tileMap, audioManager);
}

/*
 * Spawns bouncing enemies.
 */
export function spawnBouncingEnemies(bouncingEnemies, count, tileMap, audioManager) {
  const config = {
    width: CONFIG.BOUNCING_ENEMY_WIDTH,
    height: CONFIG.BOUNCING_ENEMY_HEIGHT,
    color: CONFIG.BOUNCING_ENEMY_COLOR,
    speed: CONFIG.BOUNCING_ENEMY_SPEED,
    health: CONFIG.BOUNCING_ENEMY_HEALTH,
    fireRate: CONFIG.BOUNCING_ENEMY_FIRE_RATE
  };
  spawnMultipleEntities(BouncingEnemy, bouncingEnemies, count, config, null, tileMap, audioManager);
}
