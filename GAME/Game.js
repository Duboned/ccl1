import InputManager from '../utils/inputManager.js';
import { CONFIG } from './config.js';
import { spawnEnemies, spawnShootingEnemies, spawnBouncingEnemies } from '../utils/spawner.js';
import {
  resolveBulletCollisions,
  handleEnemyPlayerCollisions,
  handleEnemyWallCollisions,
  preventEnemyOverlaps
} from '../utils/collisions.js';
import level1 from '../levels/level1.js';
import level2 from '../levels/level2.js';
import level3 from '../levels/level3.js';
import Player from '../objects/player.js';
import Bullet from '../objects/bullet.js';
import Wall from '../objects/wall.js';
import Enemy from '../objects/enemy.js';
import ShootingEnemy from '../objects/ShootingEnemy.js';
import BouncingEnemy from '../objects/BouncingEnemy.js';
import AudioManager from '../utils/audioManager.js';

const GAME_STATES = {
  START: 'start',
  PLAYING: 'playing',
  GAMEOVER: 'gameover',
  WIN: 'win'
};

export default class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.lastTime = 0;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.input = new InputManager();
    this.input.attach();
    this.bullets = [];
    this.walls = [];
    this.enemies = [];
    this.shootingEnemies = [];
    this.bouncingEnemies = [];
    this.images = {};
    this.audioManager = new AudioManager();
    this.isMuted = false;
    this.wasMuteKeyPressed = false;
    this.loadAssets();
    this.player = new Player(
      CONFIG.VIRTUAL_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2,
      CONFIG.VIRTUAL_HEIGHT / 2 - CONFIG.PLAYER_HEIGHT / 2,
      CONFIG.PLAYER_WIDTH,
      CONFIG.PLAYER_HEIGHT,
      CONFIG.PLAYER_COLOR,
      CONFIG.PLAYER_SPEED
    );
    this.currentLevelIndex = 0;
    this.levels = [level1, level2, level3];
    this.gameState = GAME_STATES.START;
    this.lastShotTime = 0;
    this.startScreen = document.getElementById('startScreen');
    this.gameOverScreen = document.getElementById('gameOverScreen');
    this.winScreen = document.getElementById('winScreen');
  }

  loadAssets() {
    const assetPromises = [
      this.loadImage('wall', CONFIG.ASSETS.WALL_TEXTURE),
      this.loadImage('wall2', CONFIG.DESTRUCTIBLE_WALL.spriteSheet),
      this.loadImage('floor', CONFIG.ASSETS.FLOOR_TEXTURE),
      this.loadImage('enemy', CONFIG.ENEMY_SPRITESHEET.path),
      this.loadImage('shootingenemy', CONFIG.SHOOTING_ENEMY_SPRITESHEET.path),
      this.loadImage('bouncingenemy', CONFIG.BOUNCING_ENEMY_SPRITESHEET.path),
      this.loadImage('largeBullet', CONFIG.ASSETS.LARGE_BULLET),
      this.loadImage('player', CONFIG.PLAYER_SPRITESHEET.path),
      this.loadImage('startScreenBackground', 'assets/background.png')
    ];

    Promise.all(assetPromises)
      .then(() => {
        this.loadAudio();
        this.initializeGame();
        this.start();
      })
      .catch((error) => {
        console.error('Error loading assets:', error);
      });
  }

  loadImage(key, src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[key] = img;
        resolve();
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
    });
  }

  loadAudio() {
    this.audioManager.loadSound('shootingEnemyShoot', 'audio/shooting_enemy_shoot.wav');
    this.audioManager.loadSound('bouncingEnemyShoot', 'audio/bouncing_enemy_shoot.wav');
    this.audioManager.loadSound('playerDamage', 'audio/player_damage.wav');
    this.audioManager.loadSound('enemyHitWall', 'audio/enemy_hit_wall.wav');
    this.audioManager.loadSound('playerShoot', 'audio/player_shoot.wav');
    this.audioManager.loadSound('enemyDeath', 'audio/enemy_death.mp3');
    this.audioManager.loadSound('shootingEnemyDeath', 'audio/shooting_enemy_death.wav');
    this.audioManager.loadSound('bouncingEnemyDeath', 'audio/bouncing_enemy_death.mp3');
    this.audioManager.loadMusic('level1', 'audio/level1.mp3');
    this.audioManager.loadMusic('level2', 'audio/level2.mp3');
    this.audioManager.loadMusic('level3', 'audio/level3.mp3');
    this.audioManager.loadMusic('gameWin', 'audio/CCL_song.mp3');
  }

  initializeGame() {
    this.loadLevel(this.levels[this.currentLevelIndex]);
    this.audioManager.stopAllMusic();
  }

  loadLevel(levelData) {
    this.clearEntities();
    this.createWalls(levelData.tileMap);
    this.spawnEnemies(levelData);
  }

  clearEntities() {
    this.walls = [];
    this.enemies = [];
    this.shootingEnemies = [];
    this.bouncingEnemies = [];
    this.bullets = [];
  }

  createWalls(tileMap) {
    for (let row = 0; row < tileMap.length; row++) {
      for (let col = 0; col < tileMap[row].length; col++) {
        const tileID = tileMap[row][col];
        const x = col * CONFIG.TILE_SIZE;
        const y = row * CONFIG.TILE_SIZE;
        if (tileID === 1) {
          this.walls.push(new Wall(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, 'gray', this.images['wall'], false));
        } else if (tileID === 2) {
          this.walls.push(new Wall(x, y, CONFIG.TILE_SIZE, CONFIG.TILE_SIZE, 'gray', this.images['wall2'], true, CONFIG.DESTRUCTIBLE_WALL.maxHealth));
        }
      }
    }
  }

  spawnEnemies(levelData) {
    spawnEnemies(this.enemies, this.player, levelData.enemyCount || 0, levelData.tileMap);
    spawnShootingEnemies(this.shootingEnemies, levelData.shootingEnemyCount || 0, levelData.tileMap, this.audioManager);
    spawnBouncingEnemies(this.bouncingEnemies, levelData.bouncingEnemyCount || 0, levelData.tileMap, this.audioManager);
  }

  start() {
    requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
  }

  gameLoop(timestamp) {
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    this.update(dt, timestamp);
    this.draw();
    requestAnimationFrame((nextTimestamp) => this.gameLoop(nextTimestamp));
  }

  update(dt, timestamp) {
    switch (this.gameState) {
      case GAME_STATES.PLAYING:
        this.updatePlayingState(dt, timestamp);
        break;
      case GAME_STATES.START:
        this.checkStartInput();
        break;
      case GAME_STATES.GAMEOVER:
      case GAME_STATES.WIN:
        this.checkRestartInput();
        break;
    }
    this.checkMuteInput();
  }

  updatePlayingState(dt, timestamp) {
    this.player.update(this.input, this.canvas, dt, this.walls);
    this.handleShooting(timestamp);
    this.updateBullets(dt);
    this.resolveCollisions();
    this.updateEnemies(dt, timestamp);
    this.checkLevelCompletion();
  }

  calculateBulletDirection(mouseX, mouseY) {
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.height / 2;
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    return {
      dx: Math.cos(angle),
      dy: Math.sin(angle)
    };
  }

  createBullet(centerX, centerY, dx, dy) {
    this.bullets.push(
      new Bullet(
        centerX - CONFIG.PLAYER_BULLET.width / 2,
        centerY - CONFIG.PLAYER_BULLET.height / 2,
        CONFIG.PLAYER_BULLET.width,
        CONFIG.PLAYER_BULLET.height,
        CONFIG.PLAYER_BULLET.color,
        dx,
        dy,
        CONFIG.PLAYER_BULLET.speed,
        CONFIG.PLAYER_BULLET.damage
      )
    );
  }

  handleShooting(timestamp) {
    if ((this.input.isMouseDown() || this.input.isKeyDown(' ')) &&
        timestamp - this.lastShotTime >= CONFIG.PLAYER_FIRE_RATE) {
      this.shootBullet();
      this.lastShotTime = timestamp;
    }
  }

  shootBullet() {
    const { dx, dy } = this.calculateBulletDirection(this.input.mouse.x, this.input.mouse.y);
    const centerX = this.player.x + this.player.width / 2;
    const centerY = this.player.y + this.player.width / 2;

    this.createBullet(centerX, centerY, dx, dy);

    this.player.changeDirectionOnShoot(this.input.mouse.x);
    this.audioManager.playSound('playerShoot');
  }

  updateBullets(dt) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(this.canvas, dt, this.walls);
      if (bullet.remove) {
        this.bullets.splice(i, 1);
      }
    }
  }

  resolveCollisions() {
    resolveBulletCollisions(this.bullets, this.enemies);
    resolveBulletCollisions(this.bullets, this.shootingEnemies);
    resolveBulletCollisions(this.bullets, this.bouncingEnemies);

    handleEnemyPlayerCollisions(this.player, this.getAllEnemies(), this.gameOver.bind(this), this.lastTime);
    handleEnemyWallCollisions(this.getAllEnemies(), this.walls, this.audioManager);
    preventEnemyOverlaps(this.getAllEnemies(), this.player, this.walls);

    this.walls = this.walls.filter(wall => !wall.remove);
  }

  updateEnemies(dt, timestamp) {
    this.enemies.forEach(enemy => {
      enemy.update(this.player, dt, this.walls, this.enemies, this.images, this.audioManager);
      this.checkBoundary(enemy);
    });
    this.updateShootingEnemies(dt, timestamp);
    this.updateBouncingEnemies(dt, timestamp);

    this.enemies = this.enemies.filter(enemy => {
      if (enemy.remove) {
        this.audioManager.playSound('enemyDeath');
      }
      return !enemy.remove;
    });
  }

  updateShootingEnemies(dt, timestamp) {
    this.shootingEnemies.forEach(sEnemy => {
      sEnemy.update(this.player, dt, timestamp, this.canvas, this.walls, this.shootingEnemies, this.images, this.audioManager);
      this.checkEnemyBulletsCollision(sEnemy.bullets);
    });

    this.shootingEnemies = this.shootingEnemies.filter(sEnemy => {
      if (sEnemy.remove) {
        this.audioManager.playSound('shootingEnemyDeath');
      }
      return !sEnemy.remove;
    });
  }

  updateBouncingEnemies(dt, timestamp) {
    this.bouncingEnemies.forEach(bEnemy => {
      bEnemy.update(
        this.player,
        dt,
        timestamp,
        this.canvas,
        this.walls,
        this.getAllEnemies().filter(e => e !== bEnemy),
        this.images,
        this.audioManager
      );
      this.checkEnemyBulletsCollision(bEnemy.bullets);
    });

    this.bouncingEnemies = this.bouncingEnemies.filter(bEnemy => {
      if (bEnemy.remove) {
        this.audioManager.playSound('bouncingEnemyDeath');
      }
      return !bEnemy.remove;
    });
  }

  checkEnemyBulletsCollision(bullets) {
    bullets.forEach(enemyBullet => {
      if (enemyBullet instanceof Bullet && enemyBullet.active) {
        enemyBullet.hitPlayer = true;
        if (enemyBullet.checkCollision(this.player)) {
          enemyBullet.remove = true;
          this.player.takeDamage(enemyBullet.damage);
          this.audioManager.playSound('playerDamage');
          if (this.player.health <= 0) {
            this.gameOver();
          }
        }
      }
    });
  }

  checkBoundary(entity) {
    if (entity.x < 0) entity.x = 0;
    if (entity.y < 0) entity.y = 0;
    if (entity.x + entity.width > CONFIG.VIRTUAL_WIDTH) entity.x = CONFIG.VIRTUAL_WIDTH - entity.width;
    if (entity.y + entity.height > CONFIG.VIRTUAL_HEIGHT) entity.y = CONFIG.VIRTUAL_HEIGHT - entity.height;
  }

  getAllEnemies() {
    return [...this.enemies, ...this.shootingEnemies, ...this.bouncingEnemies];
  }

  checkLevelCompletion() {
    if (
      this.enemies.length === 0 &&
      this.shootingEnemies.length === 0 &&
      this.bouncingEnemies.length === 0
    ) {
      this.completeLevel();
    }
  }

  completeLevel() {
    this.currentLevelIndex++;
    if (this.currentLevelIndex >= this.levels.length) {
      this.winGame();
    } else {
      this.loadLevel(this.levels[this.currentLevelIndex]);
      this.player.x = CONFIG.VIRTUAL_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2;
      this.player.y = CONFIG.VIRTUAL_HEIGHT / 2 - CONFIG.PLAYER_HEIGHT / 2;
      this.player.health = CONFIG.PLAYER_MAX_HEALTH;
      this.audioManager.stopAllMusic();
      if (!this.isMuted) {
        this.audioManager.playMusic(`level${this.currentLevelIndex + 1}`);
      }
    }
  }

  startPlaying() {
    this.gameState = GAME_STATES.PLAYING;
    this.startScreen.style.display = 'none';
    this.player.health = CONFIG.PLAYER_MAX_HEALTH;
    this.audioManager.stopAllMusic();
    if (!this.isMuted) {
      this.audioManager.playMusic(`level${this.currentLevelIndex + 1}`);
    }
  }

  gameOver() {
    this.gameState = GAME_STATES.GAMEOVER;
    if (!this.isMuted) {
      this.audioManager.playMusic('gameOver');
    }
    this.drawGameOverScreen();
  }

  winGame() {
    this.audioManager.stopAllMusic();
    if (!this.isMuted) {
      this.audioManager.playMusic('gameWin');
    }
    this.gameState = GAME_STATES.WIN;
    this.drawWinScreen();
  }

  restartGame() {
    this.gameState = GAME_STATES.PLAYING;
    this.player.health = CONFIG.PLAYER_MAX_HEALTH;
    this.currentLevelIndex = 0;
    this.loadLevel(this.levels[this.currentLevelIndex]);
    this.player.x = CONFIG.VIRTUAL_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2;
    this.player.y = CONFIG.VIRTUAL_HEIGHT / 2 - CONFIG.PLAYER_HEIGHT / 2;
  }

  checkStartInput() {
    if (this.input.isKeyDown('enter') || this.input.isKeyDown(' ')) {
      this.audioManager.stopAllMusic();
      this.audioManager.playMusic('startScreen');
      this.startPlaying();
    }
  }

  checkRestartInput() {
    if (this.input.isKeyDown('enter') || this.input.isKeyDown(' ')) {
      this.restartGame();
    }
  }

  checkMuteInput() {
    const isMuteKeyPressed = this.input.isKeyDown('m');
    if (isMuteKeyPressed && !this.wasMuteKeyPressed) {
      this.isMuted = !this.isMuted;
      this.audioManager.setMute(this.isMuted);
    }
    this.wasMuteKeyPressed = isMuteKeyPressed;
  }

  draw() {
    const { width, height } = this.canvas;
    const virtualW = CONFIG.VIRTUAL_WIDTH;
    const virtualH = CONFIG.VIRTUAL_HEIGHT;

    this.ctx.clearRect(0, 0, width, height);

    const scaleX = width / virtualW;
    const scaleY = height / virtualH;
    this.scale = Math.min(scaleX, scaleY);
    this.offsetX = (width - virtualW * this.scale) / 2;
    this.offsetY = (height - virtualH * this.scale) / 2;

    if (this.gameState === GAME_STATES.PLAYING) {
      this.ctx.save();
      this.ctx.translate(this.offsetX, this.offsetY);
      this.ctx.scale(this.scale, this.scale);

      this.drawFloor();
      this.walls.forEach(wall => wall.draw(this.ctx, this.images));
      this.player.draw(this.ctx, this.images);
      this.enemies.forEach(enemy => enemy.draw(this.ctx, this.images));
      this.shootingEnemies.forEach(sEnemy => sEnemy.draw(this.ctx, this.images));
      this.bouncingEnemies.forEach(bEnemy => bEnemy.draw(this.ctx, this.images));
      this.bullets.forEach(bullet => bullet.draw(this.ctx));

      this.ctx.restore();
      this.drawHUD();
    } else if (this.gameState === GAME_STATES.START) {
      this.drawStartScreen();
    } else if (this.gameState === GAME_STATES.GAMEOVER) {
      this.drawGameOverScreen();
    } else if (this.gameState === GAME_STATES.WIN) {
      this.drawWinScreen();
    }
  }

  drawFloor() {
    if (this.images['floor']) {
      for (let row = 0; row < CONFIG.VIRTUAL_HEIGHT / CONFIG.TILE_SIZE; row++) {
        for (let col = 0; col < CONFIG.VIRTUAL_WIDTH / CONFIG.TILE_SIZE; col++) {
          this.ctx.drawImage(
            this.images['floor'],
            col * CONFIG.TILE_SIZE,
            row * CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE,
            CONFIG.TILE_SIZE
          );
        }
      }
    } else {
      this.ctx.fillStyle = '#444';
      this.ctx.fillRect(0, 0, CONFIG.VIRTUAL_WIDTH, CONFIG.VIRTUAL_HEIGHT);
    }
  }

  drawHUD() {
    this.ctx.save();
    this.ctx.fillStyle = 'white';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Level: ${this.currentLevelIndex + 1}/${this.levels.length}`, 20, 30);

    const barWidth = 100;
    const barHeight = 10;
    const healthRatio = this.player.health / CONFIG.PLAYER_MAX_HEALTH;

    this.ctx.fillStyle = 'red';
    this.ctx.fillRect(20, 50, barWidth, barHeight);

    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(20, 50, barWidth * healthRatio, barHeight);

    this.ctx.restore();
  }

  drawStartScreen() {
    this.startScreen.style.display = 'block';
    this.gameOverScreen.style.display = 'none';
    this.winScreen.style.display = 'none';
  }

  drawGameOverScreen() {
    this.startScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'block';
    this.winScreen.style.display = 'none';
  }

  drawWinScreen() {
    this.startScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
    this.winScreen.style.display = 'block';
  }
}
