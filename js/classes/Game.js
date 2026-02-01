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
        this.backgroundImage = null; // Cached background
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
            { r: 62, g: 36, b: 19 },   // Very dark brown (deep shadow)
            { r: 191, g: 75, b: 17 },  // Reddish brown (warm highlight)
            { r: 119, g: 59, b: 23 },  // Classic medium brown (base tone)
            { r: 26, g: 15, b: 3 },    // Almost black brown (deepest shadow)
            { r: 110, g: 66, b: 39 }   // Light brown (highlight/edge)
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
        // Keep cached background for performance
    }

    // Set a callback function to be called when restarting
    setRestartCallback(callback) {
        this.gameOverCallback = callback;
    }

    // Create textured paper background with red, black, and brown blend (optimized)
    createPaperBackground() {
        // If background already exists and size matches, just draw it
        if (this.backgroundImage &&
            this.backgroundImage.width === width &&
            this.backgroundImage.height === height) {
            image(this.backgroundImage, 0, 0);
            return;
        }

        // Generate new background
        let cnv = createGraphics(width, height);

        // Red, black, and brown color palette (reduced for performance)
        let colorPalette = [
            { r: 20, g: 10, b: 10 },      // Very dark brown
            { r: 60, g: 25, b: 20 },      // Deep reddish brown
            { r: 80, g: 30, b: 25 },      // Dark red-brown
            { r: 100, g: 35, b: 30 },     // Medium dark red-brown
            { r: 90, g: 20, b: 20 },      // Dark red
            { r: 130, g: 50, b: 40 }      // Burnt sienna
        ];

        // Base color - dark red-brown
        cnv.background(60, 30, 25);

        // Reduced number of organic patches for performance
        let numPatches = (width * height) / 3000; // Reduced from 1500
        cnv.noStroke();

        for (let i = 0; i < numPatches; i++) {
            let shade = random(colorPalette);
            let alpha = random(20, 50);
            cnv.fill(shade.r, shade.g, shade.b, alpha);

            let x = random(-width * 0.1, width * 1.1);
            let y = random(-height * 0.1, height * 1.1);
            let size = random(100, 250);

            // Simplified shape with fewer vertices
            cnv.push();
            cnv.translate(x, y);
            cnv.rotate(random(TWO_PI));
            cnv.beginShape();
            for (let angle = 0; angle < TWO_PI; angle += 0.8) { // Increased step for fewer vertices
                let r = size + random(-size * 0.3, size * 0.3);
                let px = cos(angle) * r;
                let py = sin(angle) * r;
                cnv.vertex(px, py);
            }
            cnv.endShape(CLOSE);
            cnv.pop();
        }

        // Reduced fiber count
        let fiberCount = (width * height) / 300; // Reduced from 100
        for (let i = 0; i < fiberCount; i++) {
            let shade = random(colorPalette);
            cnv.stroke(shade.r, shade.g, shade.b, random(10, 20));
            cnv.strokeWeight(random(1, 2));

            let x = random(width);
            let y = random(height);
            let len = random(20, 40);
            let angle = random(TWO_PI);

            // Simple line instead of curve
            cnv.line(x, y, x + cos(angle) * len, y + sin(angle) * len);
        }

        // Cache the background
        this.backgroundImage = cnv;

        // Draw the cached background
        image(this.backgroundImage, 0, 0);
    }

    // Create textured stone/concrete wall with shades of grey
    createWallTexture(w, h) {
        let cnv = createGraphics(w, h);

        // Expanded grey color palette with more contrast for popping accents
        let greyPalette = [
            { r: 15, g: 15, b: 15 },    // Almost black (deep shadows)
            { r: 35, g: 35, b: 35 },    // Very dark grey
            { r: 60, g: 60, b: 60 },    // Dark grey
            { r: 85, g: 85, b: 85 },    // Medium-dark grey
            { r: 110, g: 110, b: 110 }, // Medium grey
            { r: 140, g: 140, b: 140 }, // Medium-light grey
            { r: 170, g: 170, b: 170 }, // Light grey
            { r: 200, g: 200, b: 200 }  // Very light grey (bright highlights)
        ];

        // Base color - medium grey
        cnv.background(90, 90, 90);

        // Add organic stone texture patches with higher contrast
        let numPatches = (w * h) / 800;
        cnv.noStroke();

        for (let i = 0; i < numPatches; i++) {
            let shade = random(greyPalette);
            let alpha = random(40, 80); // Increased alpha for more visible patches
            cnv.fill(shade.r, shade.g, shade.b, alpha);

            let x = random(-w * 0.1, w * 1.1);
            let y = random(-h * 0.1, h * 1.1);
            let size = random(w * 0.15, w * 0.3);

            // Draw irregular organic shapes
            cnv.push();
            cnv.translate(x, y);
            cnv.rotate(random(TWO_PI));
            cnv.beginShape();
            for (let angle = 0; angle < TWO_PI; angle += 0.8) {
                let r = size + random(-size * 0.3, size * 0.3);
                let px = cos(angle) * r;
                let py = sin(angle) * r;
                cnv.vertex(px, py);
            }
            cnv.endShape(CLOSE);
            cnv.pop();
        }

        // Add prominent stone cracks/lines with more contrast
        let lineCount = (w * h) / 400; // Increased density
        for (let i = 0; i < lineCount; i++) {
            let shade = random(greyPalette);
            cnv.stroke(shade.r, shade.g, shade.b, random(40, 90)); // Higher alpha for visibility
            cnv.strokeWeight(random(0.8, 2.5)); // Thicker lines

            let x = random(w);
            let y = random(h);
            let len = random(w * 0.1, w * 0.4); // Longer lines
            let angle = random(TWO_PI);

            cnv.line(x, y, x + cos(angle) * len, y + sin(angle) * len);
        }

        // Add accent highlights and shadows (new!)
        let accentCount = (w * h) / 600;
        cnv.noStroke();
        for (let i = 0; i < accentCount; i++) {
            // Alternate between bright highlights and dark shadows
            let isHighlight = random() > 0.5;
            if (isHighlight) {
                cnv.fill(200, 200, 200, random(60, 100)); // Bright white accents
            } else {
                cnv.fill(20, 20, 20, random(60, 100)); // Dark black accents
            }

            let x = random(w);
            let y = random(h);
            let size = random(3, 8);
            cnv.circle(x, y, size);
        }

        // Add texture dots for grain with more variety
        let dotCount = (w * h) / 120; // Increased density
        cnv.noStroke();
        for (let i = 0; i < dotCount; i++) {
            let shade = random(greyPalette);
            cnv.fill(shade.r, shade.g, shade.b, random(20, 50)); // Higher alpha
            let x = random(w);
            let y = random(h);
            cnv.circle(x, y, random(1, 3)); // Slightly larger
        }

        return cnv;
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
