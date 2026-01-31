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
        this.sprite.bounciness = options.bounciness || 0;

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
        this.tongueState = 'idle'; // 'idle', 'extending', 'attached', 'retracting'
        this.tongueLength = 0;
        this.tongueDirection = 1; // 1 = right, -1 = left
        this.tongueTarget = null; // The object the tongue grabbed
        this.tongueEndX = 0;
        this.tongueEndY = 0;

        // Reference to pullable objects
        this.pullableObjects = [];

        // Reference to platforms for collision detection
        this.platforms = null;
    }

    // Set the platforms group for collision detection
    setPlatforms(platformGroup) {
        this.platforms = platformGroup;
    }

    // Register pullable objects for tongue interaction
    addPullableObject(obj) {
        this.pullableObjects.push(obj);
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

    // Handle tongue mechanics
    handleTongue() {
        // Start tongue extension when E is pressed
        if (kb.presses('e') && this.tongueState === 'idle') {
            this.tongueState = 'extending';
            this.tongueLength = 0;
            // Direction based on last horizontal movement or current velocity
            if (this.sprite.velocity.x !== 0) {
                this.tongueDirection = this.sprite.velocity.x > 0 ? 1 : -1;
            }
            this.tongueTarget = null;
        }

        // Calculate tongue end position
        this.tongueEndX = this.sprite.x + (this.tongueLength * this.tongueDirection);
        this.tongueEndY = this.sprite.y;

        // Handle tongue states
        switch (this.tongueState) {
            case 'extending':
                this.tongueLength += this.tongueSpeed;
                
                // Check if tongue hit a pullable object
                for (let obj of this.pullableObjects) {
                    if (obj.checkTongueHit(this.tongueEndX, this.tongueEndY)) {
                        this.tongueState = 'attached';
                        this.tongueTarget = obj;
                        break;
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

            case 'retracting':
                this.tongueLength -= this.tongueRetractSpeed;
                if (this.tongueLength <= 0) {
                    this.tongueLength = 0;
                    this.tongueState = 'idle';
                }
                break;
        }
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

        // Horizontal movement
        if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
            this.sprite.velocity.x = -this.moveSpeed;
            this.tongueDirection = -1; // Update facing direction
        } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
            this.sprite.velocity.x = this.moveSpeed;
            this.tongueDirection = 1; // Update facing direction
        } else {
            this.sprite.velocity.x = 0;
        }

        // Jump control
        if (kb.presses('space') || kb.presses('w') || kb.presses('up_arrow')) {
            // Can jump if on platform OR within coyote time
            if (this.canJump()) {
                this.sprite.velocity.y = -this.jumpForce;
                // Reset coyote time after jumping so they can't double jump
                this.lastGroundedTime = 0;
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
    }

    // Update player (call in draw)
    update() {
        this.handleMovement();
        this.handleTongue();
        this.keepInBounds();
        this.drawTongue();
    }

    // Getters for position
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }

    // Setters for position
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
