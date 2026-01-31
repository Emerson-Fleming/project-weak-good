// Game.js
// Core game manager class for shared functionality across levels

class Game {
    constructor() {
        this.currentLevel = null;
        this.platforms = null;
        this.player = null;
        this.healthBar = null;
        this.isGameOver = false;
        this.gameOverCallback = null; // Function to call when game over
    }

    // Initialize common game elements
    init() {
        // Create platform group
        this.platforms = new Group();
        this.platforms.color = 'green';
        this.platforms.collider = 'static';

        return this;
    }

    // Set up the world with gravity
    initializeGravity(gravityY = 20) {
        world.gravity.y = gravityY;
    }

    // Create a basic ground platform
    createGround(color = 'brown') {
        // Store reference to ground for resizing
        if (!this.ground) {
            this.ground = new this.platforms.Sprite();
            this.ground.collider = 'static';
        }
        this.ground.x = width / 2;
        this.ground.y = height - 25;
        this.ground.width = width;
        this.ground.height = 50;
        this.ground.color = color;

        // Add resize listener only once
        if (!this._resizeListenerAdded) {
            window.addEventListener('resize', () => {
                // Update ground size and position on resize
                this.ground.x = width / 2;
                this.ground.y = height - 25;
                this.ground.width = width;
                this.ground.height = 50;
            });
            this._resizeListenerAdded = true;
        }

        return this.ground;
    }

    // Create a static platform
    createPlatform(x, y, w, h, color = 'green') {
        let platform = new this.platforms.Sprite();
        platform.x = x;
        platform.y = y;
        platform.width = w;
        platform.height = h;
        platform.color = color;
        return platform;
    }

    // Create a player
    createPlayer(x, y, options = {}) {
        this.player = new Player(x, y, options);
        this.player.setPlatforms(this.platforms);
        return this.player;
    }

    // Display UI text
    showInstructions(instructions = []) {
        fill(0);
        textSize(16);
        textAlign(CENTER);

        instructions.forEach((text, index) => {
            window.text(text, width / 2, 30 + (index * 20));
        });
    }

    // Check if player fell off screen
    checkPlayerFell(resetX, resetY) {
        if (this.player && this.player.y > height + 100) {
            this.player.reset(resetX, resetY);
        }
    }

    // Create health bar
    createHealthBar(maxHealth = 5, options = {}) {
        this.healthBar = new HealthBar(maxHealth, options);
        if (this.player) {
            this.player.setHealthBar(this.healthBar);
        }
        return this.healthBar;
    }

    // Check if player is dead and trigger game over
    checkGameOver() {
        if (this.healthBar && this.healthBar.isDead() && !this.isGameOver) {
            this.isGameOver = true;
            return true;
        }
        return false;
    }

    // Draw game over screen
    drawGameOver() {
        if (this.isGameOver) {
            push();

            // Semi-transparent overlay
            fill(0, 0, 0, 180);
            rect(0, 0, width, height);

            // Game Over text
            fill(255, 0, 0);
            textAlign(CENTER, CENTER);
            textSize(64);
            text('GAME OVER', width / 2, height / 2 - 50);

            // Restart instruction
            fill(255);
            textSize(24);
            text('Press R to Restart', width / 2, height / 2 + 20);

            pop();

            // Check for restart key
            if (kb.presses('r')) {
                this.restartLevel();
            }
        }
    }

    // Restart the current level
    restartLevel() {
        this.isGameOver = false;
        if (this.healthBar) {
            this.healthBar.reset();
        }

        // Call the game over callback if set (to reset level-specific objects)
        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
    }

    // Set a callback function to be called when restarting
    setRestartCallback(callback) {
        this.gameOverCallback = callback;
    }
}

// Global game instance
let game = new Game();

// Prevent default browser behavior for game keys (stops page scrolling)
window.addEventListener('keydown', function (e) {
    // Prevent scrolling for spacebar, arrow keys
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
});
