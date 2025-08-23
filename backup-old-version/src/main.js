import './style.css';
import { initGame } from './js/game.js';
import { setupServiceWorker } from './js/serviceWorker.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await initGame();
    setupServiceWorker();
});
