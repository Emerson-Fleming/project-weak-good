// Player.js
// Player class with movement and physics

class Player {
    constructor(x, y, options = {}) {
        this._initSprite(x, y, options);
        this._initMovement(options);
        this._initTongue(options);
        this._initWallJump(options);
        this._initHealth(options);
        this._initSword(options);
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize player sprite
     * @private
     */
    _initSprite(x, y, options) {
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = options.width || 50;
        this.sprite.height = options.height || 50;
        this.sprite.color = options.color || 'green';
        this.sprite.rotationLock = true;
        this.originalColor = options.color || 'green';

        // Face images for different states
        this.faceImages = {
            full: null,      // Default state
            mouth: null,     // When using tongue (clicking)
            psychic: null,   // When teleporting (shift)
            eye: null        // When attacking (E key)
        };
        this.currentFaceState = 'full';
    }

    /**
     * Load face images - call this in preload()
     */
    static preloadFaceImages() {
        Player.faceImagesFull = loadImage('assets/images/face-full-small.png');
        Player.faceImagesMouth = loadImage('assets/images/face-mouth-small.png');
        Player.faceImagesPsychic = loadImage('assets/images/face-psychic-small.png');
        Player.faceImagesEye = loadImage('assets/images/face-eye-small.png');
    }

    /**
     * Set the loaded face images after preload
     */
    setFaceImages() {
        this.faceImages.full = Player.faceImagesFull;
        this.faceImages.mouth = Player.faceImagesMouth;
        this.faceImages.psychic = Player.faceImagesPsychic;
        this.faceImages.eye = Player.faceImagesEye;

        // Set initial sprite image
        if (this.faceImages.full) {
            this.sprite.img = this.faceImages.full;
            // Force sprite to maintain its size (50x50)
            this.sprite.width = 50;
            this.sprite.height = 50;
        }
    }

    /**
     * Change the face image based on state
     * @param {string} state - 'full', 'mouth', 'psychic', or 'eye'
     */
    setFaceState(state) {
        if (this.faceImages[state]) {
            this.currentFaceState = state;
            this.sprite.img = this.faceImages[state];
            // Force sprite to maintain its size (50x50)
            this.sprite.width = 50;
            this.sprite.height = 50;
        }
    }

    /**
     * Initialize movement settings
     * @private
     */
    _initMovement(options) {
        this.moveSpeed = options.moveSpeed || 5;
        this.jumpForce = options.jumpForce || 8;
        this.coyoteTime = options.coyoteTime || 150;
        this.lastGroundedTime = 0;
        this.platforms = null;
        this.enemies = [];
    }

    /**
     * Initialize tongue/grapple settings
     * @private
     */
    _initTongue(options) {
        // Tongue settings
        this.tongueMaxLength = options.tongueMaxLength || 300;
        this.tongueSpeed = options.tongueSpeed || 15;
        this.tongueRetractSpeed = options.tongueRetractSpeed || 10;
        this.tonguePullSpeed = options.tonguePullSpeed || 8;
        this.tongueColor = options.tongueColor || 'pink';
        this.tongueThickness = options.tongueThickness || 8;

        // Tongue state
        this.tongueState = 'idle'; // 'idle', 'extending', 'attached', 'attached_platform', 'retracting'
        this.tongueLength = 0;
        this.tongueTarget = null;
        this.tongueAttachedPlatform = null;
        this.tongueAttachPoint = { x: 0, y: 0 };
        this.tongueEndX = 0;
        this.tongueEndY = 0;

        // Tongue direction
        this.tongueDirX = 1;
        this.tongueDirY = 0;
        this.tongueTargetX = 0;
        this.tongueTargetY = 0;

        // Grapple pull speed
        this.grapplePullSpeed = options.grapplePullSpeed || 10;
    }

    /**
     * Initialize wall jump settings
     * @private
     */
    _initWallJump(options) {
        this.wallJumpForceX = options.wallJumpForceX || 6;
        this.wallJumpForceY = options.wallJumpForceY || 8;
        this.wallSlideSpeed = options.wallSlideSpeed || 2;
        this.wallJumpCoyoteTime = options.wallJumpCoyoteTime || 100;
        this.lastWallTime = 0;
        this.lastWallDirection = 0; // -1 = wall on left, 1 = wall on right
        this.isOnWall = false;
    }

    /**
     * Initialize health/damage settings
     * @private
     */
    _initHealth(options) {
        this.healthBar = null;
        this.isInvulnerable = false;
        this.invulnerabilityDuration = 1000;
        this.isHit = false;
        this.hitFlashDuration = 300;
        this.hitFlashTime = 0;
    }

    /**
     * Initialize bullet attack settings
     * @private
     */
    _initSword(options) {
        // Player bullets
        this.bullets = [];
        this.bulletSpeed = options.bulletSpeed || 10;
        this.bulletColor = options.bulletColor || 'yellow';
        this.bulletSize = options.bulletSize || 8;
        this.bulletDamage = options.bulletDamage || 1;
        this.bulletCooldown = 500; // ms between shots (0.5 seconds)
        this.lastBulletTime = 0;

        // Track which direction player is facing
        this.facingRight = true;

        // Sound effects
        this.sounds = {
            jump: null,
            tongueHit: null,
            tongueOutIn: null,
            walkBeginning: null,
            walkEnd: null,
            walkMiddle: null
        };

        // Walking sound state
        this.isWalking = false;
        this.wasWalking = false;
        this.walkMiddlePlaying = false;
    }

    /**
     * Load player sound effects - call this in preload()
     */
    static preloadSounds() {
        Player.soundJump = loadSound('assets/sounds/jump.wav');
        Player.soundTongueHit = loadSound('assets/sounds/tongue hit.wav');
        Player.soundTongueOutIn = loadSound('assets/sounds/tongue out in.wav');
        Player.soundWalkBeginning = loadSound('assets/sounds/walk beginning.wav');
        Player.soundWalkEnd = loadSound('assets/sounds/walk end.wav');
        Player.soundWalkMiddle = loadSound('assets/sounds/walk middle.wav');
    }

    /**
     * Set the loaded sound effects after preload
     */
    setSounds() {
        this.sounds.jump = Player.soundJump;
        this.sounds.tongueHit = Player.soundTongueHit;
        this.sounds.tongueOutIn = Player.soundTongueOutIn;
        this.sounds.walkBeginning = Player.soundWalkBeginning;
        this.sounds.walkEnd = Player.soundWalkEnd;
        this.sounds.walkMiddle = Player.soundWalkMiddle;
    }

    // ==================== SETUP ====================

    /**
     * Set the platforms group for collision detection
     * @param {Group} platformGroup
     */
    setPlatforms(platformGroup) {
        this.platforms = platformGroup;
    }

    /**
     * Register an enemy for tongue interaction
     * @param {Enemy} obj
     */
    addEnemy(obj) {
        this.enemies.push(obj);
    }

    /**
     * Set the health bar reference
     * @param {HealthBar} healthBar
     */
    setHealthBar(healthBar) {
        this.healthBar = healthBar;
    }

    // ==================== DAMAGE & HEALTH ====================

    /**
     * Called when player is hit by a bullet
     */
    onHit() {
        if (this.isInvulnerable) return;

        this.isHit = true;
        this.hitFlashTime = millis();
        this.isInvulnerable = true;

        if (this.healthBar) {
            this.healthBar.damage(1);
        }
    }

    /**
     * Draw hit flash effect and manage invulnerability
     */
    drawHitEffect() {
        this._updateInvulnerability();
        this._updateHitFlash();
    }

    /**
     * Update invulnerability timer
     * @private
     */
    _updateInvulnerability() {
        if (!this.isInvulnerable) return;

        const elapsed = millis() - this.hitFlashTime;
        if (elapsed >= this.invulnerabilityDuration) {
            this.isInvulnerable = false;
            this.isHit = false;
            this.sprite.color = this.originalColor;
        }
    }

    /**
     * Update hit flash visual effect
     * @private
     */
    _updateHitFlash() {
        if (!this.isHit) return;

        const elapsed = millis() - this.hitFlashTime;

        if (elapsed < this.hitFlashDuration) {
            // Flash between white and original color
            const flash = sin(elapsed * 0.1);
            this.sprite.color = flash > 0 ? 'white' : this.originalColor;
        } else if (!this.isInvulnerable) {
            this.isHit = false;
            this.sprite.color = this.originalColor;
        }
    }

    // ==================== JUMPING ====================

    /**
     * Check if player can jump (on ground or within coyote time)
     * @returns {boolean}
     */
    canJump() {
        // Currently on a platform
        if (this.platforms && this.sprite.colliding(this.platforms)) {
            return true;
        }
        // Within coyote time
        return millis() - this.lastGroundedTime < this.coyoteTime;
    }

    /**
     * Check if player can wall jump
     * @returns {boolean}
     */
    canWallJump() {
        return this.isOnWall || (millis() - this.lastWallTime < this.wallJumpCoyoteTime);
    }

    /**
     * Check if player is touching a wall
     * @returns {boolean}
     */
    checkWallCollision() {
        if (!this.platforms) return false;

        this.isOnWall = false;

        for (let platform of this.platforms) {
            if (!this.sprite.colliding(platform)) continue;

            const wallSide = this._getWallSide(platform);
            if (wallSide !== 0) {
                this.isOnWall = true;
                this.lastWallDirection = wallSide;
                this.lastWallTime = millis();
                return true;
            }
        }
        return false;
    }

    /**
     * Determine which side of a platform the player is touching
     * @private
     * @returns {number} -1 for left wall, 1 for right wall, 0 for not a wall
     */
    _getWallSide(platform) {
        const playerBounds = GameUtils.getSpriteBounds(this.sprite);
        const platBounds = GameUtils.getSpriteBounds(platform);

        // Not standing on top
        const isAbovePlatform = playerBounds.bottom <= platBounds.top + 10;
        if (isAbovePlatform) return 0;

        // Check left side of platform (wall on player's right)
        if (playerBounds.right >= platBounds.left && playerBounds.right <= platBounds.left + 15 &&
            playerBounds.bottom > platBounds.top && playerBounds.top < platBounds.bottom) {
            return 1;
        }

        // Check right side of platform (wall on player's left)
        if (playerBounds.left <= platBounds.right && playerBounds.left >= platBounds.right - 15 &&
            playerBounds.bottom > platBounds.top && playerBounds.top < platBounds.bottom) {
            return -1;
        }

        return 0;
    }

    // ==================== TONGUE MECHANICS ====================

    /**
     * Handle tongue state machine and interactions
     */
    handleTongue() {
        this._handleTongueInput();
        this._updateTongueEndPosition();

        switch (this.tongueState) {
            case 'extending':
                this._handleTongueExtending();
                break;
            case 'attached':
                this._handleTongueAttached();
                break;
            case 'attached_platform':
                this._handleTonguePlatformAttached();
                break;
            case 'retracting':
                this._handleTongueRetracting();
                break;
        }
    }

    /**
     * Handle tongue mouse input
     * @private
     */
    _handleTongueInput() {
        // Start extending on click while idle
        if (mouse.presses() && this.tongueState === 'idle') {
            this._startTongueExtend();
        }

        // Release early on click while attached
        if (mouse.presses() && (this.tongueState === 'attached' || this.tongueState === 'attached_platform')) {
            this._releaseTongue();
        }
    }

    /**
     * Start tongue extension toward mouse position
     * @private
     */
    _startTongueExtend() {
        this.tongueState = 'extending';
        this.tongueLength = 0;

        // Change to mouth face
        this.setFaceState('mouth');

        // Convert mouse position from screen to world coordinates
        // mouseX/mouseY are screen coords, need to add camera offset
        const worldMouseX = mouseX + (camera.x - width / 2);
        const worldMouseY = mouseY + (camera.y - height / 2);

        this.tongueTargetX = worldMouseX;
        this.tongueTargetY = worldMouseY;

        const { dirX, dirY } = GameUtils.normalizeVector(
            this.tongueTargetX - this.sprite.x,
            this.tongueTargetY - this.sprite.y
        );
        this.tongueDirX = dirX;
        this.tongueDirY = dirY;

        this.tongueTarget = null;
        this.tongueAttachedPlatform = null;
    }

    /**
     * Release the tongue from whatever it's attached to
     * @private
     */
    _releaseTongue() {
        this.tongueState = 'retracting';
        this.tongueTarget = null;
        this.tongueAttachedPlatform = null;
    }

    /**
     * Update tongue end position based on direction
     * @private
     */
    _updateTongueEndPosition() {
        this.tongueEndX = this.sprite.x + (this.tongueLength * this.tongueDirX);
        this.tongueEndY = this.sprite.y + (this.tongueLength * this.tongueDirY);
    }

    /**
     * Handle tongue extending state
     * @private
     */
    _handleTongueExtending() {
        this.tongueLength += this.tongueSpeed;

        // Check enemy hits
        for (let obj of this.enemies) {
            if (obj.checkTongueHit(this.tongueEndX, this.tongueEndY)) {
                this.tongueState = 'attached';
                this.tongueTarget = obj;
                // Play tongue hit sound
                if (this.sounds.tongueHit && !this.sounds.tongueHit.isPlaying()) {
                    this.sounds.tongueHit.play();
                }
                return;
            }
        }

        // Check platform hits
        if (this.platforms) {
            for (let platform of this.platforms) {
                if (this._checkTongueHitPlatform(platform)) {
                    this.tongueState = 'attached_platform';
                    this.tongueAttachedPlatform = platform;
                    this.tongueAttachPoint.x = this.tongueEndX;
                    this.tongueAttachPoint.y = this.tongueEndY;
                    // Play tongue hit sound
                    if (this.sounds.tongueHit && !this.sounds.tongueHit.isPlaying()) {
                        this.sounds.tongueHit.play();
                    }
                    return;
                }
            }
        }

        // Max length reached
        if (this.tongueLength >= this.tongueMaxLength) {
            this.tongueState = 'retracting';
            // Play tongue out in sound (extended but didn't hit anything)
            if (this.sounds.tongueOutIn && !this.sounds.tongueOutIn.isPlaying()) {
                this.sounds.tongueOutIn.play();
            }
        }
    }

    /**
     * Handle tongue attached to enemy state
     * @private
     */
    _handleTongueAttached() {
        if (!this.tongueTarget) return;

        // Pull enemy toward player
        this.tongueTarget.pullToward(this.sprite.x, this.sprite.y, this.tonguePullSpeed);

        // Update tongue end to enemy position
        this.tongueEndX = this.tongueTarget.sprite.x;
        this.tongueEndY = this.tongueTarget.sprite.y;
        this.tongueLength = dist(this.sprite.x, this.sprite.y, this.tongueEndX, this.tongueEndY);

        // Release when close enough
        if (this.tongueLength < 60) {
            this._releaseTongue();
        }
    }

    /**
     * Handle tongue attached to platform state
     * @private
     */
    _handleTonguePlatformAttached() {
        if (!this.tongueAttachedPlatform) return;

        const dx = this.tongueAttachPoint.x - this.sprite.x;
        const dy = this.tongueAttachPoint.y - this.sprite.y;
        const d = dist(0, 0, dx, dy);

        if (d > 30) {
            // Pull player toward attach point
            const { dirX, dirY } = GameUtils.normalizeVector(dx, dy);
            this.sprite.velocity.x = dirX * this.grapplePullSpeed;
            this.sprite.velocity.y = dirY * this.grapplePullSpeed;
        } else {
            // Close enough, release
            this._releaseTongue();
        }

        // Update tongue visual
        this.tongueEndX = this.tongueAttachPoint.x;
        this.tongueEndY = this.tongueAttachPoint.y;
        this.tongueLength = d;
    }

    /**
     * Handle tongue retracting state
     * @private
     */
    _handleTongueRetracting() {
        this.tongueLength -= this.tongueRetractSpeed;
        if (this.tongueLength <= 0) {
            this.tongueLength = 0;
            this.tongueState = 'idle';
            // Return to full face when tongue is idle
            this.setFaceState('full');
        }
    }

    /**
     * Check if tongue tip hit a platform
     * @private
     * @param {Sprite} platform
     * @returns {boolean}
     */
    _checkTongueHitPlatform(platform) {
        return GameUtils.pointInRect(
            this.tongueEndX, this.tongueEndY,
            platform.x, platform.y,
            platform.width, platform.height
        );
    }

    /**
     * Draw the tongue in world coordinates (p5play camera handles transformation)
     */
    drawTongue() {
        if (this.tongueState === 'idle') return;

        push();
        stroke(this.tongueColor);
        strokeWeight(this.tongueThickness);

        // Draw in world coordinates - p5play's camera will handle the transformation
        // (same coordinate system as sprites)
        line(this.sprite.x, this.sprite.y, this.tongueEndX, this.tongueEndY);

        fill(this.tongueColor);
        noStroke();
        ellipse(this.tongueEndX, this.tongueEndY, this.tongueThickness + 4);
        pop();
    }

    // ==================== MOVEMENT ====================

    /**
     * Handle player movement input
     */
    handleMovement() {
        this._updateGroundedTime();
        this.checkWallCollision();
        this._handleWallSlide();
        this._handleHorizontalMovement();
        this._handleJumpInput();
    }

    /**
     * Track when player was last on ground
     * @private
     */
    _updateGroundedTime() {
        if (this.platforms && this.sprite.colliding(this.platforms)) {
            this.lastGroundedTime = millis();
        }
    }

    /**
     * Apply wall slide slowdown
     * @private
     */
    _handleWallSlide() {
        if (this.isOnWall && this.sprite.velocity.y > this.wallSlideSpeed) {
            this.sprite.velocity.y = this.wallSlideSpeed;
        }
    }

    /**
     * Handle horizontal movement input
     * @private
     */
    _handleHorizontalMovement() {
        const isMoving = keyIsDown(LEFT_ARROW) || keyIsDown(65) || keyIsDown(RIGHT_ARROW) || keyIsDown(68);

        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
            this.sprite.velocity.x = -this.moveSpeed;
            this.facingRight = false;
            this.sprite.mirror.x = true; // Flip sprite to face left
            this.isWalking = true;
        } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
            this.sprite.velocity.x = this.moveSpeed;
            this.facingRight = true;
            this.sprite.mirror.x = false; // Normal orientation (face right)
            this.isWalking = true;
        } else {
            this.sprite.velocity.x = 0;
            this.isWalking = false;
        }

        // Handle walking sounds
        this._handleWalkingSounds();

        // Update previous walking state
        this.wasWalking = this.isWalking;
    }

    /**
     * Handle walking sound effects
     * @private
     */
    _handleWalkingSounds() {
        // Started walking (walk beginning)
        if (this.isWalking && !this.wasWalking) {
            if (this.sounds.walkBeginning) {
                this.sounds.walkBeginning.play();
            }
            // Start walk middle loop after walk beginning finishes
            if (this.sounds.walkMiddle) {
                setTimeout(() => {
                    if (this.isWalking && !this.walkMiddlePlaying) {
                        this.sounds.walkMiddle.loop();
                        this.walkMiddlePlaying = true;
                    }
                }, 200); // Small delay to let walk beginning play
            }
        }
        // Stopped walking (walk end)
        else if (!this.isWalking && this.wasWalking) {
            // Stop walk middle loop
            if (this.sounds.walkMiddle && this.walkMiddlePlaying) {
                this.sounds.walkMiddle.stop();
                this.walkMiddlePlaying = false;
            }
            // Play walk end
            if (this.sounds.walkEnd) {
                this.sounds.walkEnd.play();
            }
        }
    }

    /**
     * Handle jump input (regular and wall jump)
     * @private
     */
    _handleJumpInput() {
        if (!kb.presses('space') && !kb.presses('w') && !kb.presses('up_arrow')) return;

        if (this.canJump()) {
            // Regular jump
            this.sprite.velocity.y = -this.jumpForce;
            this.lastGroundedTime = 0;
            // Play jump sound
            if (this.sounds.jump && !this.sounds.jump.isPlaying()) {
                this.sounds.jump.play();
            }
        } else if (this.canWallJump()) {
            // Wall jump
            this.sprite.velocity.y = -this.wallJumpForceY;
            this.sprite.velocity.x = this.wallJumpForceX * this.lastWallDirection * -1;
            this.lastWallTime = 0;
            // Play jump sound
            if (this.sounds.jump && !this.sounds.jump.isPlaying()) {
                this.sounds.jump.play();
            }
        }
    }

    /**
     * Keep player within world bounds (optional - can set maxX to limit)
     * @param {number} minX - Minimum x position (default 0)
     * @param {number} maxX - Maximum x position (default unlimited)
     */
    keepInBounds(minX = 0, maxX = Infinity) {
        this.sprite.x = GameUtils.clamp(this.sprite.x, minX, maxX);
    }

    /**
     * Reset player to a position
     * @param {number} x
     * @param {number} y
     */
    reset(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.velocity.x = 0;
        this.sprite.velocity.y = 0;
        this.tongueState = 'idle';
        this.tongueLength = 0;
        this.tongueTarget = null;
        this.tongueAttachedPlatform = null;
    }

    // ==================== SWORD ATTACK ====================

    /**
     * Handle bullet attack input and logic
     */
    handleSwordAttack() {
        // Check if E key is pressed to shoot
        if (kb.presses('e')) {
            const now = millis();
            if (now - this.lastBulletTime >= this.bulletCooldown) {
                this._shootBullet();
                this.lastBulletTime = now;
                // Change to eye face briefly
                this.setFaceState('eye');
                setTimeout(() => {
                    if (this.currentFaceState === 'eye') {
                        this.setFaceState('full');
                    }
                }, 100);
            }
        }

        // Update bullets
        this._updateBullets();
    }

    /**
     * Shoot a bullet at the closest enemy
     * @private
     */
    _shootBullet() {
        if (!this.enemies || this.enemies.length === 0) return;

        // Find closest alive enemy
        let closestEnemy = null;
        let closestDist = Infinity;

        for (let enemy of this.enemies) {
            if (enemy.isDead || !enemy.sprite) continue;

            const d = dist(this.sprite.x, this.sprite.y, enemy.sprite.x, enemy.sprite.y);
            if (d < closestDist) {
                closestDist = d;
                closestEnemy = enemy;
            }
        }

        if (!closestEnemy) return;

        // Calculate direction to closest enemy
        const dx = closestEnemy.sprite.x - this.sprite.x;
        const dy = closestEnemy.sprite.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // Create bullet with velocity toward enemy
        this.bullets.push({
            x: this.sprite.x,
            y: this.sprite.y,
            vx: (dx / distance) * this.bulletSpeed,
            vy: (dy / distance) * this.bulletSpeed,
            life: 120, // frames
            target: closestEnemy
        });
    }

    /**
     * Update and check bullet collisions
     * @private
     */
    _updateBullets() {
        const bulletsToRemove = new Set();

        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];

            // Update position
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;

            // Check if bullet expired
            if (bullet.life <= 0) {
                bulletsToRemove.add(i);
                continue;
            }

            // Check collision with enemies
            for (let enemy of this.enemies) {
                if (enemy.isDead || !enemy.sprite) continue;

                const d = dist(bullet.x, bullet.y, enemy.sprite.x, enemy.sprite.y);

                if (d < 25) { // Hit detection radius
                    // If enemy has shield, do nothing
                    if (enemy.hasShield) {
                        console.log('Enemy blocked with shield!');
                    } else {
                        // Enemy has no shield, apply damage
                        if (typeof enemy.takeDamage === 'function') {
                            enemy.takeDamage(this.bulletDamage);
                        }
                    }
                    bulletsToRemove.add(i);
                    break;
                }
            }
        }

        // Remove hit/expired bullets
        this.bullets = this.bullets.filter((b, index) => !bulletsToRemove.has(index));
    }

    /**
     * Draw the bullets
     */
    drawSword() {
        // Draw all active bullets
        for (let bullet of this.bullets) {
            push();
            fill(this.bulletColor);
            noStroke();
            ellipse(bullet.x, bullet.y, this.bulletSize, this.bulletSize);
            pop();
        }
    }

    /**
     * Set which enemies can be attacked
     * @param {Array<Enemy>} enemies - Array of enemy objects
     */
    setEnemies(enemies) {
        this.enemies = enemies;
    }

    // ==================== UPDATE ====================

    /**
     * Main update method - call in draw()
     */
    update() {
        this.handleMovement();
        this.handleTongue();
        this.handleSwordAttack();
        this.keepInBounds();
        this.drawHitEffect();
        this.drawTongue();
        this.drawSword();
    }

    // ==================== POSITION ACCESSORS ====================

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
