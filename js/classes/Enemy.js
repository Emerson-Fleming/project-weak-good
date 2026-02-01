// Enemy.js
// An enemy that can be grabbed by the tongue and shoots projectiles

class Enemy {
    constructor(x, y, options = {}) {
        // Create the sprite
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

        // Shield settings
        this.hasShield = options.hasShield || false;
        this.shieldHealth = options.shieldHealth || 3; // Number of tongue hits to break
        this.currentShieldHealth = this.shieldHealth;
        this.shieldColor = options.shieldColor || 'cyan';
        this.shieldRadius = options.shieldRadius || Math.max(this.sprite.width, this.sprite.height) / 2 + 15;
        this.shieldFlashing = false;
        this.shieldFlashTime = 0;
        this.shieldFlashDuration = 200; // ms

        // Enemy attack settings
        this.bullets = [];
        this.bulletSpeed = options.bulletSpeed || 8;
        this.bulletColor = options.bulletColor || 'purple';
        this.bulletSize = options.bulletSize || 12;
        this.shootInterval = options.shootInterval || 1200; // ms between shots
        this.lastShotTime = millis();
    }

    // Check if the tongue tip hit this object or shield
    checkTongueHit(tongueX, tongueY) {
        let d = dist(tongueX, tongueY, this.sprite.x, this.sprite.y);

        // Check if shield is hit first
        if (this.hasShield && d < this.shieldRadius) {
            this.isTargeted = true;

            // Damage the shield
            this.currentShieldHealth--;
            this.shieldFlashing = true;
            this.shieldFlashTime = millis();

            // Remove shield if health depleted
            if (this.currentShieldHealth <= 0) {
                this.hasShield = false;
            }

            return false; // Don't grab enemy if shield is hit
        }

        // Check if enemy body is hit (only if no shield)
        let hit = d < this.hitRadius;
        this.isTargeted = hit;
        return hit;
    }

    // Pull the object toward a target position
    pullToward(targetX, targetY, pullSpeed) {
        let dx = targetX - this.sprite.x;
        let dy = targetY - this.sprite.y;
        let d = dist(0, 0, dx, dy);
        if (d > 0) {
            let vx = (dx / d) * pullSpeed;
            let vy = (dy / d) * pullSpeed;
            this.sprite.velocity.x = vx;
            this.sprite.velocity.y = vy;
        }
    }

    // Shoot a bullet toward the player
    shootAt(targetX, targetY) {
        let dx = targetX - this.sprite.x;
        let dy = targetY - this.sprite.y;
        let d = dist(0, 0, dx, dy);
        if (d === 0) return;
        let vx = (dx / d) * this.bulletSpeed;
        let vy = (dy / d) * this.bulletSpeed;
        this.bullets.push({
            x: this.sprite.x,
            y: this.sprite.y,
            vx: vx,
            vy: vy,
            life: 120 // frames
        });
    }

    // Check if there's a clear line of sight to the target (no platforms blocking)
    hasLineOfSight(targetX, targetY, platforms) {
        if (!platforms) return true;

        // Get the vector from enemy to target
        let dx = targetX - this.sprite.x;
        let dy = targetY - this.sprite.y;
        let distance = dist(0, 0, dx, dy);

        if (distance === 0) return false;

        // Normalize direction
        let dirX = dx / distance;
        let dirY = dy / distance;

        // Check points along the line from enemy to player
        let steps = Math.ceil(distance / 5); // Check every 5 pixels

        for (let i = 1; i < steps; i++) {
            let checkX = this.sprite.x + (dirX * distance * i / steps);
            let checkY = this.sprite.y + (dirY * distance * i / steps);

            // Check if this point intersects any platform
            for (let platform of platforms) {
                let platformLeft = platform.x - platform.width / 2;
                let platformRight = platform.x + platform.width / 2;
                let platformTop = platform.y - platform.height / 2;
                let platformBottom = platform.y + platform.height / 2;

                if (checkX >= platformLeft && checkX <= platformRight &&
                    checkY >= platformTop && checkY <= platformBottom) {
                    // Line of sight is blocked!
                    return false;
                }
            }
        }

        // No obstacles found
        return true;
    }

    // Update bullets and check collisions with player and platforms
    updateBullets(player, platforms) {
        let bulletsToRemove = [];

        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;

            // Check collision with platforms/walls
            if (platforms) {
                for (let platform of platforms) {
                    let platformLeft = platform.x - platform.width / 2;
                    let platformRight = platform.x + platform.width / 2;
                    let platformTop = platform.y - platform.height / 2;
                    let platformBottom = platform.y + platform.height / 2;

                    if (bullet.x >= platformLeft && bullet.x <= platformRight &&
                        bullet.y >= platformTop && bullet.y <= platformBottom) {
                        // Hit a platform!
                        bulletsToRemove.push(i);
                        break; // Stop checking other platforms for this bullet
                    }
                }
            }

            // Check collision with player (only if bullet hasn't hit a platform)
            if (!bulletsToRemove.includes(i) && player) {
                let playerLeft = player.sprite.x - player.sprite.width / 2;
                let playerRight = player.sprite.x + player.sprite.width / 2;
                let playerTop = player.sprite.y - player.sprite.height / 2;
                let playerBottom = player.sprite.y + player.sprite.height / 2;

                if (bullet.x >= playerLeft && bullet.x <= playerRight &&
                    bullet.y >= playerTop && bullet.y <= playerBottom) {
                    // Hit the player!
                    if (player.onHit) {
                        player.onHit();
                    }
                    bulletsToRemove.push(i);
                }
            }
        }

        // Remove bullets that hit or expired
        this.bullets = this.bullets.filter((b, index) =>
            b.life > 0 && !bulletsToRemove.includes(index)
        );
    }

    // Draw bullets
    drawBullets() {
        push();
        fill(this.bulletColor);
        noStroke();
        for (let bullet of this.bullets) {
            ellipse(bullet.x, bullet.y, this.bulletSize);
        }
        pop();
    }

    // Draw visual feedback (optional glow when targeted)
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

    // Draw shield around enemy (oriented toward player)
    drawShield(player) {
        if (!this.hasShield) return;

        push();

        // Update flash state
        if (this.shieldFlashing && millis() - this.shieldFlashTime > this.shieldFlashDuration) {
            this.shieldFlashing = false;
        }

        // Calculate shield opacity based on health and flash state
        let baseAlpha = map(this.currentShieldHealth, 0, this.shieldHealth, 50, 150);
        let alpha = baseAlpha;

        if (this.shieldFlashing) {
            // Flash white when hit
            alpha = 200;
        }

        // Calculate angle toward player for shield positioning
        let angleToPlayer = 0;
        if (player) {
            angleToPlayer = atan2(player.sprite.y - this.sprite.y, player.sprite.x - this.sprite.x);
        }

        // Draw shield arc facing the player (semi-circle)
        noFill();
        strokeWeight(3);

        if (this.shieldFlashing) {
            stroke(255, 255, 255, alpha); // White flash
        } else {
            let r = red(this.shieldColor);
            let g = green(this.shieldColor);
            let b = blue(this.shieldColor);
            stroke(r, g, b, alpha);
        }

        // Draw shield arc (180 degrees facing player)
        translate(this.sprite.x, this.sprite.y);
        rotate(angleToPlayer);

        // Draw the shield as an arc
        arc(0, 0, this.shieldRadius * 2, this.shieldRadius * 2, -HALF_PI, HALF_PI);

        // Draw shield edges
        let edgeLength = 15;
        line(0, -this.shieldRadius, 0, -this.shieldRadius - edgeLength);
        line(0, this.shieldRadius, 0, this.shieldRadius + edgeLength);

        // Draw energy lines across shield
        strokeWeight(1);
        let numLines = 5;
        for (let i = 1; i < numLines; i++) {
            let t = i / numLines;
            let arcAngle = map(t, 0, 1, -HALF_PI, HALF_PI);
            let x1 = cos(arcAngle) * (this.shieldRadius - 10);
            let y1 = sin(arcAngle) * (this.shieldRadius - 10);
            let x2 = cos(arcAngle) * (this.shieldRadius + 5);
            let y2 = sin(arcAngle) * (this.shieldRadius + 5);
            line(x1, y1, x2, y2);
        }

        // Draw shield health indicators on the arc
        noStroke();
        if (this.shieldFlashing) {
            fill(255, 255, 255, alpha);
        } else {
            let r = red(this.shieldColor);
            let g = green(this.shieldColor);
            let b = blue(this.shieldColor);
            fill(r, g, b, alpha);
        }

        for (let i = 0; i < this.currentShieldHealth; i++) {
            let arcAngle = map(i, 0, this.shieldHealth - 1, -HALF_PI + 0.3, HALF_PI - 0.3);
            let x = cos(arcAngle) * (this.shieldRadius + 10);
            let y = sin(arcAngle) * (this.shieldRadius + 10);
            circle(x, y, 8);
        }

        pop();
    }

    // Update (call in draw)
    update(player, platforms) {
        this.drawShield(player); // Draw shield first (behind enemy), oriented toward player
        this.drawFeedback();
        this.updateBullets(player, platforms);
        this.drawBullets();
        // Shoot at player at intervals (only if no shield or shield still active)
        if (player && millis() - this.lastShotTime > this.shootInterval) {
            // Check line of sight before shooting
            if (this.hasLineOfSight(player.x, player.y, platforms)) {
                this.shootAt(player.x, player.y);
                this.lastShotTime = millis();
            }
        }
    }

    // Clean up and remove the enemy sprite
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
        this.bullets = [];
    }

    // Getters for position
    get x() { return this.sprite.x; }
    get y() { return this.sprite.y; }
    // Setters for position
    set x(val) { this.sprite.x = val; }
    set y(val) { this.sprite.y = val; }
}
