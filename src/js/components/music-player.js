// Ambient music player functionality
import { Utils } from '../components/utils.js'; // Import Utils for error handling
import { DeviceDetector } from './device-detector.js'; // Import device detection utility

/**
 * Class for controlling ambient music playback using Tone.js
 */
export class MusicPlayer {
    /**
     * Create a MusicPlayer
     */
    constructor() {
        this.button = document.getElementById('music-button');
        this.musicText = document.getElementById('music-text');
        this.musicIcon = document.getElementById('music-icon');
        this.isPlaying = false;
        this.isAudioContextStarted = false;
        this.loop = null;
        
        if (this.button) {
            this.initSynth();
            this.setupEventListeners();
        }
    }

    /**
     * Initialize Tone.js synthesizer with effects
     */
    initSynth() {
        try {
            this.synth = new Tone.PolySynth(Tone.Synth, {
                volume: -18,
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 0.4 }
            }).toDestination();
            
            this.reverb = new Tone.Reverb({ decay: 2.0, wet: 0.3 }).toDestination();
            this.synth.connect(this.reverb);
            
            this.delay = new Tone.PingPongDelay({ delayTime: '8n', feedback: 0.3, wet: 0.25 }).toDestination();
            this.synth.connect(this.delay);

            this.melody = [
                { notes: ['C4', 'E4', 'G4'], duration: '4n' }, { notes: ['A4'], duration: '8n' },
                { notes: ['G4'], duration: '8n' }, { notes: ['E4'], duration: '4n' },
                { notes: ['C4'], duration: '4n' }, { notes: ['F4', 'A4'], duration: '4n' },
                { notes: ['C5'], duration: '4n' }, { notes: ['A4'], duration: '4n' }
            ];
        } catch (error) {
            console.error('Failed to initialize Tone.js synthesizer:', error);
            // Fallback or disable music player
            if (this.button) {
                this.button.disabled = true;
                this.musicText.textContent = 'Music not available';
            }
        }
    }

    /**
     * Set up event listeners for the music button
     */
    setupEventListeners() {
        this.button.addEventListener('click', () => {
            // On mobile devices, show a warning about audio limitations
            if (DeviceDetector.isMobileDevice() && !this.isAudioContextStarted) {
                // Check if the user is on a mobile device and hasn't started audio yet
                console.log('On mobile devices, audio may be limited due to browser policies.');
            }
            
            if (!this.isAudioContextStarted) {
                Tone.start().then(() => {
                    this.isAudioContextStarted = true;
                    this.startMusic();
                });
            } else {
                this.isPlaying ? this.stopMusic() : this.startMusic();
            }
        });
        
        // Optimasi: Hentikan animasi saat tab tidak aktif
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                if (this.isPlaying) this.stopMusic();
            }
        });
        
        // On mobile devices, stop music when the page is not visible to save resources
        if (DeviceDetector.isMobileDevice()) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.isPlaying) {
                    this.stopMusic();
                }
            });
        }
    }

    /**
     * Start playing the ambient melody
     */
    startMusic() {
        let step = 0;
        this.loop = new Tone.Loop(time => {
            const note = this.melody[step % this.melody.length];
            this.synth.triggerAttackRelease(note.notes, note.duration, time);
            step++;
        }, '4n').start(0);
        Tone.Transport.start();
        this.musicText.textContent = 'STOP AMBIENT MUSIC';
        this.musicIcon.classList.replace('fa-play', 'fa-pause');
        this.button.classList.add('music-active');
        this.isPlaying = true;
    }

    /**
     * Stop playing the ambient melody
     */
    stopMusic() {
        if (this.loop) {
            this.loop.stop(0);
            this.loop.dispose();
        }
        Tone.Transport.stop();
        this.musicText.textContent = 'PLAY AMBIENT MUSIC';
        this.musicIcon.classList.replace('fa-pause', 'fa-play');
        this.button.classList.remove('music-active');
        this.isPlaying = false;
    }
}