// Main module to coordinate all functionalities
import { GitHubFetcher } from './github.js';
import { MusicPlayer, MusicCardGenerator } from './music.js';
import { Starfield } from './starfield.js';
import { UI } from './ui.js';
import { HobbiesGenerator } from './hobbies.js'; // Import HobbiesGenerator from dedicated file

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize all components
    new UI();
    const githubFetcher = new GitHubFetcher();
    new MusicPlayer();
    const starfield = new Starfield();
    const musicCardGenerator = new MusicCardGenerator();
    const hobbiesGenerator = new HobbiesGenerator(); // Initialize HobbiesGenerator
    
    // Fetch GitHub repositories
    githubFetcher.fetchRepos();
    
    // Render music cards
    await musicCardGenerator.init();

    // Render hobbies
    await hobbiesGenerator.init();

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
