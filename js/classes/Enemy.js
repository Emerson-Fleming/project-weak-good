// Enemy.js
// An enemy that can be grabbed by the tongue and shoots projectiles

class Enemy {
    constructor(x, y, options = {}) {
        this._initSprite(x, y, options);
        this._initShield(options);
        this._initBullets(options);
    }

    // ==================== INITIALIZATION ====================

    /**
     * Initialize enemy sprite
     * @private
     */
    _initSprite(x, y, options) {
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = options.width || 40;
        this.sprite.height = options.height || 40;
        this.sprite.color = options.color || 'red';
        this.sprite.bounciness = options.bounciness || 0.2;
        this.sprite.collider = options.collider || 'dynamic';

        if (options.shape === 'circle') {
            this.sprite.diameter = options.diameter || 40;
        }

        this.pullFriction = options.pullFriction || 0.9;
        this.hitRadius = options.hitRadius || Math.max(this.sprite.width, this.sprite.height) / 2 + 10;
        this.isTargeted = false;

        // Enemy health
        this.maxHealth = options.maxHealth || 3;
        this.currentHealth = this.maxHealth;
        this.isDead = false;

        // Set image if provided
        if (options.img) {
            this.sprite.img = options.img;
            // Maintain the specified size
            this.sprite.width = options.width || 40;
            this.sprite.height = options.height || 40;
        }
    }

    /**
     * Initialize shield properties
     * @private
     */
    _initShield(options) {
        this.hasShield = options.hasShield || false;
        this.shieldEnabled = this.hasShield; // Track if shield was originally enabled
        this.shieldHealth = options.shieldHealth || 3;
        this.currentShieldHealth = this.shieldHealth;
        this.shieldColor = options.shieldColor || 'cyan';
        this.shieldRadius = options.shieldRadius || Math.max(this.sprite.width, this.sprite.height) / 2 + 15;
        this.shieldFlashing = false;
        this.shieldFlashTime = 0;
        this.shieldFlashDuration = 200; // ms

        // Shield regeneration
        this.shieldRegenTime = options.shieldRegenTime || 10000; // 15 seconds default
        this.shieldDestroyedTime = 0; // When the shield was destroyed
    }

    /**
     * Initialize bullet/attack properties
     * @private
     */
    _initBullets(options) {
        this.bullets = [];
        this.bulletSpeed = options.bulletSpeed || 8;
        this.bulletColor = options.bulletColor || 'purple';
        this.bulletSize = options.bulletSize || 12;
        this.shootInterval = options.shootInterval || 1200;
        this.lastShotTime = millis();

        // AI movement settings
        this.moveSpeed = options.moveSpeed || 1.5; // Slow movement toward player
        this.moveEnabled = options.moveEnabled !== false; // Can be disabled per enemy
        this.detectionRange = options.detectionRange || 500; // How far enemy can detect player
        this.stopDistance = options.stopDistance || 150; // Stop moving when this close to player
    }

    // ==================== TONGUE INTERACTION ====================

    /**
     * Check if tongue tip hit this enemy or shield
     * @param {number} tongueX - Tongue tip x
     * @param {number} tongueY - Tongue tip y
     * @returns {boolean} - True if enemy body was hit (not shield)
     */
    checkTongueHit(tongueX, tongueY) {
        const d = dist(tongueX, tongueY, this.sprite.x, this.sprite.y);

        // Check shield first
        if (this.hasShield && d < this.shieldRadius) {
            this.isTargeted = true;
            this._damageShield();
            return false; // Don't grab if shield is hit
        }

        // Check enemy body
        const hit = d < this.hitRadius;
        this.isTargeted = hit;
        return hit;
    }

    /**
     * Damage the shield and potentially break it
     * @private
     */
    _damageShield() {
        this.currentShieldHealth--;
        this.shieldFlashing = true;
        this.shieldFlashTime = millis();

        if (this.currentShieldHealth <= 0) {
            this.hasShield = false;
            this.shieldDestroyedTime = millis(); // Track when shield was destroyed
        }
    }

    /**
     * Check if shield should regenerate and restore it
     * @private
     */
    _checkShieldRegen() {
        // Only regen if shield was originally enabled and is currently down
        if (this.shieldEnabled && !this.hasShield && this.shieldDestroyedTime > 0) {
            if (millis() - this.shieldDestroyedTime >= this.shieldRegenTime) {
                this.hasShield = true;
                this.currentShieldHealth = this.shieldHealth;
                this.shieldDestroyedTime = 0;
            }
        }
    }

    /**
     * Pull enemy toward a target position
     * @param {number} targetX - Target x
     * @param {number} targetY - Target y
     * @param {number} pullSpeed - Pull speed
     */
    pullToward(targetX, targetY, pullSpeed) {
        const { vx, vy } = GameUtils.velocityToward(
            this.sprite.x, this.sprite.y,
            targetX, targetY,
            pullSpeed
        );
        this.sprite.velocity.x = vx;
        this.sprite.velocity.y = vy;
    }

    // ==================== SHOOTING ====================

    /**
     * Take damage and check if enemy should die
     * @param {number} damage - Amount of damage to take
     */
    takeDamage(damage = 1) {
        if (this.isDead) return;

        this.currentHealth -= damage;
        console.log(`Enemy took ${damage} damage! Health: ${this.currentHealth}/${this.maxHealth}`);

        if (this.currentHealth <= 0) {
            this.isDead = true;
            this.remove();
        }
    }

    /**
     * Shoot a bullet toward a target
     * @param {number} targetX - Target x
     * @param {number} targetY - Target y
     */
    shootAt(targetX, targetY) {
        const { vx, vy, distance } = this._calculateBulletVelocity(targetX, targetY);
        if (distance === 0) return;

        this.bullets.push({
            x: this.sprite.x,
            y: this.sprite.y,
            vx: vx,
            vy: vy,
            life: 120
        });
    }

    /**
     * Calculate bullet velocity toward target
     * @private
     */
    _calculateBulletVelocity(targetX, targetY) {
        const result = GameUtils.velocityToward(
            this.sprite.x, this.sprite.y,
            targetX, targetY,
            this.bulletSpeed
        );
        const d = GameUtils.normalizeVector(
            targetX - this.sprite.x,
            targetY - this.sprite.y
        );
        return { vx: result.vx, vy: result.vy, distance: d.distance };
    }

    /**
     * Check if there's a clear line of sight to target
     * @param {number} targetX - Target x
     * @param {number} targetY - Target y
     * @param {Array} platforms - Array of platform sprites
     * @returns {boolean}
     */
    hasLineOfSight(targetX, targetY, platforms) {
        if (!platforms) return true;

        const { dirX, dirY, distance } = GameUtils.normalizeVector(
            targetX - this.sprite.x,
            targetY - this.sprite.y
        );

        if (distance === 0) return false;

        // Check points along the line
        const steps = Math.ceil(distance / 5);

        for (let i = 1; i < steps; i++) {
            const t = i / steps;
            const checkX = this.sprite.x + (dirX * distance * t);
            const checkY = this.sprite.y + (dirY * distance * t);

            for (let platform of platforms) {
                if (GameUtils.pointInRect(checkX, checkY,
                    platform.x, platform.y,
                    platform.width, platform.height)) {
                    return false;
                }
            }
        }

        return true;
    }

    // ==================== BULLET UPDATES ====================

    /**
     * Update bullets and check collisions
     * @param {Player} player - Player object
     * @param {Array} platforms - Platform sprites
     */
    updateBullets(player, platforms) {
        const bulletsToRemove = new Set();

        for (let i = 0; i < this.bullets.length; i++) {
            const bullet = this.bullets[i];
            this._updateBulletPosition(bullet);

            // Check platform collision
            if (this._checkBulletPlatformCollision(bullet, platforms)) {
                bulletsToRemove.add(i);
                continue;
            }

            // Check player collision
            if (this._checkBulletPlayerCollision(bullet, player)) {
                bulletsToRemove.add(i);
            }
        }

        // Remove hit/expired bullets
        this.bullets = this.bullets.filter((b, index) =>
            b.life > 0 && !bulletsToRemove.has(index)
        );
    }

    /**
     * Update single bullet position
     * @private
     */
    _updateBulletPosition(bullet) {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
    }

    /**
     * Check if bullet hit any platform
     * @private
     */
    _checkBulletPlatformCollision(bullet, platforms) {
        if (!platforms) return false;

        for (let platform of platforms) {
            if (GameUtils.pointInRect(bullet.x, bullet.y,
                platform.x, platform.y,
                platform.width, platform.height)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if bullet hit the player
     * @private
     */
    _checkBulletPlayerCollision(bullet, player) {
        if (!player) return false;

        if (GameUtils.pointInRect(bullet.x, bullet.y,
            player.sprite.x, player.sprite.y,
            player.sprite.width, player.sprite.height)) {
            if (player.onHit) {
                player.onHit();
            }
            return true;
        }
        return false;
    }

    /**
     * Draw all bullets in world coordinates
     */
    drawBullets() {
        push();
        fill(this.bulletColor);
        noStroke();
        for (let bullet of this.bullets) {
            ellipse(bullet.x, bullet.y, this.bulletSize);
        }
        pop();
    }

    // ==================== VISUAL FEEDBACK ====================

    /**
     * Draw targeting feedback glow
     */
    drawFeedback() {
        if (this.isTargeted) {
            push();
            noFill();
            stroke(255, 0, 0, 150);
            strokeWeight(3);

            if (this.sprite.diameter) {
                ellipse(this.sprite.x, this.sprite.y, this.sprite.diameter + 10);
            } else {
                rectMode(CENTER);
                rect(this.sprite.x, this.sprite.y, this.sprite.width + 10, this.sprite.height + 10, 5);
            }
            pop();
        }
        this.isTargeted = false;
    }

    /**
     * Draw shield arc facing the player
     * @param {Player} player - Player object for orientation
     */
    drawShield(player) {
        if (!this.hasShield) return;

        push();
        this._updateShieldFlash();

        const alpha = this._calculateShieldAlpha();
        const angleToPlayer = player ?
            atan2(player.sprite.y - this.sprite.y, player.sprite.x - this.sprite.x) : 0;

        // Draw in world coordinates - p5play's camera handles transformation
        translate(this.sprite.x, this.sprite.y);
        rotate(angleToPlayer);

        this._drawShieldArc(alpha);
        this._drawShieldEdges();
        this._drawShieldEnergyLines();
        this._drawShieldHealthIndicators(alpha);

        pop();
    }

    /**
     * Update shield flash state
     * @private
     */
    _updateShieldFlash() {
        if (this.shieldFlashing && millis() - this.shieldFlashTime > this.shieldFlashDuration) {
            this.shieldFlashing = false;
        }
    }

    /**
     * Calculate shield alpha based on health and flash state
     * @private
     */
    _calculateShieldAlpha() {
        const baseAlpha = map(this.currentShieldHealth, 0, this.shieldHealth, 50, 150);
        return this.shieldFlashing ? 200 : baseAlpha;
    }

    /**
     * Draw the main shield arc
     * @private
     */
    _drawShieldArc(alpha) {
        noFill();
        strokeWeight(3);

        if (this.shieldFlashing) {
            stroke(255, 255, 255, alpha);
        } else {
            stroke(red(this.shieldColor), green(this.shieldColor), blue(this.shieldColor), alpha);
        }

        arc(0, 0, this.shieldRadius * 2, this.shieldRadius * 2, -HALF_PI, HALF_PI);
    }

    /**
     * Draw shield edge lines
     * @private
     */
    _drawShieldEdges() {
        const edgeLength = 15;
        line(0, -this.shieldRadius, 0, -this.shieldRadius - edgeLength);
        line(0, this.shieldRadius, 0, this.shieldRadius + edgeLength);
    }

    /**
     * Draw energy lines across shield
     * @private
     */
    _drawShieldEnergyLines() {
        strokeWeight(1);
        const numLines = 5;

        for (let i = 1; i < numLines; i++) {
            const t = i / numLines;
            const arcAngle = map(t, 0, 1, -HALF_PI, HALF_PI);
            const x1 = cos(arcAngle) * (this.shieldRadius - 10);
            const y1 = sin(arcAngle) * (this.shieldRadius - 10);
            const x2 = cos(arcAngle) * (this.shieldRadius + 5);
            const y2 = sin(arcAngle) * (this.shieldRadius + 5);
            line(x1, y1, x2, y2);
        }
    }

    /**
     * Draw shield health indicator dots
     * @private
     */
    _drawShieldHealthIndicators(alpha) {
        noStroke();

        if (this.shieldFlashing) {
            fill(255, 255, 255, alpha);
        } else {
            fill(red(this.shieldColor), green(this.shieldColor), blue(this.shieldColor), alpha);
        }

        for (let i = 0; i < this.currentShieldHealth; i++) {
            const arcAngle = map(i, 0, this.shieldHealth - 1, -HALF_PI + 0.3, HALF_PI - 0.3);
            const x = cos(arcAngle) * (this.shieldRadius + 10);
            const y = sin(arcAngle) * (this.shieldRadius + 10);
            circle(x, y, 8);
        }
    }

    // ==================== UPDATE & CLEANUP ====================

    /**
     * Main update method - call in draw()
     * @param {Player} player - Player object
     * @param {Array} platforms - Platform sprites
     */
    update(player, platforms) {
        // Don't update if enemy is dead
        if (this.isDead) return;

        // Check if shield should regenerate
        this._checkShieldRegen();

        // Move toward player if AI is enabled
        if (player && this.moveEnabled) {
            this._moveTowardPlayer(player);
        }

        this.drawShield(player);
        this.drawFeedback();
        this.updateBullets(player, platforms);
        this.drawBullets();

        // Shoot at player on interval if line of sight is clear
        if (player && millis() - this.lastShotTime > this.shootInterval) {
            if (this.hasLineOfSight(player.x, player.y, platforms)) {
                this.shootAt(player.x, player.y);
                this.lastShotTime = millis();
            }
        }
    }

    /**
     * Move enemy slowly toward the player
     * @private
     */
    _moveTowardPlayer(player) {
        const dx = player.x - this.sprite.x;
        const dy = player.y - this.sprite.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only move if player is within detection range and outside stop distance
        if (distance < this.detectionRange && distance > this.stopDistance) {
            // Normalize direction and apply move speed
            const dirX = dx / distance;

            // Only move horizontally (don't fly toward player vertically)
            this.sprite.velocity.x = dirX * this.moveSpeed;

            // Flip sprite to face player (if it has mirror property)
            if (this.sprite.mirror) {
                this.sprite.mirror.x = dirX < 0;
            }
        } else {
            // Stop moving if too close or too far
            this.sprite.velocity.x = 0;
        }
    }

    /**
     * Clean up and remove the enemy
     */
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
        this.bullets = [];
    }

    // ==================== POSITION ACCESSORS ====================

    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
