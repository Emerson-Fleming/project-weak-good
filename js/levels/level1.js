// Level 1 - Jail Cell Escape

let jailBackWall;
let jailCeiling;
let jailRightWall;
let waitingEnemy;

function setup() {
    // Create canvas
    createCanvas(windowWidth, windowHeight);

    // Initialize game
    game.init();
    game.initializeGravity(20);

    // Jail cell dimensions
    const jailX = 100;
    const jailY = height - 250;
    const jailWidth = 200;
    const jailHeight = 200;
    const wallThickness = 20;

    // Create player inside jail cell
    game.createPlayer(jailX + jailWidth / 2, jailY + jailHeight / 2, {
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

    // Create jail cell back wall (left side)
    jailBackWall = new StaticPlatform(
        jailX - wallThickness / 2,           // x position
        jailY + jailHeight / 2,              // y position
        wallThickness,                        // width
        jailHeight,                           // height
        'gray',                               // color
        game.platforms                        // platform group
    );

    // Create jail cell ceiling
    jailCeiling = new StaticPlatform(
        jailX + jailWidth / 2,               // x position
        jailY - wallThickness / 2,           // y position
        jailWidth + wallThickness * 2,       // width (extends over walls)
        wallThickness,                        // height
        'darkgray',                           // color
        game.platforms                        // platform group
    );

    // Create jail cell right wall (teleporting platform)
    jailRightWall = new TeleportingPlatform(
        { x: jailX + jailWidth + wallThickness / 2, y: jailY + jailHeight / 2 },  // Point A (blocks cell)
        { x: jailX + jailWidth + wallThickness / 2, y: jailY - 200 },             // Point B (teleports up out of way)
        { width: wallThickness, height: jailHeight },                              // Point A dimensions
        { width: wallThickness, height: wallThickness },                           // Point B dimensions (small when teleported)
        'red',                                                                     // Point A color
        'pink',                                                                    // Point B color
        game.platforms                                                             // Platform group
    );

    // Create enemy waiting outside the jail cell
    waitingEnemy = new Enemy(
        jailX + jailWidth + 150,             // x position (to the right of jail)
        jailY + jailHeight / 2,              // y position (same level as player)
        {
            width: 40,
            height: 40,
            color: 'red',
            shootInterval: 1500,              // shoots every 1.5 seconds
            bulletSpeed: 6,
            bulletColor: 'darkred',
            bulletSize: 10
        }
    );

    // Register the enemy with the player
    game.player.addEnemy(waitingEnemy);

    // Set up restart callback
    game.setRestartCallback(() => {
        // Clean up level-specific objects
        if (jailBackWall) {
            jailBackWall.remove();
        }
        if (jailCeiling) {
            jailCeiling.remove();
        }
        if (jailRightWall) {
            jailRightWall.remove();
        }
        if (waitingEnemy) {
            waitingEnemy.remove();
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
            'Level 1 - Jail Cell Escape!',
            'Use Arrow Keys or WASD to move, Space to Jump',
            'Press Shift to teleport the RED WALL and escape',
            'Click to shoot tongue at enemies - Beware the guard outside!'
        ]);

        // Update player
        game.player.update();

        // Update jail right wall (teleporting platform)
        jailRightWall.update();

        // Update enemy (pass platforms for bullet collision detection)
        waitingEnemy.update(game.player, game.platforms);

        // Check if player fell
        game.checkPlayerFell(100 + 200 / 2, height - 250 + 200 / 2);

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
