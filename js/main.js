// Main module to coordinate all functionalities
import { GitHubFetcher } from './github.js';
import { MusicPlayer } from './music.js';
import { Starfield } from './starfield.js';
import { UI } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new UI();
    const githubFetcher = new GitHubFetcher();
    new MusicPlayer();
    new Starfield();
    
    // Fetch GitHub repositories
    githubFetcher.fetchRepos();
    
    // Pause/resume starfield animation when tab visibility changes
    document.addEventListener('visibilitychange', () => {
        const starfield = new Starfield();
        if (document.hidden) {
            starfield.pause();
        } else {
            starfield.resume();
        }
    });
});