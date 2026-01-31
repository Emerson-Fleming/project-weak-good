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

        // Enemy attack settings
        this.bullets = [];
        this.bulletSpeed = options.bulletSpeed || 8;
        this.bulletColor = options.bulletColor || 'purple';
        this.bulletSize = options.bulletSize || 12;
        this.shootInterval = options.shootInterval || 1200; // ms between shots
        this.lastShotTime = millis();
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

    // Update bullets and check collisions with player
    updateBullets(player) {
        let bulletsToRemove = [];

        for (let i = 0; i < this.bullets.length; i++) {
            let bullet = this.bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.life--;

            // Check collision with player
            if (player) {
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

    // Update (call in draw)
    update(player) {
        this.drawFeedback();
        this.updateBullets(player);
        this.drawBullets();
        // Shoot at player at intervals
        if (player && millis() - this.lastShotTime > this.shootInterval) {
            this.shootAt(player.x, player.y);
            this.lastShotTime = millis();
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
