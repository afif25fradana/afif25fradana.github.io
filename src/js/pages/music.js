// Music page specific functionality
import { MusicCardGenerator } from '../components/music.js';

/**
 * Initializes music page functionality
 */
export function initMusicPage() {
    const musicCardGenerator = new MusicCardGenerator();
    musicCardGenerator.init();
}