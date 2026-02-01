// TeleportingPlatform.js
// A platform that teleports between two positions when shift is pressed

class TeleportingPlatform {
    /**
     * Create a teleporting platform
     * @param {Object} pointA - First position {x, y}
     * @param {Object} pointB - Second position {x, y}
     * @param {Object} dimA - First dimensions {width, height}
     * @param {Object} dimB - Second dimensions {width, height}
     * @param {string} colorA - First state color
     * @param {string} colorB - Second state color
     * @param {Group} platformGroup - p5play platform group
     */
    constructor(pointA, pointB, dimA, dimB, colorA, colorB, platformGroup) {
        // Store state configurations
        this.stateA = { pos: pointA, dim: dimA, color: colorA };
        this.stateB = { pos: pointB, dim: dimB, color: colorB };
        this.atPointA = true;

        // Outline settings
        this.outlineStrokeWeight = 2;
        this.outlineDashPattern = [10, 10];

        this._createSprite(platformGroup);
    }

    /**
     * Create the platform sprite
     * @private
     */
    _createSprite(platformGroup) {
        this.sprite = new platformGroup.Sprite();
        this._applyState(this.stateA);
        this.sprite.collider = 'kinematic';
    }

    /**
     * Apply a state configuration to the sprite
     * @private
     */
    _applyState(state) {
        this.sprite.x = state.pos.x;
        this.sprite.y = state.pos.y;
        this.sprite.width = state.dim.width;
        this.sprite.height = state.dim.height;
        this.sprite.color = state.color;
    }

    /**
     * Get the current state configuration
     * @private
     */
    _getCurrentState() {
        return this.atPointA ? this.stateA : this.stateB;
    }

    /**
     * Get the alternate state configuration
     * @private
     */
    _getAlternateState() {
        return this.atPointA ? this.stateB : this.stateA;
    }

    /**
     * Set platform dimensions (affects current state)
     * @param {number} w - New width
     * @param {number} h - New height
     */
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
    }

    /**
     * Draw a dotted rectangle outline at the alternate position
     * Draws in world coordinates - p5play camera handles viewport transformation
     */
    drawAlternateOutline() {
        const alt = this._getAlternateState();

        // p5.js drawing functions don't automatically transform with camera in p5play
        // Convert world coordinates to screen coordinates
        const camOffsetX = camera.x - width / 2;
        const camOffsetY = camera.y - height / 2;
        const screenX = alt.pos.x - camOffsetX;
        const screenY = alt.pos.y - camOffsetY;

        push();
        stroke(alt.color);
        strokeWeight(this.outlineStrokeWeight);
        noFill();
        drawingContext.setLineDash(this.outlineDashPattern);
        rectMode(CENTER);
        rect(screenX, screenY, alt.dim.width, alt.dim.height);
        drawingContext.setLineDash([]);
        pop();
    }

    /**
     * Toggle between point A and point B
     */
    teleport() {
        this.atPointA = !this.atPointA;
        this._applyState(this._getCurrentState());
    }

    /**
     * Update - check for teleport input and draw outline
     */
    update() {
        if (kb.presses('shift')) {
            this.teleport();
        }
        this.drawAlternateOutline();
    }

    /**
     * Clean up and remove the platform
     */
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }

    // ==================== LEGACY PROPERTY ACCESS ====================
    // For backward compatibility with existing code

    get pointA() { return this.stateA.pos; }
    get pointB() { return this.stateB.pos; }
    get dimA() { return this.stateA.dim; }
    get dimB() { return this.stateB.dim; }
    get colorA() { return this.stateA.color; }
    get colorB() { return this.stateB.color; }
}
