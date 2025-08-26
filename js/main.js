// Main module to coordinate all functionalities
import { GitHubFetcher } from './github.js';
import { MusicPlayer } from './music.js';
import { Starfield } from './starfield.js';
import { UI } from './ui.js';
import { Utils } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    const ui = new UI();
    const githubFetcher = new GitHubFetcher();
    const musicPlayer = new MusicPlayer();
    const starfield = new Starfield();
    
    // Fetch GitHub repositories
    githubFetcher.fetchRepos();
    
    // Pause/resume starfield animation when tab visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            starfield.pause();
        } else {
            starfield.resume();
        }
    });
});