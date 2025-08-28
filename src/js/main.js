// Main module to coordinate all functionalities
import { initPortfolioPage } from './pages/portfolio.js';
import { initHobbiesPage } from './pages/hobbies.js';
import { initMusicPage } from './pages/music.js';
import { MusicPlayer } from './components/music.js';
import { Starfield } from './components/starfield.js';
import { UI } from './components/ui.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all components
    new UI();
    new MusicPlayer();
    const starfield = new Starfield();
    
    // Initialize page-specific functionality
    initPortfolioPage();
    initHobbiesPage();
    initMusicPage();

    // Hide loading overlay after all critical operations are complete
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }

    // Pause/resume starfield animation when tab visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            starfield.pause();
        } else {
            starfield.resume();
        }
    });
});