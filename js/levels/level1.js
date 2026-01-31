// Level 1 - Introduction level with teleporting platform

let teleportingPlatform1;
let teleportingPlatform2;
let pullableBox;

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);

    // Initialize game
    game.init();
    game.setupWorld(20);

    // Create player
    game.createPlayer(width - 500, height / 2, {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    });

    // Create ground
    game.createGround('green');

    // Create teleporting platform
    teleportingPlatform1 = new TeleportingPlatform(
        { x: width - 500, y: height - 200 },       // Point A position
        { x: width - 300, y: height - 200 },       // Point B position
        { width: 150, height: 20 },              // Point A dimensions
        { width: 150, height: 20 },            // Point B dimensions
        'purple',                                 // Point A color
        'orange',                                 // Point B color
        game.platforms                            // Platform group
    );
    teleportingPlatform2 = new TeleportingPlatform(
        { x: width - 100, y: height - 200 },       // Point A position
        { x: (3 * width) / 2, y: height - 350 }, // Point B position
        { width: 150, height: 20 },              // Point A dimensions
        { width: 150, height: 20 },          // Point B dimensions
        'purple',                                 // Point A color
        'orange',                                 // Point B color
        game.platforms                            // Platform group
    );

    // Create a pullable object to test the tongue mechanic
    pullableBox = new PullableObject(width - 200, height - 100, {
        width: 50,
        height: 50,
        color: 'gold'
    });
    
    // Register the pullable object with the player
    game.player.addPullableObject(pullableBox);
}

function draw() {
    // Background
    background(220);

    // Display instructions
    game.showInstructions([
        'Level 1 - Use Arrow Keys or WASD to move',
        'Press Space to Jump',
        'Press Shift to toggle the teleporting platform',
        'Press E to shoot tongue and grab objects'
    ]);

    // Update player
    game.player.update();

    // Update teleporting platform
    teleportingPlatform1.update();
    teleportingPlatform2.update();

    // Update pullable object
    pullableBox.update();

    // Check if player fell
    game.checkPlayerFell(width / 2, height / 2);
}

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
