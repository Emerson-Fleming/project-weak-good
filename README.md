# p5.js with p5.play Project

A basic project setup using p5.js and the p5.play extension.

## About

This project demonstrates:
- **p5.js**: A JavaScript library for creative coding
- **p5.play**: An extension that adds sprite and physics functionality to p5.js

## Getting Started

1. Open `index.html` in a web browser
2. Or use a local server (recommended):
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server
   ```
3. Navigate to `http://localhost:8000` in your browser

## Features

The demo includes:
- A controllable player sprite (blue square)
- Physics-based movement with gravity
- Platform collision detection
- Keyboard controls (Arrow keys, WASD, and Space for jumping)

## Controls

- **Move Left**: Left Arrow or A
- **Move Right**: Right Arrow or D
- **Jump**: Space, W, or Up Arrow

## File Structure

- `index.html` - Main HTML file with p5.js and p5.play CDN links
- `sketch.js` - Your p5.js sketch with sprite and physics code
- `README.md` - This file

## Learn More

- [p5.js Documentation](https://p5js.org/reference/)
- [p5.play Documentation](https://p5play.org/learn/)

## Customization

Feel free to modify `sketch.js` to:
- Change sprite colors and sizes
- Add more platforms and obstacles
- Create enemies or collectibles
- Implement scoring systems
- Add sound effects and music
