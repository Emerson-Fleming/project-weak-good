// Level 1 - Introduction level with teleporting platform

let teleportingPlatform1;
let teleportingPlatform2;
let pullableBox;

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);

    // Initialize game
    game.init();
    game.initializeGravity(20);

    // Create player
    game.createPlayer(width - 500, height / 2, {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    });

    // Create health bar
    game.createHealthBar(5, {
        x: 30,
        y: 30,
        heartSize: 30
    });

    // Create ground
    game.createGround('brown');

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
    pullableBox = new Enemy(width - 200, height - 100, {
        width: 50,
        height: 50,
        color: 'gold'
    });

    // Register the pullable object with the player
    game.player.addEnemy(pullableBox);

    // Set up restart callback
    game.setRestartCallback(() => {
        // Clean up level-specific objects
        if (pullableBox) {
            pullableBox.remove();
        }
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
    // Background
    background(220);

    // Check for game over
    if (!game.isGameOver) {
        // Display instructions
        game.showInstructions([
            'Level 1 - Use Arrow Keys or WASD to move',
            'Press Space to Jump',
            'Press Shift to toggle the teleporting platform',
            'Click to shoot tongue toward cursor'
        ]);

        // Update player
        game.player.update();

        // Update teleporting platform
        teleportingPlatform1.update();
        teleportingPlatform2.update();

        // Update pullable object
        pullableBox.update(game.player);

        // Check if player fell
        game.checkPlayerFell(width - 500, height / 2);

        // Check for game over
        game.checkGameOver();
    }

    // Draw health bar (always visible)
    if (game.healthBar) {
        game.healthBar.update();
    }

    // Draw game over screen if dead
    game.drawGameOver();
}

// Handle window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
