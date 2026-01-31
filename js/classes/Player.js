// Player.js
// Player class with movement and physics

class Player {
    constructor(x, y, options = {}) {
        // Create the sprite
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = options.width || 50;
        this.sprite.height = options.height || 50;
        this.sprite.color = options.color || 'green';
        this.sprite.rotationLock = true; // Prevent rotation

        // Movement settings
        this.moveSpeed = options.moveSpeed || 5;
        this.jumpForce = options.jumpForce || 8;

        // Coyote time settings (allows jumping shortly after leaving platform)
        this.coyoteTime = options.coyoteTime || 150; // milliseconds
        this.lastGroundedTime = 0;

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
        this.tongueTarget = null; // The object the tongue grabbed
        this.tongueAttachedPlatform = null; // Platform the tongue is attached to
        this.tongueAttachPoint = { x: 0, y: 0 }; // Point where tongue attached to platform
        this.tongueEndX = 0;
        this.tongueEndY = 0;

        // Tongue direction (normalized vector toward target)
        this.tongueDirX = 1;
        this.tongueDirY = 0;
        this.tongueTargetX = 0; // The clicked target position
        this.tongueTargetY = 0;

        // Grapple settings (for pulling player to platforms)
        this.grapplePullSpeed = options.grapplePullSpeed || 10;

        // Reference to pullable objects
        this.enemies = [];

        // Reference to platforms for collision detection
        this.platforms = null;

        // Health system
        this.healthBar = null; // Will be set externally
        this.isInvulnerable = false; // Temporary invulnerability after being hit
        this.invulnerabilityDuration = 1000; // ms

        // Hit/damage effect settings
        this.isHit = false;
        this.hitFlashDuration = 300; // ms
        this.hitFlashTime = 0;
        this.originalColor = options.color || 'green';

        // Wall jump settings
        this.wallJumpForceX = options.wallJumpForceX || 6; // Horizontal push away from wall
        this.wallJumpForceY = options.wallJumpForceY || 8; // Vertical jump force
        this.wallSlideSpeed = options.wallSlideSpeed || 2; // Slower fall when on wall
        this.wallJumpCoyoteTime = options.wallJumpCoyoteTime || 100; // ms to wall jump after leaving wall
        this.lastWallTime = 0;
        this.lastWallDirection = 0; // -1 = wall on left, 1 = wall on right
        this.isOnWall = false;
    }

    // Set the platforms group for collision detection
    setPlatforms(platformGroup) {
        this.platforms = platformGroup;
    }

    // Register pullable objects for tongue interaction
    addEnemy(obj) {
        this.enemies.push(obj);
    }

    // Called when player is hit by a bullet
    onHit() {
        // Don't take damage if invulnerable
        if (this.isInvulnerable) return;

        this.isHit = true;
        this.hitFlashTime = millis();
        this.isInvulnerable = true;

        // Reduce health
        if (this.healthBar) {
            this.healthBar.damage(1);
        }
    }

    // Set the health bar reference
    setHealthBar(healthBar) {
        this.healthBar = healthBar;
    }

    // Draw hit flash effect
    drawHitEffect() {
        // Check invulnerability timer
        if (this.isInvulnerable) {
            let elapsed = millis() - this.hitFlashTime;

            if (elapsed >= this.invulnerabilityDuration) {
                this.isInvulnerable = false;
                this.isHit = false;
                this.sprite.color = this.originalColor;
            }
        }

        if (this.isHit) {
            let elapsed = millis() - this.hitFlashTime;

            if (elapsed < this.hitFlashDuration) {
                // Flash between white and original color
                let flashSpeed = 0.1;
                let flash = sin(elapsed * flashSpeed);

                if (flash > 0) {
                    this.sprite.color = 'white';
                } else {
                    this.sprite.color = this.originalColor;
                }
            } else {
                // Flash done but still invulnerable - show slightly transparent
                if (this.isInvulnerable) {
                    this.sprite.color = this.originalColor;
                    // Could add transparency here if needed
                } else {
                    this.isHit = false;
                    this.sprite.color = this.originalColor;
                }
            }
        }
    }

    // Check if player can jump (on ground or within coyote time)
    canJump() {
        // Currently on a platform
        if (this.platforms && this.sprite.colliding(this.platforms)) {
            return true;
        }
        // Within coyote time window
        if (millis() - this.lastGroundedTime < this.coyoteTime) {
            return true;
        }
        return false;
    }

    // Check if player is touching a wall (side collision with platform)
    checkWallCollision() {
        if (!this.platforms) return false;

        this.isOnWall = false;

        for (let platform of this.platforms) {
            // Check if colliding with this platform
            if (this.sprite.colliding(platform)) {
                // Get the collision direction
                let playerLeft = this.sprite.x - this.sprite.width / 2;
                let playerRight = this.sprite.x + this.sprite.width / 2;
                let playerTop = this.sprite.y - this.sprite.height / 2;
                let playerBottom = this.sprite.y + this.sprite.height / 2;

                let platLeft = platform.x - platform.width / 2;
                let platRight = platform.x + platform.width / 2;
                let platTop = platform.y - platform.height / 2;
                let platBottom = platform.y + platform.height / 2;

                // Check if it's a side collision (not standing on top)
                let isAbovePlatform = playerBottom <= platTop + 10;

                if (!isAbovePlatform) {
                    // Check left side of platform
                    if (playerRight >= platLeft && playerRight <= platLeft + 15 &&
                        playerBottom > platTop && playerTop < platBottom) {
                        this.isOnWall = true;
                        this.lastWallDirection = 1; // Wall is on player's right
                        this.lastWallTime = millis();
                        return true;
                    }
                    // Check right side of platform
                    if (playerLeft <= platRight && playerLeft >= platRight - 15 &&
                        playerBottom > platTop && playerTop < platBottom) {
                        this.isOnWall = true;
                        this.lastWallDirection = -1; // Wall is on player's left
                        this.lastWallTime = millis();
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Check if player can wall jump
    canWallJump() {
        // Currently on wall
        if (this.isOnWall) {
            return true;
        }
        // Within wall coyote time
        if (millis() - this.lastWallTime < this.wallJumpCoyoteTime) {
            return true;
        }
        return false;
    }

    // Handle tongue mechanics
    handleTongue() {
        // Start tongue extension when mouse is clicked
        if (mouse.presses() && this.tongueState === 'idle') {
            this.tongueState = 'extending';
            this.tongueLength = 0;

            // Calculate direction toward mouse click
            this.tongueTargetX = mouseX;
            this.tongueTargetY = mouseY;
            let dx = this.tongueTargetX - this.sprite.x;
            let dy = this.tongueTargetY - this.sprite.y;
            let d = dist(0, 0, dx, dy);

            // Normalize direction
            if (d > 0) {
                this.tongueDirX = dx / d;
                this.tongueDirY = dy / d;
            }

            this.tongueTarget = null;
            this.tongueAttachedPlatform = null;
        }

        // Allow releasing tongue early by clicking again
        if (mouse.presses() && (this.tongueState === 'attached' || this.tongueState === 'attached_platform')) {
            this.tongueState = 'retracting';
            this.tongueTarget = null;
            this.tongueAttachedPlatform = null;
        }

        // Calculate tongue end position based on direction
        this.tongueEndX = this.sprite.x + (this.tongueLength * this.tongueDirX);
        this.tongueEndY = this.sprite.y + (this.tongueLength * this.tongueDirY);

        // Handle tongue states
        switch (this.tongueState) {
            case 'extending':
                this.tongueLength += this.tongueSpeed;

                // Check if tongue hit a pullable object
                for (let obj of this.enemies) {
                    if (obj.checkTongueHit(this.tongueEndX, this.tongueEndY)) {
                        this.tongueState = 'attached';
                        this.tongueTarget = obj;
                        return;
                    }
                }

                // Check if tongue hit a platform
                if (this.platforms) {
                    for (let platform of this.platforms) {
                        if (this.checkTongueHitPlatform(platform)) {
                            this.tongueState = 'attached_platform';
                            this.tongueAttachedPlatform = platform;
                            // Store the attach point
                            this.tongueAttachPoint.x = this.tongueEndX;
                            this.tongueAttachPoint.y = this.tongueEndY;
                            return;
                        }
                    }
                }

                // Retract if max length reached without hitting anything
                if (this.tongueLength >= this.tongueMaxLength) {
                    this.tongueState = 'retracting';
                }
                break;

            case 'attached':
                // Pull the object toward the player
                if (this.tongueTarget) {
                    this.tongueTarget.pullToward(this.sprite.x, this.sprite.y, this.tonguePullSpeed);

                    // Update tongue end to object position
                    this.tongueEndX = this.tongueTarget.sprite.x;
                    this.tongueEndY = this.tongueTarget.sprite.y;
                    this.tongueLength = dist(this.sprite.x, this.sprite.y, this.tongueEndX, this.tongueEndY);

                    // Release when object is close enough
                    if (this.tongueLength < 60) {
                        this.tongueState = 'retracting';
                        this.tongueTarget = null;
                    }
                }
                break;

            case 'attached_platform':
                // Pull the player toward the platform
                if (this.tongueAttachedPlatform) {
                    // Update attach point if platform moves (for teleporting platforms)
                    // The attach point stays relative to where we hit

                    // Calculate direction from player to attach point
                    let dx = this.tongueAttachPoint.x - this.sprite.x;
                    let dy = this.tongueAttachPoint.y - this.sprite.y;
                    let d = dist(0, 0, dx, dy);

                    if (d > 30) {
                        // Pull player toward the attach point
                        let pullX = (dx / d) * this.grapplePullSpeed;
                        let pullY = (dy / d) * this.grapplePullSpeed;

                        this.sprite.velocity.x = pullX;
                        this.sprite.velocity.y = pullY;
                    } else {
                        // Close enough, release
                        this.tongueState = 'retracting';
                        this.tongueAttachedPlatform = null;
                    }

                    // Update tongue end to attach point
                    this.tongueEndX = this.tongueAttachPoint.x;
                    this.tongueEndY = this.tongueAttachPoint.y;
                    this.tongueLength = d;
                }
                break;

            case 'retracting':
                this.tongueLength -= this.tongueRetractSpeed;
                if (this.tongueLength <= 0) {
                    this.tongueLength = 0;
                    this.tongueState = 'idle';
                }
                break;
        }
    }

    // Check if tongue tip hit a platform
    checkTongueHitPlatform(platform) {
        let platLeft = platform.x - platform.width / 2;
        let platRight = platform.x + platform.width / 2;
        let platTop = platform.y - platform.height / 2;
        let platBottom = platform.y + platform.height / 2;

        return (this.tongueEndX >= platLeft && this.tongueEndX <= platRight &&
            this.tongueEndY >= platTop && this.tongueEndY <= platBottom);
    }

    // Draw the tongue
    drawTongue() {
        if (this.tongueState === 'idle') return;

        push();
        stroke(this.tongueColor);
        strokeWeight(this.tongueThickness);

        // Draw tongue line
        line(this.sprite.x, this.sprite.y, this.tongueEndX, this.tongueEndY);

        // Draw tongue tip (circle)
        fill(this.tongueColor);
        noStroke();
        ellipse(this.tongueEndX, this.tongueEndY, this.tongueThickness + 4);

        pop();
    }

    // Handle player movement input
    handleMovement() {
        // Track when player was last on ground
        if (this.platforms && this.sprite.colliding(this.platforms)) {
            this.lastGroundedTime = millis();
        }

        // Check for wall collision
        this.checkWallCollision();

        // Wall slide - slow down falling when on wall
        if (this.isOnWall && this.sprite.velocity.y > this.wallSlideSpeed) {
            this.sprite.velocity.y = this.wallSlideSpeed;
        }

        // Horizontal movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
            this.sprite.velocity.x = -this.moveSpeed;
        } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
            this.sprite.velocity.x = this.moveSpeed;
        } else {
            this.sprite.velocity.x = 0;
        }

        // Jump control
        if (kb.presses('space') || kb.presses('w') || kb.presses('up_arrow')) {
            // Regular jump if on platform OR within coyote time
            if (this.canJump()) {
                this.sprite.velocity.y = -this.jumpForce;
                // Reset coyote time after jumping so they can't double jump
                this.lastGroundedTime = 0;
            }
            // Wall jump if on wall or within wall coyote time
            else if (this.canWallJump()) {
                // Jump up and away from the wall
                this.sprite.velocity.y = -this.wallJumpForceY;
                this.sprite.velocity.x = this.wallJumpForceX * this.lastWallDirection * -1; // Push away from wall
                // Reset wall jump time
                this.lastWallTime = 0;
            }
        }
    }

    // Keep player within canvas bounds
    keepInBounds() {
        if (this.sprite.x < 0) this.sprite.x = 0;
        if (this.sprite.x > width) this.sprite.x = width;
    }

    // Reset player to a position
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

    // Update player (call in draw)
    update() {
        this.handleMovement();
        this.handleTongue();
        this.keepInBounds();
        this.drawHitEffect();
        this.drawTongue();
    }

    // Getters for position
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    // Setters for position
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
