// Ambient music player functionality
import { Utils } from './utils.js'; // Import Utils for error handling

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
     * Detect if user is on a mobile device
     * @returns {boolean} - True if user is on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
            if (this.isMobileDevice() && !this.isAudioContextStarted) {
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
        if (this.isMobileDevice()) {
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

/**
 * Class for generating and rendering music cards from YouTube links.
 */
export class MusicCardGenerator {
    constructor() {
        // Initialize empty arrays for music data
        this.favoriteArtists = [];
        this.favoriteSongs = [];
        this.recentSongs = [];
        
        // Multiple oEmbed endpoints for better reliability
        this.oEmbedEndpoints = [
            'https://www.youtube.com/oembed?url=',  // Primary YouTube oEmbed
            'https://noembed.com/embed?url='        // Fallback
        ];
        
        // Cache settings for music metadata
        this.CACHE_PREFIX = 'music_data';
        this.CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
    }

    /**
     * Initializes the music card generation by rendering all categories.
     */
    async init() {
        // Load music data from JSON file
        try {
            const response = await fetch('music-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load music data: ${response.status} ${response.statusText}`);
            }
            const musicData = await response.json();
            
            console.log('Music data loaded successfully:', musicData);
            
            // Validate the loaded data
            if (!this.validateMusicData(musicData)) {
                throw new Error('Invalid music data structure');
            }
            
            this.favoriteArtists = musicData.favoriteArtists;
            this.favoriteSongs = musicData.favoriteSongs;
            this.recentSongs = musicData.recentSongs;
            
            console.log('Favorite artists count:', this.favoriteArtists.length);
            console.log('Favorite songs count:', this.favoriteSongs.length);
            console.log('Recent songs count:', this.recentSongs.length);
        } catch (error) {
            console.error('Error loading music data:', error);
            // Fallback to empty data if JSON file fails to load
            this.loadFallbackData();
        }
        
        // Detect if user is on mobile device
        const isMobile = this.isMobileDevice();
        
        try {
            await this.renderArtistCards(this.favoriteArtists, 'favorite-artists-grid', isMobile);
        } catch (error) {
            console.error('Error rendering favorite artists:', error);
        }
        
        try {
            await this.renderMusicCards(this.favoriteSongs, 'favorite-songs-grid', isMobile);
        } catch (error) {
            console.error('Error rendering favorite songs:', error);
        }
        
        try {
            await this.renderMusicCards(this.recentSongs, 'recent-songs-grid', isMobile);
        } catch (error) {
            console.error('Error rendering recent songs:', error);
        }
    }

    /**
     * Validates the music data structure
     * @param {Object} data - The music data to validate
     * @returns {boolean} - True if data is valid
     */
    validateMusicData(data) {
        if (!data || typeof data !== 'object') {
            console.error('Music data is not an object');
            return false;
        }
        
        if (!Array.isArray(data.favoriteArtists)) {
            console.error('favoriteArtists is not an array');
            return false;
        }
        
        if (!Array.isArray(data.favoriteSongs)) {
            console.error('favoriteSongs is not an array');
            return false;
        }
        
        if (!Array.isArray(data.recentSongs)) {
            console.error('recentSongs is not an array');
            return false;
        }
        
        // Validate artist structure
        for (let i = 0; i < data.favoriteArtists.length; i++) {
            const artist = data.favoriteArtists[i];
            if (!artist.url || !artist.name || !artist.thumbnail) {
                console.error(`Artist at index ${i} is missing required fields`, artist);
                return false;
            }
        }
        
        // Validate song URL structure
        const allSongs = [...data.favoriteSongs, ...data.recentSongs];
        for (let i = 0; i < allSongs.length; i++) {
            const songUrl = allSongs[i];
            if (typeof songUrl !== 'string' || !songUrl.includes('youtube.com/watch')) {
                console.error(`Song URL at index ${i} is invalid`, songUrl);
                return false;
            }
        }
        
        console.log('Music data validation passed');
        return true;
    }

    /**
     * Loads fallback data if JSON file fails to load
     */
    loadFallbackData() {
        console.warn('Using fallback data - JSON file failed to load');
        // You can add minimal fallback data here if needed, or just show an error
        this.favoriteArtists = [];
        this.favoriteSongs = [];
        this.recentSongs = [];
    }

    /**
     * Detect if user is on a mobile device
     * @returns {boolean} - True if user is on mobile device
     */
    isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Fetches metadata from the oEmbed API. Handles both videos and channels.
     * @param {string} youtubeUrl - The URL of the YouTube video or channel.
     * @returns {Promise<Object|null>} - A promise that resolves to the metadata or null on error.
     */
    async fetchMetadata(youtubeUrl) {
        // Try to get cached data first
        const cachedData = this.getCachedMetadata(youtubeUrl);
        if (cachedData) {
            return cachedData;
        }
        
        // Try multiple endpoints
        for (const endpoint of this.oEmbedEndpoints) {
            try {
                // Special handling for YouTube channels
                const urlToFetch = youtubeUrl;
                
                // If this is a channel URL and we're using YouTube's oEmbed, we need to convert it
                if (youtubeUrl.includes('/channel/') && endpoint.includes('youtube.com/oembed')) {
                    // For channels, we'll try to get a video from the channel as a workaround
                    // This is a limitation of YouTube's oEmbed API
                    console.warn(`YouTube oEmbed doesn't support channels directly. Skipping endpoint for ${youtubeUrl}`);
                    continue;
                }
                
                const response = await fetch(`${endpoint}${encodeURIComponent(urlToFetch)}`);
                
                // If we get a 404 or other error, continue to next endpoint
                if (!response.ok) {
                    console.warn(`Failed to fetch metadata from ${endpoint} for ${youtubeUrl}: ${response.status} ${response.statusText}`);
                    continue;
                }
                
                const data = await response.json();
                
                // If there's an error in the response, continue to next endpoint
                if (data.error) {
                    console.warn(`Error in response from ${endpoint} for ${youtubeUrl}: ${data.error}`);
                    continue;
                }
                
                // Cache the data
                this.cacheMetadata(youtubeUrl, data);
                
                return data;
            } catch (error) {
                Utils.handleApiError(error, `fetching oEmbed data for ${youtubeUrl} from ${endpoint}`);
                // Continue to next endpoint
            }
        }
        
        // If all endpoints failed, return null
        return null;
    }

    /**
     * Creates an HTML music card element.
     * @param {Object} metadata - The video metadata (title, author_name, thumbnail_url).
     * @param {string} youtubeUrl - The original YouTube URL for the card link.
     * @returns {HTMLElement} - The created music card element.
     */
    createMusicCard(metadata, youtubeUrl) {
        const cardLink = document.createElement('a');
        cardLink.href = youtubeUrl;
        cardLink.target = '_blank';
        cardLink.rel = 'noopener noreferrer';
        cardLink.classList.add(
            'music-card',
            'glass-container',
            'p-4',
            'flex',
            'flex-col',
            'items-center',
            'text-center',
            'transition-all',
            'duration-300',
            'hover:translate-y-[-5px]',
            'hover:shadow-lg',
            'hover:shadow-sky-500/20',
            'rounded-xl' // Added rounded-xl for consistency with other elements
        );

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('thumbnail-wrapper', 'w-full', 'mb-4', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700');

        const thumbnail = document.createElement('img');
        thumbnail.src = metadata.thumbnail_url || 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail';
        thumbnail.alt = metadata.title || 'Unknown Title';
        thumbnail.loading = 'lazy';
        thumbnail.width = 320;
        thumbnail.height = 180;
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'cover';
        
        // Add error handling for thumbnail
        thumbnail.onerror = function() {
            this.src = 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail';
            this.onerror = null; // Prevent infinite loop
        };

        thumbnailWrapper.appendChild(thumbnail);

        const title = document.createElement('h4');
        title.textContent = metadata.title || 'Unknown Title';
        title.classList.add('text-white', 'font-semibold', 'text-lg', 'mb-1');

        const artist = document.createElement('p');
        artist.textContent = metadata.author_name || 'Unknown Artist';
        artist.classList.add('text-slate-400', 'text-sm');

        cardLink.appendChild(thumbnailWrapper);
        cardLink.appendChild(title);
        cardLink.appendChild(artist);

        return cardLink;
    }

    /**
     * Creates an HTML channel card element.
     * @param {Object} metadata - The channel metadata (title, author_name, thumbnail_url).
     * @param {string} youtubeUrl - The original YouTube URL for the card link.
     * @returns {HTMLElement} - The created channel card element.
     */
    createChannelCard(metadata, youtubeUrl) {
        const cardLink = document.createElement('a');
        cardLink.href = youtubeUrl;
        cardLink.target = '_blank';
        cardLink.rel = 'noopener noreferrer';
        cardLink.classList.add(
            'music-card',
            'glass-container',
            'p-4',
            'flex',
            'flex-col',
            'items-center',
            'text-center',
            'transition-all',
            'duration-300',
            'hover:translate-y-[-5px]',
            'hover:shadow-lg',
            'hover:shadow-sky-500/20',
            'rounded-xl'
        );

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('thumbnail-wrapper', 'w-full', 'mb-4', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700');

        const thumbnail = document.createElement('img');
        // Use the provided thumbnail or a fallback
        thumbnail.src = metadata.thumbnail_url || 'https://placehold.co/320x180/00000000/00000000?text=Channel'; // Transparent placeholder
        thumbnail.alt = metadata.title || metadata.author_name || 'Channel';
        thumbnail.loading = 'lazy';
        thumbnail.width = 320;
        thumbnail.height = 180;
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'cover';
        
        // Add error handling for thumbnail
        thumbnail.onerror = function() {
            // If the real thumbnail fails, show a transparent placeholder
            this.src = 'https://placehold.co/320x180/00000000/00000000?text=Channel';
            this.onerror = null; // Prevent infinite loop
        };

        thumbnailWrapper.appendChild(thumbnail);

        const title = document.createElement('h4');
        // Use the title or fallback to other metadata fields
        title.textContent = metadata.title || metadata.author_name || metadata.provider_name || 'Unknown Channel';
        title.classList.add('text-white', 'font-semibold', 'text-lg', 'mb-1');

        const type = document.createElement('p');
        type.textContent = 'Channel';
        type.classList.add('text-slate-400', 'text-sm');

        cardLink.appendChild(thumbnailWrapper);
        cardLink.appendChild(title);
        cardLink.appendChild(type);

        return cardLink;
    }

    /**
     * Renders artist cards for a given array of artists into a specified container.
     * @param {Array} artists - An array of artist objects with url, name, and thumbnail properties.
     * @param {string} containerId - The ID of the HTML element to append cards to.
     * @param {boolean} isMobile - Whether the user is on a mobile device
     */
    async renderArtistCards(artists, containerId, isMobile = false) {
        console.log(`Rendering ${artists.length} artists to ${containerId}`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Clear existing content or show a loading indicator if desired
        container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>'; // Show spinner while loading

        // For mobile, limit to 2 rows of 2 cards each (4 cards total) for better performance
        // This reduces the number of API calls and improves rendering speed on mobile devices
        const artistsToShow = isMobile ? artists.slice(0, 4) : artists;
        console.log(`Showing ${artistsToShow.length} artists (mobile: ${isMobile})`);

        const cardPromises = artistsToShow.map(async (artist) => {
            try {
                // Directly create a card with the manually specified thumbnail
                // No need to fetch metadata since we already have all the information
                return this.createChannelCard({
                    title: artist.name, 
                    author_name: artist.name, 
                    provider_name: 'YouTube',
                    thumbnail_url: artist.thumbnail
                }, artist.url);
            } catch (error) {
                console.error(`Error creating card for ${artist.name}:`, error);
                // Even in case of error, create a fallback card
                return this.createChannelCard({
                    title: artist.name, 
                    author_name: artist.name, 
                    provider_name: 'YouTube',
                    thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=Channel'
                }, artist.url);
            }
        });

        try {
            const cards = await Promise.all(cardPromises);
            container.innerHTML = ''; // Clear spinner
            
            // Set up mobile-specific grid layout
            if (isMobile) {
                container.classList.add('mobile-music-grid');
                container.classList.remove('music-grid');
            } else {
                container.classList.add('music-grid');
                container.classList.remove('mobile-music-grid');
            }
            
            cards.forEach(card => {
                if (card) {
                    container.appendChild(card);
                }
            });
            
            console.log(`Successfully rendered ${cards.filter(c => c).length} artist cards to ${containerId}`);
        } catch (error) {
            console.error(`Error rendering artist cards for container ${containerId}:`, error);
            // Show error message
            container.innerHTML = '<p class="text-center text-red-400">Failed to load artist content.</p>';
        }
    }

    /**
     * Renders music cards for a given array of song URLs into a specified container.
     * @param {Array} songUrls - An array of YouTube video URLs.
     * @param {string} containerId - The ID of the HTML element to append cards to.
     * @param {boolean} isMobile - Whether the user is on a mobile device
     */
    async renderMusicCards(songUrls, containerId, isMobile = false) {
        console.log(`Rendering ${songUrls.length} songs to ${containerId}`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Clear existing content or show a loading indicator if desired
        container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>'; // Show spinner while loading

        // For mobile, limit to 2 rows of 2 cards each (4 cards total) for better performance
        // This reduces the number of API calls and improves rendering speed on mobile devices
        const urlsToShow = isMobile ? songUrls.slice(0, 4) : songUrls;
        console.log(`Showing ${urlsToShow.length} songs (mobile: ${isMobile})`);

        const cardPromises = urlsToShow.map(async (url) => {
            try {
                const metadata = await this.fetchMetadata(url);
                if (metadata) {
                    // Create a music card with the fetched metadata
                    return this.createMusicCard(metadata, url);
                } else {
                    // Create a fallback card
                    const videoMatch = url.match(/watch\?v=([\w-]+)/);
                    const videoId = videoMatch ? videoMatch[1] : 'Unknown Song';
                    return this.createMusicCard({
                        title: videoId,
                        author_name: 'Unknown Artist',
                        thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail'
                    }, url);
                }
            } catch (error) {
                console.error(`Error creating card for ${url}:`, error);
                // Even in case of error, create a fallback card
                const videoMatch = url.match(/watch\?v=([\w-]+)/);
                const videoId = videoMatch ? videoMatch[1] : 'Unknown Song';
                return this.createMusicCard({
                    title: videoId,
                    author_name: 'Unknown Artist',
                    thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail'
                }, url);
            }
        });

        try {
            const cards = await Promise.all(cardPromises);
            container.innerHTML = ''; // Clear spinner
            
            // Set up mobile-specific grid layout
            if (isMobile) {
                container.classList.add('mobile-music-grid');
                container.classList.remove('music-grid');
            } else {
                container.classList.add('music-grid');
                container.classList.remove('mobile-music-grid');
            }
            
            cards.forEach((card, index) => {
                if (card) {
                    // Add debugging information for the recently enjoyed section
                    if (containerId === 'recent-songs-grid') {
                        console.log(`Card ${index} for recently enjoyed:`, card);
                    }
                    container.appendChild(card);
                }
            });
            
            console.log(`Successfully rendered ${cards.filter(c => c).length} music cards to ${containerId}`);
        } catch (error) {
            console.error(`Error rendering cards for container ${containerId}:`, error);
            // Show error message
            container.innerHTML = '<p class="text-center text-red-400">Failed to load music content.</p>';
        }
    }

    /**
     * Cache metadata in localStorage
     * @param {string} url - The YouTube URL
     * @param {Object} data - The metadata to cache
     */
    cacheMetadata(url, data) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${url}`;
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            // Silently fail if localStorage is not available or quota is exceeded
            console.warn(`Failed to cache metadata for ${url}:`, error);
        }
    }

    /**
     * Get cached metadata from localStorage
     * @param {string} url - The YouTube URL
     * @returns {Object|null} The cached metadata or null if not available
     */
    getCachedMetadata(url) {
        try {
            const cacheKey = `${this.CACHE_PREFIX}:${url}`;
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp > this.CACHE_DURATION) {
                // Remove expired cache
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            // Silently fail if parsing fails
            console.warn(`Failed to get cached metadata for ${url}:`, error);
            return null;
        }
    }
}