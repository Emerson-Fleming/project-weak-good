// p5.js sketch with p5.play

let player;
let platforms;

let movingPlatform;
let teleportingPlatform;

let selectedMask;

// Teleporting Platform Class
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
    }
}

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);
    //have game auto resize when window size changes

    // Set up the world with gravity
    world.gravity.y = 20;

    // Create a player sprite
    player = new Sprite();
    player.width = 50;
    player.height = 50;
    player.x = width / 2;
    player.y = height / 2;
    player.color = 'green';
    player.bounciness = 0;

    // Create a platform group
    platforms = new Group();
    platforms.color = 'green';
    platforms.collider = 'static'; // Platforms don't move

    // Create ground platform
    let ground = new platforms.Sprite();
    ground.x = width / 2;
    ground.y = height - 25;
    ground.width = windowWidth;
    ground.height = 50;
    
    // Create teleporting platform
    teleportingPlatform = new TeleportingPlatform(
        { x: width / 4, y: height - 200 },      // Point A position
        { x: (3 * width) / 4, y: height - 350 }, // Point B position
        { width: 150, height: 20 },              // Point A dimensions
        { width: 500, height: 100 },              // Point B dimensions
        'purple',                                 // Point A color
        'orange',                                 // Point B color
        platforms                                 // Platform group
    );
}

function draw() {
    // Background
    background(220);

    // Display instructions
    fill(0);
    textSize(16);
    textAlign(CENTER);
    text('Use Arrow Keys or WASD to move', width / 2, 30);
    text('Press Space to Jump', width / 2, 50);

    // Player movement controls
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { // Left or A
        player.velocity.x = -5;
    } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { // Right or D
        player.velocity.x = 5;
    } else {
        player.velocity.x = 0;
    }

    // Jump control
    if (kb.presses('space') || kb.presses('w') || kb.presses('up_arrow')) {
        // Only jump if player is on a platform
        if (player.colliding(platforms)) {
            player.velocity.y = -8;
        }
    }

    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x > width) player.x = width;
    
    // Update teleporting platform (handles shift press internally)
    teleportingPlatform.update();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
