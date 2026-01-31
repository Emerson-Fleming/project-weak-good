// Level 2 - Example of a second level with multiple teleporting platforms

let teleportingPlatform1;
let teleportingPlatform2;

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);

    // Initialize game
    game.init();
    game.initializeGravity(20);

    // Create player
    game.createPlayer(100, height / 2, {
        color: 'blue',
        moveSpeed: 6,
        jumpForce: 10
    });

    // Create ground
    game.createGround('darkgreen');

    // Create some static platforms
    game.createPlatform(200, height - 150, 150, 20, 'brown');
    game.createPlatform(width - 200, height - 150, 150, 20, 'brown');

    // Create first teleporting platform
    teleportingPlatform1 = new TeleportingPlatform(
        { x: width / 3, y: height - 250 },
        { x: width / 3, y: height - 400 },
        { width: 120, height: 20 },
        { width: 120, height: 20 },
        'red',
        'pink',
        game.platforms
    );

    // Create second teleporting platform
    teleportingPlatform2 = new TeleportingPlatform(
        { x: (2 * width) / 3, y: height - 300 },
        { x: (2 * width) / 3, y: height - 450 },
        { width: 120, height: 20 },
        { width: 120, height: 20 },
        'cyan',
        'lightblue',
        game.platforms
    );

    // Set up restart callback
    game.setRestartCallback(() => {
        // Clean up level-specific objects
        if (teleportingPlatform1) {
            teleportingPlatform1.remove();
        }
        if (teleportingPlatform2) {
            teleportingPlatform2.remove();
        }

        // Restart the level
        setup();
    });
}

function draw() {
    // Background - different color for level 2
    background(180, 200, 220);

    // Display instructions
    game.showInstructions([
        'Level 2 - Reach the top!',
        'Use Arrow Keys or WASD to move, Space to Jump',
        'Press Shift to toggle ALL teleporting platforms'
    ]);

    // Update player
    game.player.update();

    // Update teleporting platforms
    teleportingPlatform1.update();
    teleportingPlatform2.update();

    // Check if player fell
    game.checkPlayerFell(100, height / 2);
}

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
