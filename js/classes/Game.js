// Game.js
// Core game manager class for shared functionality across levels

class Game {
    constructor() {
        this.currentLevel = null;
        this.platforms = null;
        this.player = null;
        this.healthBar = null;
        this.isGameOver = false;
        this.gameOverCallback = null;
        this.backgroundImage = null; // Cached background

        // Camera/scrolling settings
        this.camera = {
            x: 0,
            y: 0,
            enabled: false,
            scrollThresholdRight: 0.8, // Scroll when player is in right 20% (0.8 = 80% from left)
            scrollThresholdLeft: 0.2,  // Scroll when player is in left 20%
            scrollSpeed: 0.1,           // Smoothing factor (0-1, higher = faster)
            minX: 0,                    // Minimum camera x (left bound)
            maxX: null,                 // Maximum camera x (right bound, null = unlimited)
            followY: false              // Whether to follow player vertically
        };
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize common game elements
     * @returns {Game} - Returns this for chaining
     */
    init() {
        this.platforms = new Group();
        this.platforms.color = 'green';
        this.platforms.collider = 'static';

        // Initialize camera position
        camera.x = width / 2;
        camera.y = height / 2;

        return this;
    }

    /**
     * Set up world gravity
     * @param {number} gravityY - Gravity strength (default 20)
     */
    initializeGravity(gravityY = 20) {
        world.gravity.y = gravityY;
    }

    // ==================== ENTITY CREATION ====================

    /**
     * Create the player
     * @param {number} x - Starting x position
     * @param {number} y - Starting y position
     * @param {Object} options - Player options
     * @returns {Player}
     */
    createPlayer(x, y, options = {}) {
        this.player = new Player(x, y, options);
        this.player.setPlatforms(this.platforms);
        return this.player;
    }

    /**
     * Create a basic static platform
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {number} w - Width
     * @param {number} h - Height
     * @param {string} color - Platform color
     * @returns {Sprite}
     */
    createPlatform(x, y, w, h, color = 'green') {
        let platform = new this.platforms.Sprite();
        platform.x = x;
        platform.y = y;
        platform.width = w;
        platform.height = h;
        platform.color = color;
        return platform;
    }

    /**
     * Create ground platform with textured paper look
     * @param {string} color - Ground color (unused, texture applied)
     * @param {number} groundWidth - Optional custom width (default: window width)
     * @returns {Sprite}
     */
    createGround(color = 'brown', groundWidth = null) {
        if (!this.ground) {
            this.ground = new this.platforms.Sprite();
            this.ground.collider = 'static';
        }

        // Store custom width for later use
        this.groundWidth = groundWidth;

        this._updateGroundPosition();
        const actualWidth = this.groundWidth || width;
        this.ground.img = this.createPaperGroundTexture(actualWidth, 50);
        this._setupGroundResizeListener();

        return this.ground;
    }

    /**
     * Update ground position and size
     * @private
     */
    _updateGroundPosition() {
        const actualWidth = this.groundWidth || width;
        // Position ground so it starts at x=0 and extends to the right
        this.ground.x = actualWidth / 2;
        this.ground.y = height - 25;
        this.ground.width = actualWidth;
        this.ground.height = 50;
    }

    /**
     * Set up resize listener for ground (only once)
     * @private
     */
    _setupGroundResizeListener() {
        if (this._resizeListenerAdded) return;

        window.addEventListener('resize', () => {
            this._updateGroundPosition();
            const actualWidth = this.groundWidth || width;
            this.ground.img = this.createPaperGroundTexture(actualWidth, 50);
        });
        this._resizeListenerAdded = true;
    }

    /**
     * Create health bar
     * @param {number} maxHealth - Maximum health
     * @param {Object} options - HealthBar options
     * @returns {HealthBar}
     */
    createHealthBar(maxHealth = 5, options = {}) {
        this.healthBar = new HealthBar(maxHealth, options);
        if (this.player) {
            this.player.setHealthBar(this.healthBar);
        }
        return this.healthBar;
    }

    // ==================== UI & DISPLAY ====================

    /**
     * Display instruction text at top of screen (fixed to screen)
     * @param {string[]} instructions - Array of instruction lines
     */
    showInstructions(instructions = []) {
        push();
        fill(0);
        textSize(16);
        textAlign(CENTER);

        // Draw in world coordinates (camera position + screen position)
        const screenCenterX = camera.x;
        const screenTopY = camera.y - height / 2;

        instructions.forEach((text, index) => {
            window.text(text, screenCenterX, screenTopY + 30 + (index * 20));
        });
        pop();
    }

    /**
     * Redirect to game over page
     */
    redirectToGameOver() {
        window.location.href = 'gameover.html';
    }

    // ==================== GAME STATE ====================

    /**
     * Enable camera scrolling
     * @param {Object} options - Camera options
     */
    enableCamera(options = {}) {
        this.camera.enabled = true;
        if (options.scrollThresholdRight !== undefined) this.camera.scrollThresholdRight = options.scrollThresholdRight;
        if (options.scrollThresholdLeft !== undefined) this.camera.scrollThresholdLeft = options.scrollThresholdLeft;
        if (options.scrollSpeed !== undefined) this.camera.scrollSpeed = options.scrollSpeed;
        if (options.minX !== undefined) this.camera.minX = options.minX;
        if (options.maxX !== undefined) this.camera.maxX = options.maxX;
        if (options.followY !== undefined) this.camera.followY = options.followY;
    }

    /**
     * Disable camera scrolling
     */
    disableCamera() {
        this.camera.enabled = false;
        this.camera.x = 0;
        this.camera.y = 0;
    }

    /**
     * Update camera position based on player position
     */
    updateCamera() {
        if (!this.camera.enabled || !this.player) return;

        const playerScreenX = this.player.sprite.x - this.camera.x;
        const playerScreenY = this.player.sprite.y - this.camera.y;

        // Horizontal scrolling
        const rightThreshold = width * this.camera.scrollThresholdRight;
        const leftThreshold = width * this.camera.scrollThresholdLeft;

        // Scroll right when player is in right threshold
        if (playerScreenX > rightThreshold) {
            const targetX = this.player.sprite.x - rightThreshold;
            this.camera.x += (targetX - this.camera.x) * this.camera.scrollSpeed;
        }
        // Scroll left when player is in left threshold
        else if (playerScreenX < leftThreshold) {
            const targetX = this.player.sprite.x - leftThreshold;
            this.camera.x += (targetX - this.camera.x) * this.camera.scrollSpeed;
        }

        // Apply camera bounds
        if (this.camera.minX !== null) {
            this.camera.x = Math.max(this.camera.minX, this.camera.x);
        }
        if (this.camera.maxX !== null) {
            this.camera.x = Math.min(this.camera.maxX, this.camera.x);
        }

        // Vertical scrolling (optional)
        if (this.camera.followY) {
            const centerY = height / 2;
            const targetY = this.player.sprite.y - centerY;
            this.camera.y += (targetY - this.camera.y) * this.camera.scrollSpeed;
        }

        // Apply camera transformation using p5play camera
        camera.x = this.camera.x + width / 2;
        camera.y = this.camera.y + height / 2;
    }

    /**
     * Reset camera to origin
     */
    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        camera.x = width / 2;
        camera.y = height / 2;
    }

    /**
     * Check if player fell off screen and reset
     * @param {number} resetX - Reset x position
     * @param {number} resetY - Reset y position
     */
    checkPlayerFell(resetX, resetY) {
        if (this.player && this.player.y > height + 100) {
            this.player.reset(resetX, resetY);
        }
    }

    /**
     * Check if player is dead and trigger game over
     * @returns {boolean} - True if game just ended
     */
    checkGameOver() {
        if (this.healthBar && this.healthBar.isDead() && !this.isGameOver) {
            this.isGameOver = true;
            this.redirectToGameOver();
            return true;
        }
        return false;
    }

    /**
     * Restart the current level
     */
    restartLevel() {
        this.isGameOver = false;
        this.cleanup();
        this.resetCamera();

        if (this.healthBar) {
            this.healthBar.reset();
        }

        if (this.gameOverCallback) {
            this.gameOverCallback();
        }
    }

    /**
     * Clean up all game objects and sprites
     */
    cleanup() {
        if (this.player && this.player.sprite) {
            this.player.sprite.remove();
        }
        if (this.platforms) {
            this.platforms.removeAll();
        }

        this.player = null;
        this.platforms = null;
        this.ground = null;
        this.resetCamera();
        // Keep cached background for performance
    }

    /**
     * Set callback for level restart
     * @param {Function} callback - Function to call on restart
     */
    setRestartCallback(callback) {
        this.gameOverCallback = callback;
    }

    // ==================== TEXTURE GENERATION ====================

    /**
     * Create textured paper ground with brown shades
     * @param {number} w - Width
     * @param {number} h - Height
     * @returns {Graphics} - p5 Graphics object
     */
    createPaperGroundTexture(w, h) {
        let cnv = createGraphics(w, h);
        const palette = ColorPalettes.brown;

        // Base color
        cnv.background(180, 130, 80);

        // Add texture patches
        const patchCount = (w * h) / 80;
        TextureUtils.addTexturePatches(cnv, w, h, palette, patchCount);

        // Add paper fibers
        const fiberCount = (w * h) / 40;
        TextureUtils.addPaperFibers(cnv, w, h, palette, fiberCount, {
            minAlpha: 8, maxAlpha: 20
        });

        // Add noise and blur
        TextureUtils.addPixelNoise(cnv, 8);
        cnv.filter(BLUR, 0.3);

        return cnv;
    }

    /**
     * Create and draw paper background (cached for performance)
     */
    createPaperBackground() {
        // Use cached background if available and correct size
        if (this.backgroundImage &&
            this.backgroundImage.width === width &&
            this.backgroundImage.height === height) {
            image(this.backgroundImage, 0, 0);
            return;
        }

        let cnv = createGraphics(width, height);
        const palette = ColorPalettes.redBrown;

        // Base color
        cnv.background(60, 30, 25);

        // Reduced patches for performance
        const patchCount = (width * height) / 3000;
        TextureUtils.addTexturePatches(cnv, width, height, palette, patchCount, {
            minAlpha: 20, maxAlpha: 50,
            minSize: 100, maxSize: 250,
            angleStep: 0.8
        });

        // Reduced fibers
        const fiberCount = (width * height) / 300;
        TextureUtils.addPaperFibers(cnv, width, height, palette, fiberCount, {
            minAlpha: 10, maxAlpha: 20,
            minLength: 20, maxLength: 40,
            useCurves: false
        });

        // Cache and draw
        this.backgroundImage = cnv;
        image(this.backgroundImage, 0, 0);
    }

    /**
     * Create textured stone/concrete wall texture
     * @param {number} w - Width
     * @param {number} h - Height
     * @returns {Graphics} - p5 Graphics object
     */
    createWallTexture(w, h) {
        let cnv = createGraphics(w, h);
        const palette = ColorPalettes.grey;

        // Base color
        cnv.background(90, 90, 90);

        // Stone texture patches
        const patchCount = (w * h) / 800;
        TextureUtils.addTexturePatches(cnv, w, h, palette, patchCount, {
            minAlpha: 40, maxAlpha: 80,
            minSize: w * 0.15, maxSize: w * 0.3,
            angleStep: 0.8
        });

        // Stone cracks/lines
        const lineCount = (w * h) / 400;
        TextureUtils.addPaperFibers(cnv, w, h, palette, lineCount, {
            minAlpha: 40, maxAlpha: 90,
            minWeight: 0.8, maxWeight: 2.5,
            minLength: w * 0.1, maxLength: w * 0.4,
            useCurves: false
        });

        // Accent highlights and shadows
        this._addWallAccents(cnv, w, h);

        // Texture dots
        this._addWallGrain(cnv, w, h, palette);

        return cnv;
    }

    /**
     * Add highlight/shadow accents to wall texture
     * @private
     */
    _addWallAccents(cnv, w, h) {
        const accentCount = (w * h) / 600;
        cnv.noStroke();

        for (let i = 0; i < accentCount; i++) {
            const isHighlight = random() > 0.5;
            if (isHighlight) {
                cnv.fill(200, 200, 200, random(60, 100));
            } else {
                cnv.fill(20, 20, 20, random(60, 100));
            }
            cnv.circle(random(w), random(h), random(3, 8));
        }
    }

    /**
     * Add grain dots to wall texture
     * @private
     */
    _addWallGrain(cnv, w, h, palette) {
        const dotCount = (w * h) / 120;
        cnv.noStroke();

        for (let i = 0; i < dotCount; i++) {
            const shade = random(palette);
            cnv.fill(shade.r, shade.g, shade.b, random(20, 50));
            cnv.circle(random(w), random(h), random(1, 3));
        }
    }
}

// Global game instance
let game = new Game();

// Prevent default browser behavior for game keys
window.addEventListener('keydown', function (e) {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
});
