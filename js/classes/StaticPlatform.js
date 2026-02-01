// StaticPlatform.js
// A static platform that stays in one position

class StaticPlatform {
    constructor(x, y, width, height, color, platformGroup, useTexture = false) {
        // Store position
        this.position = { x, y };

        // Store dimensions
        this.dimensions = { width, height };

        // Store color
        this.color = color;
        this.useTexture = useTexture;
        this.textureCache = null;

        // Create the sprite
        this.sprite = new platformGroup.Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.collider = 'static';

        // Apply texture or solid color
        if (useTexture && color === 'gray' || color === 'grey' || color === 'darkgray') {
            // Generate and cache wall texture
            this.textureCache = game.createWallTexture(width, height);
            this.sprite.img = this.textureCache;
        } else {
            this.sprite.color = color;
        }
    }

    // Set platform dimensions
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
        this.dimensions.width = w;
        this.dimensions.height = h;

        // Regenerate texture if using texture
        if (this.useTexture && (this.color === 'gray' || this.color === 'grey' || this.color === 'darkgray')) {
            this.textureCache = game.createWallTexture(w, h);
            this.sprite.img = this.textureCache;
        }
    }

    // Set platform position
    setPosition(x, y) {
        this.sprite.x = x;
        this.sprite.y = y;
        this.position.x = x;
        this.position.y = y;
    }

    // Set platform color
    setColor(color) {
        this.sprite.color = color;
        this.color = color;
    }

    // Update method (for consistency with other platform classes)
    update() {
        // Static platforms don't need to update
        // This method exists for API consistency
    }

    // Clean up and remove the platform sprite
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }
}
