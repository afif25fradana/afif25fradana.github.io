// Hobbies page specific functionality
import { HobbiesGenerator } from '../components/hobbies.js';

/**
 * Initializes hobbies page functionality
 */
export function initHobbiesPage() {
    const hobbiesGenerator = new HobbiesGenerator();
    hobbiesGenerator.init();
}