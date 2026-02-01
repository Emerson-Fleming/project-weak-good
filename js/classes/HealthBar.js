// HealthBar.js
// Visual health bar display for the player

class HealthBar {
    constructor(maxHealth = 5, options = {}) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this._initVisuals(options);
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize visual settings
     * @private
     */
    _initVisuals(options) {
        // Position
        this.x = options.x || 30;
        this.y = options.y || 30;

        // Visual settings
        this.heartSize = options.heartSize || 30;
        this.heartSpacing = options.heartSpacing || 10;
        this.fullColor = options.fullColor || 'red';
        this.emptyColor = options.emptyColor || 'gray';
        this.outlineColor = options.outlineColor || 'black';
        this.outlineWeight = options.outlineWeight || 2;
    }

    // ==================== HEALTH MANAGEMENT ====================

    /**
     * Reduce health by amount
     * @param {number} amount - Damage amount
     * @returns {number} - Current health after damage
     */
    damage(amount = 1) {
        this.currentHealth = max(0, this.currentHealth - amount);
        return this.currentHealth;
    }

    /**
     * Heal by amount
     * @param {number} amount - Heal amount
     * @returns {number} - Current health after healing
     */
    heal(amount = 1) {
        this.currentHealth = min(this.maxHealth, this.currentHealth + amount);
        return this.currentHealth;
    }

    /**
     * Reset to full health
     */
    reset() {
        this.currentHealth = this.maxHealth;
    }

    /**
     * Check if dead
     * @returns {boolean}
     */
    isDead() {
        return this.currentHealth <= 0;
    }

    // ==================== DRAWING ====================

    /**
     * Draw a heart shape
     * @param {number} x - Heart x position
     * @param {number} y - Heart y position
     * @param {number} size - Heart size
     * @param {boolean} filled - Whether heart is filled or empty
     */
    drawHeart(x, y, size, filled) {
        push();

        // Basic solid color hearts
        fill(filled ? this.fullColor : this.emptyColor);
        stroke(this.outlineColor);
        strokeWeight(this.outlineWeight);

        beginShape();
        vertex(x, y + size * 0.3);
        bezierVertex(x, y, x - size * 0.5, y, x - size * 0.5, y + size * 0.3);
        bezierVertex(x - size * 0.5, y + size * 0.6, x, y + size * 0.9, x, y + size);
        bezierVertex(x, y + size * 0.9, x + size * 0.5, y + size * 0.6, x + size * 0.5, y + size * 0.3);
        bezierVertex(x + size * 0.5, y, x, y, x, y + size * 0.3);
        endShape(CLOSE);

        pop();
    }

    /**
     * Draw the health bar (locked to top-left of screen)
     */
    draw() {
        push();
        
        // Calculate world coordinates that correspond to screen top-left
        // Camera is centered, so screen top-left in world coords is:
        const worldX = camera.x - width / 2;
        const worldY = camera.y - height / 2;
        
        // Draw hearts at fixed screen position by using world coordinates
        for (let i = 0; i < this.maxHealth; i++) {
            const heartX = worldX + this.x + (i * (this.heartSize + this.heartSpacing));
            const heartY = worldY + this.y;
            const filled = i < this.currentHealth;
            this.drawHeart(heartX, heartY, this.heartSize, filled);
        }
        pop();
    }

    /**
     * Update (call in draw)
     */
    update() {
        this.draw();
    }
}
