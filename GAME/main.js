// =====================================================
// Imports
// =====================================================
import { CONFIG } from './config.js';
import Game from './Game.js';

// =====================================================
// Canvas Setup
// =====================================================

// Get the canvas element and its drawing context.
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/**
 * Resizes the canvas to always match the window dimensions.
 */
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
// Listen for window resize events and update the canvas dimensions.
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial canvas sizing

// =====================================================
// Game Instance Creation
// =====================================================

// Create the game instance by passing the canvas and context.
// The Game class (from game.js) handles game initialization, asset loading, and the main game loop.
const game = new Game(canvas, ctx);

// =====================================================
// Mouse Movement Handling
// =====================================================

/**
 * Handles mouse movement by converting real (screen) coordinates
 * into virtual game coordinates, based on the canvas scale and offsets.
 * This ensures the player's aiming and shooting behave as expected.
 */
window.addEventListener('mousemove', (e) => {
  // Only process mouse movement when the game is in the "playing" state.
  if (game.gameState === 'playing') {
    // Get the canvas's position on the screen.
    const rect = canvas.getBoundingClientRect();
    const realX = e.clientX - rect.left;
    const realY = e.clientY - rect.top;

    // Convert real coordinates to virtual coordinates using the game's scale and offset.
    const virtualX = (realX - game.offsetX) / game.scale;
    const virtualY = (realY - game.offsetY) / game.scale;

    // Clamp the coordinates within the bounds of the virtual game dimensions.
    game.input.mouse.x = Math.max(0, Math.min(CONFIG.VIRTUAL_WIDTH, virtualX));
    game.input.mouse.y = Math.max(0, Math.min(CONFIG.VIRTUAL_HEIGHT, virtualY));
  }
});

// =====================================================
// Starting the Game Loop
// =====================================================

// Begin the game loop. This calls the start() method in your Game class,
// which in turn uses requestAnimationFrame to continually update and draw the game.
game.start();

// =====================================================
// Game State Functions (Start, Game Over, Win)
// =====================================================

/**
 * Starts or restarts the game:
 * - Hides any overlay screens (start, game over, win).
 * - Displays the game canvas.
 * - Calls restartGame() on the game instance to reset state.
 */
function startGame() {
  // Hide overlay screens
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('winScreen').style.display = 'none';
  
  // Show the game canvas
  document.getElementById('gameCanvas').style.display = 'block';
  
  // Reset game state and restart the game
  game.restartGame();
  console.log('Game Started');
}

/**
 * Triggers the game over sequence:
 * - Shows the game over screen.
 * - Hides the game canvas.
 * - Sets the game state to 'gameover' and plays game over music (if not muted).
 */
function gameOver() {
  // Display the game over screen
  document.getElementById('gameOverScreen').style.display = 'block';
  
  // Hide the game canvas
  document.getElementById('gameCanvas').style.display = 'none';
  
  // Update game state
  game.gameState = 'gameover';
  console.log('Game Over triggered.');
  
  // Play game over music if audio is enabled
  if (!game.isMuted) {
    game.audioManager.playMusic('gameOver'); // Play game over music
  }
}

/**
 * Triggers the win sequence:
 * - Displays the win screen.
 * - Hides the game canvas.
 * - Sets the game state to 'win', stops any current music, and plays the win music.
 */
function winGame() {
  // Display the win screen
  document.getElementById('winScreen').style.display = 'block';
  
  // Hide the game canvas
  document.getElementById('gameCanvas').style.display = 'none';
  
  // Update game state
  game.gameState = 'win';
  console.log('Congratulations! You have completed all levels.');
  
  // Stop any playing music and play the win music if audio is enabled
  game.audioManager.stopAllMusic();
  if (!game.isMuted) {
    game.audioManager.playMusic('gameWin'); // Play win music
  }
}

// =====================================================
// DOM Event Listeners for Game Controls
// =====================================================

/**
 * Listen for keydown events (Enter or Space) to start or restart the game.
 * The check ensures that the game starts only if an overlay screen (start, game over, or win) is visible.
 */
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    if (document.getElementById('startScreen').style.display === 'block' ||
        document.getElementById('gameOverScreen').style.display === 'block' ||
        document.getElementById('winScreen').style.display === 'block') {
      startGame();
    }
  }
});

// Listen for click events on the "New Game" button to start the game.
document.getElementById('newGame').addEventListener('click', function() {
  startGame();
});
