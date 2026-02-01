// Level 1 - Jail Cell Escape
// A beginner level teaching basic mechanics

// ==================== LEVEL CONFIGURATION ====================

const Level1Config = {
    // Jail cell dimensions
    jail: {
        x: 100,
        wallThickness: 20,
        width: 200,
        height: 200,
        getY: () => height - 250
    },

    // Player settings
    player: {
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8,
        getSpawnX: function () { return Level1Config.jail.x + Level1Config.jail.width / 2; },
        getSpawnY: function () { return Level1Config.jail.getY() + Level1Config.jail.height / 2; }
    },

    // Enemy settings
    enemy: {
        width: 40,
        height: 40,
        color: 'red',
        shootInterval: 1500,
        bulletSpeed: 6,
        bulletColor: 'darkred',
        bulletSize: 10,
        hasShield: true,
        shieldHealth: 3,
        shieldColor: 'cyan',
        shieldRadius: 35,
        getX: function () { return Level1Config.jail.x + Level1Config.jail.width + 150; },
        getY: function () { return Level1Config.jail.getY() + Level1Config.jail.height / 2; }
    },

    // Instructions
    instructions: [
        'Level 1 - Jail Cell Escape!',
        'Use Arrow Keys or WASD to move, Space to Jump',
        'Press Shift to teleport the RED WALL and escape',
        'Click to shoot tongue - Break the enemy\'s shield first!'
    ]
};

// ==================== LEVEL OBJECTS ====================

let jailBackWall;
let jailCeiling;
let jailRightWall;
let waitingEnemy;

// ==================== LEVEL LIFECYCLE ====================

function setup() {
    // Create canvas
    new Canvas(windowWidth, windowHeight);
    
    game.init();
    game.initializeGravity(20);

    // Enable camera scrolling
    game.enableCamera({
        scrollThresholdRight: 0.8,  // Scroll when player is in right 20%
        scrollThresholdLeft: 0.2,   // Scroll when player is in left 20%
        scrollSpeed: 0.15,           // Smooth following
        minX: 0,                     // Don't scroll past left edge
        maxX: 3000 - width           // Stop scrolling at the end of the ground
    });

    createLevelGeometry();
    createLevelEntities();
    setupRestartCallback();
}

function draw() {
    game.createPaperBackground();

    if (!game.isGameOver) {
        // Update camera to follow player
        game.updateCamera();

        game.showInstructions(Level1Config.instructions);

        game.player.update();
        jailRightWall.update();
        waitingEnemy.update(game.player, game.platforms);

        game.checkPlayerFell(
            Level1Config.player.getSpawnX(),
            Level1Config.player.getSpawnY()
        );
        game.checkGameOver();
    }

    if (game.healthBar) {
        game.healthBar.update();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// ==================== LEVEL CREATION HELPERS ====================

/**
 * Create all static and teleporting platforms
 */
function createLevelGeometry() {
    const cfg = Level1Config.jail;
    const jailY = cfg.getY();

    // Ground - extend it to 3000 pixels wide for a linear gauntlet
    game.createGround('brown', 3000);

    // Back wall (left side)
    jailBackWall = new StaticPlatform(
        cfg.x - cfg.wallThickness / 2,
        jailY + cfg.height / 2,
        cfg.wallThickness,
        cfg.height,
        'gray',
        game.platforms,
        true
    );

    // Ceiling
    jailCeiling = new StaticPlatform(
        cfg.x + cfg.width / 2,
        jailY - cfg.wallThickness / 2,
        cfg.width + cfg.wallThickness * 2,
        cfg.wallThickness,
        'darkgray',
        game.platforms,
        true
    );

    // Right wall (teleporting)
    jailRightWall = new TeleportingPlatform(
        { x: cfg.x + cfg.width + cfg.wallThickness / 2, y: jailY + cfg.height / 2 },
        { x: cfg.x + cfg.width + cfg.wallThickness / 2, y: jailY - 200 },
        { width: cfg.wallThickness, height: cfg.height },
        { width: cfg.wallThickness, height: cfg.wallThickness },
        'red',
        'pink',
        game.platforms
    );

    // Add platforms to the right for scrolling demonstration
    const groundY = height - 50;

    // Platform 1 - floating platform
    new StaticPlatform(600, groundY - 100, 150, 20, 'brown', game.platforms, false);

    // Platform 2 - higher platform
    new StaticPlatform(850, groundY - 200, 120, 20, 'brown', game.platforms, false);

    // Platform 3 - far right
    new StaticPlatform(1100, groundY - 150, 150, 20, 'brown', game.platforms, false);

    // Platform 4 - very far right
    new StaticPlatform(1400, groundY - 180, 120, 20, 'brown', game.platforms, false);
}

/**
 * Create player and enemies
 */
function createLevelEntities() {
    const playerCfg = Level1Config.player;
    const enemyCfg = Level1Config.enemy;

    // Player
    game.createPlayer(playerCfg.getSpawnX(), playerCfg.getSpawnY(), {
        color: playerCfg.color,
        moveSpeed: playerCfg.moveSpeed,
        jumpForce: playerCfg.jumpForce
    });

    // Health bar
    game.createHealthBar(5, { x: 30, y: 30, heartSize: 30 });

    // Enemy
    waitingEnemy = new Enemy(enemyCfg.getX(), enemyCfg.getY(), {
        width: enemyCfg.width,
        height: enemyCfg.height,
        color: enemyCfg.color,
        shootInterval: enemyCfg.shootInterval,
        bulletSpeed: enemyCfg.bulletSpeed,
        bulletColor: enemyCfg.bulletColor,
        bulletSize: enemyCfg.bulletSize,
        hasShield: enemyCfg.hasShield,
        shieldHealth: enemyCfg.shieldHealth,
        shieldColor: enemyCfg.shieldColor,
        shieldRadius: enemyCfg.shieldRadius
    });

    game.player.addEnemy(waitingEnemy);
}

/**
 * Set up the restart callback to clean up level objects
 */
function setupRestartCallback() {
    game.setRestartCallback(() => {
        // Clean up level-specific objects
        cleanupLevelObjects();
        // Restart
        setup();
    });
}

/**
 * Clean up all level-specific objects
 */
function cleanupLevelObjects() {
    const levelObjects = [jailBackWall, jailCeiling, jailRightWall, waitingEnemy];

    for (let obj of levelObjects) {
        if (obj && obj.remove) {
            obj.remove();
        }
    }
}