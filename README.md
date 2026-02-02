# Forever Prison

play game here: https://emerson-fleming.github.io/forever-prison/

A modular platformer game using p5.js and the p5.play extension.

## Project Structure

```
forever-prison/
├── index.html              # Main entry point (loads current level)
├── sketch.js               # (Legacy reference file)
├── js/
│   ├── utils/
│   │   └── helpers.js      # Shared utility functions & color palettes
│   ├── classes/            # Reusable game classes
│   │   ├── Game.js         # Core game manager (textures, state, UI)
│   │   ├── Player.js       # Player with movement, tongue, wall jump
│   │   ├── Enemy.js        # Enemies with shooting, shields
│   │   ├── HealthBar.js    # Visual health display with hearts
│   │   ├── StaticPlatform.js
│   │   └── TeleportingPlatform.js
│   └── levels/             # Level files
│       ├── level1.js       # Jail Cell Escape
│       ├── level2.js       # Multiple Platforms
│       └── levelTemplate.js # Template for new levels
└── assets/
    ├── images/
    └── sounds/
```

## Getting Started

1. Run `python3 -m http.server 8000` in the project folder
2. Open `http://localhost:8000` in a browser
3. Or use the VS Code task: `Run p5.js Project`

## Switching Levels

Edit `index.html` and change the level script at the bottom:

```html
<script src="js/levels/level1.js"></script>
<!-- or -->
<script src="js/levels/level2.js"></script>
```

## Creating a New Level

1. Copy `js/levels/levelTemplate.js` to a new file (e.g., `level3.js`)
2. Edit the `LevelConfig` object to define your level
3. Update `index.html` to load your new level

### Level Configuration Example

```javascript
const LevelConfig = {
    player: {
        getSpawnX: () => 100,
        getSpawnY: () => height / 2,
        color: 'green',
        moveSpeed: 5,
        jumpForce: 8
    },

    staticPlatforms: [
        { x: 300, y: 400, width: 150, height: 20, color: 'gray', useTexture: true }
    ],

    teleportingPlatforms: [
        {
            pointA: { x: 200, y: 300 },
            pointB: { x: 400, y: 200 },
            dimA: { width: 100, height: 20 },
            dimB: { width: 100, height: 20 },
            colorA: 'red',
            colorB: 'pink'
        }
    ],

    enemies: [
        {
            x: 500, y: 300,
            hasShield: true,
            shieldHealth: 3
        }
    ],

    instructions: ['My Level', 'Custom instructions here']
};
```

## Core Classes

### Game
The main game manager. Use it to:
- `game.init()` - Initialize platforms group
- `game.createPlayer(x, y, options)` - Create the player
- `game.createGround(color)` - Create textured ground
- `game.createPlatform(x, y, w, h, color)` - Create simple platform
- `game.createHealthBar(maxHealth, options)` - Create health display
- `game.createPaperBackground()` - Draw textured background
- `game.createWallTexture(w, h)` - Generate wall texture
- `game.enableCamera(options)` - Enable camera scrolling
- `game.updateCamera()` - Update camera position (call in draw loop)

#### Camera Scrolling
Enable smooth camera scrolling that follows the player:

```javascript
game.enableCamera({
    scrollThresholdRight: 0.8,  // Scroll when player enters right 20% of screen
    scrollThresholdLeft: 0.2,   // Scroll when player enters left 20% of screen
    scrollSpeed: 0.15,           // Smoothing (0-1, higher = faster)
    minX: 0,                     // Left boundary (don't scroll past this)
    maxX: 2000,                  // Right boundary (null for unlimited)
    followY: false               // Whether to follow player vertically
});
```

Then call `game.updateCamera()` in your draw loop.

### Player
Player with movement, jumping, wall jumping, and tongue mechanics:
- Arrow keys / WASD to move
- Space / W / Up to jump (includes coyote time)
- Wall slide and wall jump supported
- Click to shoot tongue (grapple to platforms, pull enemies)

### Enemy
Enemies with shooting and optional shields:
- Shoots bullets at player on interval
- Line-of-sight checking (won't shoot through walls)
- Optional shield that blocks tongue (breaks after hits)

### StaticPlatform / TeleportingPlatform
- StaticPlatform: Fixed position, optional wall texture
- TeleportingPlatform: Press Shift to toggle between two positions

## Utility Functions

Available in `GameUtils`:
- `pointInRect(px, py, rx, ry, rw, rh)` - Point in rectangle check
- `normalizeVector(dx, dy)` - Get direction and distance
- `velocityToward(fromX, fromY, toX, toY, speed)` - Movement velocity
- `clamp(value, min, max)` - Clamp a number

Color palettes in `ColorPalettes`:
- `brown`, `redBrown`, `grey`, `red`, `greyEmpty`

Texture helpers in `TextureUtils`:
- `drawOrganicShape()`, `addPaperFibers()`, `addPixelNoise()`, `addTexturePatches()`

## Controls

| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move |
| Space / W / Up | Jump |
| Shift | Teleport platforms |
| Click | Shoot tongue |
| R | Restart (when dead) |
