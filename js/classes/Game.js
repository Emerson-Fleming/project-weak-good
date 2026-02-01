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

    // Create a basic ground platform with textured paper look
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

        // Create textured paper ground
        let groundTexture = this.createPaperGroundTexture(width, 50);
        this.ground.img = groundTexture;

        // Add resize listener only once
        if (!this._resizeListenerAdded) {
            window.addEventListener('resize', () => {
                // Update ground size and position on resize
                this.ground.x = width / 2;
                this.ground.y = height - 25;
                this.ground.width = width;
                this.ground.height = 50;

                // Regenerate texture on resize
                let groundTexture = this.createPaperGroundTexture(width, 50);
                this.ground.img = groundTexture;
            });
            this._resizeListenerAdded = true;
        }

        return this.ground;
    }

    // Create textured paper ground with multiple shades of brown
    createPaperGroundTexture(w, h) {
        let cnv = createGraphics(w, h);

        // Base brown colors (RGB for different shades)
        let brownShades = [
            { r: 139, g: 90, b: 43 },   // Dark brown
            { r: 160, g: 110, b: 60 },  // Medium-dark brown
            { r: 180, g: 130, b: 80 },  // Medium brown
            { r: 200, g: 150, b: 100 }, // Light-medium brown
            { r: 210, g: 165, b: 115 }  // Light brown
        ];

        // Fill with base medium brown
        cnv.background(180, 130, 80);

        // Add organic paper texture with multiple brown shades
        let numPatches = (w * h) / 80;
        cnv.noStroke();

        for (let i = 0; i < numPatches; i++) {
            // Pick a random brown shade
            let shade = random(brownShades);
            let alpha = random(10, 30);
            cnv.fill(shade.r, shade.g, shade.b, alpha);

            let x = random(-w * 0.1, w * 1.1);
            let y = random(-h * 0.1, h * 1.1);
            let size = random(30, 80);

            // Draw irregular organic shapes
            cnv.push();
            cnv.translate(x, y);
            cnv.rotate(random(TWO_PI));
            cnv.beginShape();
            for (let angle = 0; angle < TWO_PI; angle += 0.5) {
                let r = size + random(-size * 0.3, size * 0.3);
                let px = cos(angle) * r;
                let py = sin(angle) * r;
                cnv.vertex(px, py);
            }
            cnv.endShape(CLOSE);
            cnv.pop();
        }

        // Add paper fiber texture
        let fiberCount = (w * h) / 40;
        for (let i = 0; i < fiberCount; i++) {
            // Random brown shade for fibers
            let shade = random(brownShades);
            cnv.stroke(shade.r, shade.g, shade.b, random(8, 20));
            cnv.strokeWeight(random(0.5, 2));

            let x = random(-w * 0.2, w * 1.2);
            let y = random(-h * 0.2, h * 1.2);

            cnv.push();
            cnv.translate(x, y);
            cnv.rotate(random(TWO_PI));

            // Draw small curves for paper fibers
            let curveLength = random(10, 30);
            cnv.noFill();
            cnv.beginShape();
            cnv.curveVertex(0, 0);
            cnv.curveVertex(0, 0);
            cnv.curveVertex(curveLength * 0.3, random(-5, 5));
            cnv.curveVertex(curveLength * 0.7, random(-5, 5));
            cnv.curveVertex(curveLength, random(-3, 3));
            cnv.curveVertex(curveLength, random(-3, 3));
            cnv.endShape();
            cnv.pop();
        }

        // Add subtle noise/grain texture
        cnv.loadPixels();
        for (let i = 0; i < cnv.pixels.length; i += 4) {
            let noise = random(-8, 8);
            cnv.pixels[i] += noise;     // R
            cnv.pixels[i + 1] += noise; // G
            cnv.pixels[i + 2] += noise; // B
        }
        cnv.updatePixels();

        // Very subtle blur for organic look
        cnv.filter(BLUR, 0.3);

        return cnv;
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

        // Clean up all existing sprites and groups
        this.cleanup();

        if (this.healthBar) {
            this.healthBar.reset();
        }

        // Call the game over callback if set (to reset level-specific objects)
        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
    }

    // Clean up all game objects and sprites
    cleanup() {
        // Remove player sprite
        if (this.player && this.player.sprite) {
            this.player.sprite.remove();
        }

        // Remove all platforms
        if (this.platforms) {
            this.platforms.removeAll();
        }

        // Reset references
        this.player = null;
        this.platforms = null;
        this.ground = null;
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
