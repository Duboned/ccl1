export default class AudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    this.music = {};
  }

  loadSound(key, src) {
    const audio = new Audio();
    audio.src = src;
    audio.addEventListener('canplaythrough', () => {
      this.sounds[key] = audio;
    }, false);
    audio.addEventListener('error', (e) => {
      console.error(`Failed to load sound: ${key}`, e);
    }, false);
  }

  loadMusic(key, src) {
    const audio = new Audio();
    audio.src = src;
    audio.loop = true; // Ensure the music loops
    audio.addEventListener('canplaythrough', () => {
      this.music[key] = audio;
    }, false);
    audio.addEventListener('error', (e) => {
      console.error(`Failed to load music: ${key}`, e);
    }, false);
  }

  setMute(mute) {
    for (const key in this.sounds) {
      if (this.sounds[key]) {
        this.sounds[key].muted = mute;
      }
    }
    for (const key in this.music) {
      if (this.music[key]) {
        this.music[key].muted = mute;
      }
    }
  }

  playSound(key) {
    if (this.sounds[key]) {
      this.sounds[key].currentTime = 0;
      this.sounds[key].play().catch(error => {
        console.error(`Failed to play sound: ${key}`, error);
      });
    } else {
      console.error(`Sound not found: ${key}`);
    }
  }

  playMusic(key) {
    if (this.music[key]) {
      this.music[key].play().catch(error => {
        console.error(`Failed to play music: ${key}`, error);
      });
    } else {
      console.error(`Music not found: ${key}`);
    }
  }

  stopMusic(key) {
    if (this.music[key]) {
      this.music[key].pause();
      this.music[key].currentTime = 0;
    }
  }

  stopAllMusic() {
    for (const key in this.music) {
      this.stopMusic(key);
    }
  }
}


const audioManager = new AudioManager();
audioManager.loadSound('shootingEnemyShoot', 'audio/shooting_enemy_shoot.wav');
audioManager.loadSound('bouncingEnemyShoot', 'audio/bouncing_enemy_shoot.wav');
audioManager.loadSound('playerDamage', 'audio/player_damage.wav');
audioManager.loadSound('enemyHitWall', 'audio/enemy_hit_wall.wav');
audioManager.loadSound('enemyDeath', 'audio/enemy_death.mp3'); // New sound
audioManager.loadSound('shootingEnemyDeath', 'audio/shooting_enemy_death.wav'); // New sound
audioManager.loadSound('bouncingEnemyDeath', 'audio/bouncing_enemy_death.mp3'); // New sound
audioManager.loadMusic('level1', 'audio/level1.mp3');
audioManager.loadMusic('level2', 'audio/level2.mp3');
audioManager.loadMusic('level3', 'audio/level3.mp3');
audioManager.loadMusic('gameWin', 'audio/CCL_song.mp3');
audioManager.loadMusic('startScreen', 'audio/Invasion_Galactica.mp3'); // Ensure the file path is correct


