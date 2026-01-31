// StaticPlatform.js
// A static platform that stays in one position

class StaticPlatform {
    constructor(x, y, width, height, color, platformGroup) {
        // Store position
        this.position = { x, y };

        // Store dimensions
        this.dimensions = { width, height };

        // Store color
        this.color = color;

        // Create the sprite
        this.sprite = new platformGroup.Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = width;
        this.sprite.height = height;
        this.sprite.color = color;
        this.sprite.collider = 'static';
    }

    // Set platform dimensions
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
        this.dimensions.width = w;
        this.dimensions.height = h;
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
