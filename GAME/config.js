// config.js

export const CONFIG = {
  VIRTUAL_WIDTH: 960,   // Virtual game width in pixels
  VIRTUAL_HEIGHT: 576,  // Virtual game height in pixels

  TILE_SIZE: 32, // Size of each tile in the tile map

  // Player Configurations
  PLAYER_WIDTH: 30, // Player width in pixels
  PLAYER_HEIGHT: 30, // Player height in pixels
  PLAYER_COLOR: 'blue', // Player color
  PLAYER_SPEED: 230, // Player speed in pixels per second
  PLAYER_MAX_HEALTH: 50, // Player maximum health
  PLAYER_FIRE_RATE: 100, // Player fire rate in milliseconds
  PLAYER_SPRITESHEET: {
    path: 'assets/PlayerSpritesheet.png', // Path to player spritesheet
    frameWidth: 32, // Width of a single frame in the spritesheet
    frameHeight: 32, // Height of a single frame in the spritesheet
    framesPerRow: 2, // Number of frames per row in the spritesheet
    totalRows: 2, // Total number of rows in the spritesheet
  },

  // Bullet Configurations
  PLAYER_BULLET: {
    width: 8, // Bullet width in pixels
    height: 8, // Bullet height in pixels
    damage: 1, // Bullet damage
    speed: 500, // Bullet speed in pixels per second
    color: 'white', // Bullet color
  },
  
  SHOOTING_ENEMY_BULLET: {
    width: 8, // Bullet width in pixels
    height: 8, // Bullet height in pixels
    damage: 2, // Bullet damage
    speed: 400, // Bullet speed in pixels per second
    color: 'orange', // Bullet color
  },
  
  BOUNCING_ENEMY_BULLET: {
    width: 20, // Bullet width in pixels
    height: 20, // Bullet height in pixels
    damage: 6, // Bullet damage
    speed: 200, // Bullet speed in pixels per second
    color: 'purple', // Bullet color
  },
  
  // Enemy Collision Damage Timing
  COLLISION_DAMAGE_INTERVAL: 1000, // Interval between collision damage in milliseconds

  // Enemy Configurations
  ENEMY_WIDTH: 28, // Enemy width in pixels
  ENEMY_HEIGHT: 28, // Enemy height in pixels
  ENEMY_COLOR: 'red', // Enemy color
  ENEMY_SPEED: 150, // Enemy speed in pixels per second
  ENEMY_HEALTH: 3, // Enemy health
  MIN_SPAWN_DISTANCE: 100, // Minimum distance from the player to spawn enemies in pixels

  // Shooting Enemy Configurations
  SHOOTING_ENEMY_WIDTH: 32, // Shooting enemy width in pixels
  SHOOTING_ENEMY_HEIGHT: 32, // Shooting enemy height in pixels
  SHOOTING_ENEMY_COLOR: 'purple', // Shooting enemy color
  SHOOTING_ENEMY_SPEED: 120, // Shooting enemy speed in pixels per second
  SHOOTING_ENEMY_HEALTH: 6, // Shooting enemy health
  SHOOTING_ENEMY_FIRE_RATE: 1000, // Shooting enemy fire rate in milliseconds

  // Bouncing Enemy Configurations
  BOUNCING_ENEMY_WIDTH: 32, // Bouncing enemy width in pixels
  BOUNCING_ENEMY_HEIGHT: 32, // Bouncing enemy height in pixels
  BOUNCING_ENEMY_COLOR: 'cyan', // Bouncing enemy color
  BOUNCING_ENEMY_SPEED: 150, // Bouncing enemy speed in pixels per second
  BOUNCING_ENEMY_HEALTH: 18, // Bouncing enemy health
  BOUNCING_ENEMY_FIRE_RATE: 3000, // Bouncing enemy fire rate in milliseconds

  // Destructible Wall Configurations
  DESTRUCTIBLE_WALL: {
    maxHealth: 3, // Maximum health for destructible walls
    spriteSheet: 'assets/wall2.png', // Path to destructible wall sprite sheet
    frames: 3, // Number of frames representing different health states
    frameWidth: 32, // Width of a single frame in the spritesheet
    frameHeight: 32, // Height of a single frame in the spritesheet
    framesPerRow: 3, // Number of frames per row in the spritesheet
  },

  // Enemy Sprite Sheet Configurations
  ENEMY_SPRITESHEET: {
    path: 'assets/enemy.png', // Path to enemy sprite sheet
    frameWidth: 32, // Width of a single frame in the spritesheet
    frameHeight: 32, // Height of a single frame in the spritesheet
    framesPerRow: 2, // Number of frames per direction in the spritesheet
    totalRows: 2, // Total number of rows in the spritesheet
  },

  // Shooting Enemy Sprite Sheet Configurations
  SHOOTING_ENEMY_SPRITESHEET: {
    path: 'assets/ShootingEnemy.png', // Path to shooting enemy sprite sheet
    frameWidth: 32, // Width of a single frame in the spritesheet
    frameHeight: 32, // Height of a single frame in the spritesheet
    framesPerRow: 4, // Number of frames per row in the spritesheet
    totalRows: 2, // Total number of rows in the spritesheet
  },

  // Bouncing Enemy Sprite Sheet Configurations
  BOUNCING_ENEMY_SPRITESHEET: {
    path: 'assets/BouncingEnemy.png', // Path to bouncing enemy sprite sheet
    frameWidth: 32, // Width of a single frame in the spritesheet
    frameHeight: 32, // Height of a single frame in the spritesheet
    framesPerRow: 2, // Number of frames per row in the spritesheet
    totalRows: 1, // Total number of rows in the spritesheet
  },

  // Asset Paths
  ASSETS: {
    WALL_TEXTURE: 'assets/wall.png', // Path to indestructible wall texture
    FLOOR_TEXTURE: 'assets/floor.png', // Path to floor texture
    DESTRUCTIBLE_WALL_SPRITESHEET: 'assets/wall2.png', // Path to destructible wall sprite sheet
    LARGE_BULLET: 'assets/LargeBullet.png', // Path to large bullet texture
  },
};
