// PullableObject.js
// An object that can be grabbed and pulled by the player's tongue

class PullableObject {
    constructor(x, y, options = {}) {
        // Create the sprite
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = options.width || 40;
        this.sprite.height = options.height || 40;
        this.sprite.color = options.color || 'yellow';
        this.sprite.bounciness = options.bounciness || 0.2;
        
        // Set collider type (dynamic so it can be pulled)
        this.sprite.collider = options.collider || 'dynamic';
        
        // Optional: make it a circle
        if (options.shape === 'circle') {
            this.sprite.diameter = options.diameter || 40;
        }
        
        // Friction when being pulled
        this.pullFriction = options.pullFriction || 0.9;
        
        // Hit detection radius (for tongue)
        this.hitRadius = options.hitRadius || Math.max(this.sprite.width, this.sprite.height) / 2 + 10;
        
        // Visual feedback when targeted
        this.isTargeted = false;
    }
    
    // Check if the tongue tip hit this object
    checkTongueHit(tongueX, tongueY) {
        let d = dist(tongueX, tongueY, this.sprite.x, this.sprite.y);
        let hit = d < this.hitRadius;
        this.isTargeted = hit;
        return hit;
    }
    
    // Pull the object toward a target position
    pullToward(targetX, targetY, pullSpeed) {
        // Calculate direction to target
        let dx = targetX - this.sprite.x;
        let dy = targetY - this.sprite.y;
        let d = dist(0, 0, dx, dy);
        
        if (d > 0) {
            // Normalize and apply pull speed
            let vx = (dx / d) * pullSpeed;
            let vy = (dy / d) * pullSpeed;
            
            // Set velocity toward target
            this.sprite.velocity.x = vx;
            this.sprite.velocity.y = vy;
        }
    }
    
    // Draw visual feedback (optional glow when targeted)
    drawFeedback() {
        if (this.isTargeted) {
            push();
            noFill();
            stroke(255, 255, 0, 150);
            strokeWeight(3);
            
            if (this.sprite.diameter) {
                ellipse(this.sprite.x, this.sprite.y, this.sprite.diameter + 10);
            } else {
                rectMode(CENTER);
                rect(this.sprite.x, this.sprite.y, this.sprite.width + 10, this.sprite.height + 10, 5);
            }
            pop();
        }
        this.isTargeted = false; // Reset each frame
    }
    
    // Update (call in draw)
    update() {
        this.drawFeedback();
    }
    
    // Getters for position
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    
    // Setters for position
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
