// Key.js
// A collectible key object

class Key {
    /**
     * Create a collectible key
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {Object} options - Key options
     */
    constructor(x, y, options = {}) {
        this.collected = false;
        this.size = options.size || 30;
        this.color = options.color || 'gold';
        this.glowColor = options.glowColor || 'yellow';
        this.bobSpeed = options.bobSpeed || 0.05;
        this.bobAmount = options.bobAmount || 5;
        this.rotateSpeed = options.rotateSpeed || 0.02;

        this.baseY = y;
        this.x = x;
        this.y = y;
        this.angle = 0;
        this.bobOffset = random(TWO_PI); // Random start phase for variety

        // Create collision sprite (invisible, just for detection)
        // Use 'none' collider so it doesn't collide with enemies or platforms
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = this.size;
        this.sprite.height = this.size;
        this.sprite.collider = 'none'; // No physics collision
        this.sprite.visible = false; // We'll draw custom graphics
    }

    /**
     * Update key animation and check for collection
     * @param {Player} player - Player object to check collision with
     * @returns {boolean} - True if key was just collected
     */
    update(player) {
        if (this.collected) return false;

        // Bob up and down
        this.y = this.baseY + sin(frameCount * this.bobSpeed + this.bobOffset) * this.bobAmount;
        this.sprite.y = this.y;

        // Don't rotate - keep angle at 0

        // Draw the key first
        this.draw();

        // Check collision with player
        if (player && player.sprite && this._checkCollision(player)) {
            this.collect();
            return true;
        }

        return false;
    }

    /**
     * Check collision with player
     * @private
     */
    _checkCollision(player) {
        if (!player || !player.sprite) return false;

        const playerX = player.sprite.x;
        const playerY = player.sprite.y;
        const d = dist(this.x, this.y, playerX, playerY);
        const collisionDist = this.size + player.sprite.width / 2; // More generous collision

        return d < collisionDist;
    }

    /**
     * Collect the key
     */
    collect() {
        console.log(`Key collected at (${Math.round(this.x)}, ${Math.round(this.y)})`);
        this.collected = true;
        if (this.sprite) {
            this.sprite.remove();
        }
    }

    /**
     * Draw the key
     */
    draw() {
        if (this.collected) return;
        if (!window.mcMuffinImage) return; // Safety check

        push();
        translate(this.x, this.y);
        // No rotation - removed rotate(this.angle)

        // Draw McMuffin image
        imageMode(CENTER);
        image(window.mcMuffinImage, 0, 0, this.size * 1.5, this.size * 1.5);

        pop();
    }

    /**
     * Remove the key
     */
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }
}

/**
 * Key Manager - Handles multiple keys and win condition
 */
class KeyManager {
    constructor() {
        this.keys = [];
        this.collectedCount = 0;
        this.totalKeys = 0;
        this.onAllCollected = null; // Callback when all keys collected
    }

    /**
     * Add a key to the manager
     * @param {number} x - Key x position
     * @param {number} y - Key y position
     * @param {Object} options - Key options
     */
    addKey(x, y, options = {}) {
        const key = new Key(x, y, options);
        this.keys.push(key);
        this.totalKeys++;
        return key;
    }

    /**
     * Update all keys
     * @param {Player} player - Player object
     */
    update(player) {
        for (let key of this.keys) {
            if (key.update(player)) {
                this.collectedCount++;
                console.log(`Key collected! ${this.collectedCount}/${this.totalKeys}`);

                // Check win condition
                if (this.collectedCount >= this.totalKeys && this.onAllCollected) {
                    this.onAllCollected();
                }
            }
        }
    }

    /**
     * Draw the key counter UI
     * @param {number} x - UI x position
     * @param {number} y - UI y position
     */
    drawUI(x = 30, y = 80) {
        push();

        // Background
        fill(0, 0, 0, 150);
        noStroke();
        rectMode(CORNER);
        rect(x - 10, y - 20, 120, 35, 8);

        // Key icon
        fill('gold');
        stroke(139, 119, 42);
        strokeWeight(2);

        // Mini key
        ellipse(x + 10, y, 15, 15);
        fill(50);
        noStroke();
        ellipse(x + 10, y, 5, 5);
        fill('gold');
        stroke(139, 119, 42);
        strokeWeight(2);
        rectMode(CENTER);
        rect(x + 10, y + 12, 5, 15);
        rect(x + 14, y + 17, 5, 3);

        // Counter text
        noStroke();
        fill(255);
        textSize(18);
        textAlign(LEFT, CENTER);
        text(`${this.collectedCount} / ${this.totalKeys}`, x + 35, y);

        pop();
    }

    /**
     * Remove all keys
     */
    removeAll() {
        for (let key of this.keys) {
            key.remove();
        }
        this.keys = [];
        this.collectedCount = 0;
        this.totalKeys = 0;
    }
}
