// TeleportingPlatform.js
// A platform that teleports between two positions when shift is pressed

class TeleportingPlatform {
    constructor(pointA, pointB, dimA, dimB, colorA, colorB, platformGroup) {
        // Store positions
        this.pointA = pointA; // { x, y }
        this.pointB = pointB; // { x, y }

        // Store dimensions
        this.dimA = dimA; // { width, height }
        this.dimB = dimB; // { width, height }

        // Store colors
        this.colorA = colorA;
        this.colorB = colorB;

        // Track current state (true = at point A, false = at point B)
        this.atPointA = true;

        // Outline settings
        this.outlineStrokeWeight = 2;
        this.outlineDashPattern = [10, 10]; // [dash length, gap length]

        // Create the sprite
        this.sprite = new platformGroup.Sprite();
        this.sprite.x = this.pointA.x;
        this.sprite.y = this.pointA.y;
        this.sprite.width = this.dimA.width;
        this.sprite.height = this.dimA.height;
        this.sprite.color = this.colorA;
        this.sprite.collider = 'kinematic';
    }

    // Set platform dimensions
    setSize(w, h) {
        this.sprite.width = w;
        this.sprite.height = h;
    }

    // Draw a dotted rectangle outline at the alternate position
    drawAlternateOutline() {
        // Get the alternate position and dimensions
        let altPos, altDim, altColor;
        if (this.atPointA) {
            altPos = this.pointB;
            altDim = this.dimB;
            altColor = this.colorB;
        } else {
            altPos = this.pointA;
            altDim = this.dimA;
            altColor = this.colorA;
        }

        // Save current drawing state
        push();

        // Set up the dotted line style
        stroke(altColor);
        strokeWeight(this.outlineStrokeWeight);
        noFill();

        // Set the dash pattern using drawingContext
        drawingContext.setLineDash(this.outlineDashPattern);

        // Draw rectangle (centered like p5play sprites)
        rectMode(CENTER);
        rect(altPos.x, altPos.y, altDim.width, altDim.height);

        // Reset dash pattern
        drawingContext.setLineDash([]);

        // Restore drawing state
        pop();
    }

    // Toggle between point A and point B
    teleport() {
        if (this.atPointA) {
            // Teleport to point B
            this.sprite.x = this.pointB.x;
            this.sprite.y = this.pointB.y;
            this.sprite.width = this.dimB.width;
            this.sprite.height = this.dimB.height;
            this.sprite.color = this.colorB;
            this.atPointA = false;
        } else {
            // Teleport to point A
            this.sprite.x = this.pointA.x;
            this.sprite.y = this.pointA.y;
            this.sprite.width = this.dimA.width;
            this.sprite.height = this.dimA.height;
            this.sprite.color = this.colorA;
            this.atPointA = true;
        }
    }

    // Check if shift is pressed and teleport
    update() {
        if (kb.presses('shift')) {
            this.teleport();
        }

        // Draw the alternate position outline
        this.drawAlternateOutline();
    }

    // Clean up and remove the platform sprite
    remove() {
        if (this.sprite) {
            this.sprite.remove();
        }
    }
}
