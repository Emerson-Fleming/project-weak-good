// FaceMask.js
// Displays a face with a mask that rotates based on user input

class FaceMask {
    /**
     * Create a face with mask display
     * @param {number} x - Center x position
     * @param {number} y - Center y position
     * @param {number} size - Size of the face/mask (width)
     */
    constructor(x, y, size = 150) {
        this.x = x;
        this.y = y;
        this.size = size;

        // Mask rotation state (in degrees)
        // 0 = original, -90 = counter-clockwise, 90 = clockwise
        this.maskRotation = 0;        // Images (need to be loaded in preload)
        this.faceImg = null;
        this.maskImg = null;

        // Track previous input states to detect new presses
        this.shiftWasPressed = false;
        this.mouseWasPressed = false;
        this.eWasPressed = false;
    }

    /**
     * Load images - call this in preload()
     * @param {string} facePath - Path to face image
     * @param {string} maskPath - Path to mask image
     */
    static preloadImages(facePath, maskPath) {
        FaceMask.faceImage = loadImage(facePath);
        FaceMask.maskImage = loadImage(maskPath);
    }

    /**
     * Set the loaded images after preload
     */
    setImages() {
        this.faceImg = FaceMask.faceImage;
        this.maskImg = FaceMask.maskImage;
    }

    /**
     * Update mask rotation based on input
     */
    update() {
        const shiftPressed = keyIsDown(SHIFT);
        const mousePressed = mouseIsPressed;
        const ePressed = keyIsDown(69); // E key code

        // Detect new shift press (wasn't pressed before, now is)
        if (shiftPressed && !this.shiftWasPressed) {
            this.maskRotation = -90; // Counter-clockwise
        }

        // Detect new mouse click (wasn't pressed before, now is)
        if (mousePressed && !this.mouseWasPressed) {
            this.maskRotation = 90; // Clockwise
        }

        // Detect new E press (wasn't pressed before, now is)
        if (ePressed && !this.eWasPressed) {
            this.maskRotation = 0; // Default position
        }

        // Update previous states for next frame
        this.shiftWasPressed = shiftPressed;
        this.mouseWasPressed = mousePressed;
        this.eWasPressed = ePressed;
    }

    /**
     * Draw the face and mask
     */
    draw() {
        push();

        // Move to center position
        translate(this.x, this.y);

        // Draw face (no rotation)
        imageMode(CENTER);
        if (this.faceImg) {
            image(this.faceImg, 0, 0, this.size, this.size);
        } else {
            // Fallback circle if image not loaded
            fill(255, 220, 180);
            noStroke();
            ellipse(0, 0, this.size, this.size);
        }

        // Draw mask with rotation
        push();
        // Use HALF_PI directly (90 degrees in radians)
        if (this.maskRotation === -90) {
            rotate(-110);
        } else if (this.maskRotation === 90) {
            rotate(80);
        }
        if (this.maskImg) {
            image(this.maskImg, 0, 0, this.size, this.size);
        } else {
            // Fallback mask shape if image not loaded
            fill(100, 100, 100, 200);
            ellipse(0, 0, this.size * 0.9, this.size * 0.7);
        }
        pop();

        pop();
    }

    /**
     * Set position
     * @param {number} x - New x position
     * @param {number} y - New y position
     */
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Set size
     * @param {number} size - New size
     */
    setSize(size) {
        this.size = size;
    }

    /**
     * Get current mask rotation in degrees
     * @returns {number}
     */
    getRotation() {
        return this.maskRotation;
    }
}
