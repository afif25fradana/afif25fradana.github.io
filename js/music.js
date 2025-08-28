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
        // Convert all artist URLs to standard YouTube channel URLs for better oEmbed support
        // Include artist names and real thumbnails for better control
        this.favoriteArtists = [
            { url: 'https://www.youtube.com/channel/UCUt2uP6O_UBJp4aBx5KjQjA', name: 'Porter Robinson', thumbnail: 'https://yt3.googleusercontent.com/1V3GGb8hMKP_9-kpCEI5mD6eFoGBeZwkIbFLGB-vxRGYSodgsq6LNEoRINcDE5OL-_UqzdVbbg=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UCGz-eguN8tcic5kUG4s1ZgA', name: 'Tame Impala', thumbnail: 'https://yt3.googleusercontent.com/CjdWr6hZl7lqbczfbUgMjb-w1WI-LXbOtolQT_OEbKmelMQVzL8cvm5jZrvqoKP2b24GYYoD=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UC1gXK5ZV0phthXSPLZLC9-g', name: 'David Kushner', thumbnail: 'https://yt3.googleusercontent.com/dAzw8pdl4-VzT-3MLfkZsWQzktHBCU2esoEIkeI5Xv7BudgoefIh54jgzz_YcxlBVveN5HEhx64=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UCGNMi-3h6Tx72EfbW6f2BxQ', name: 'Bring Me the Horizon', thumbnail: 'https://yt3.googleusercontent.com/bQjkkbEvkGbQdGaqrZrDa7d2FY0gtfDV674zh0QrhgrkXwEzGCNb0tx3-doqEMvyPOWY6SH6pTo=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UCrSBEipSJ9lwLWO05GK6dRA', name: 'Wisp', thumbnail: 'https://yt3.googleusercontent.com/NXf6NFhq84jqJxCcG_2ip_ibkLAaO_4K0GB5d_8n0JuL8Kq5GLs2jfSHLqM2mygXwMjvxG6f=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UC5DHwv9N4OQ9AWtKr8YSefw', name: 'Ado', thumbnail: 'https://yt3.googleusercontent.com/UpUTedOaQoww4QObAylZnHN-i1qNDxX-7SXpWRTUt087c5DrUWIkL-TQT9JW3Sxc5rFNIWagE_g=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UCSvdCVniqK4gto1-Kg04Dmg', name: 'Bad Omens', thumbnail: 'https://yt3.googleusercontent.com/KmCz1EXcjCkOXE5f5w7vlrN_Ko1JcMxd3mpR8zACtxHylM6EdLNhY1YPwcu3nQVnsp0wiMN_rA=s320-c-k-c0x00ffffff-no-rj-mo' },
            { url: 'https://www.youtube.com/channel/UCvfXczqN3XcopEh8SAZ_DNA', name: 'iRis.EXE', thumbnail: 'https://yt3.googleusercontent.com/iJHM_DfSN_AppXtt_KF-o3d02EkZ43oWkFFlrz8rZ2CBzL9HmIwmgpdVnkeM_6K9UgzZCAscj-U=s320-c-k-c0x00ffffff-no-rj-mo' }
        ];

        // Keep song URLs as YouTube Music since they work fine
        this.favoriteSongsLinks = [
            'https://music.youtube.com/watch?v=CzJbz9qSsd0&si=TehFiZR90GH-QhNH', // Cheerleader
            'https://music.youtube.com/watch?v=tEXYfT_G0W0&si=540M9AXBz9HKl_Jq', // New Person, Same Old Mistakes
            'https://music.youtube.com/watch?v=Y1gswBe-DjM&si=2TwvmkIqynPkhi39', // Daylight
            'https://music.youtube.com/watch?v=1-Fxb9jsOuI&si=btNxDTHNe8HdvbOb', // Suffocation
            'https://music.youtube.com/watch?v=lzMkFIw8ETM&si=1AJNmymNtRQVkTBC', // Knock Yourself Out XD
            'https://music.youtube.com/watch?v=7b4iCpp45gM&si=NcEerI-D6ILsd03t', // Just Pretend
            'https://music.youtube.com/watch?v=r2mzPDG72f0&si=Yx6jZ93nyaDmP08r', // OMEN
            'https://music.youtube.com/watch?v=Y5YCwPmRcdo&si=tifamUzbCfO6zzhS'  // sanctuary
        ];

        this.recentSongsLinks = [
            'https://music.youtube.com/watch?v=GWoK3HULCLo&si=L9zz2jeuLLqzlRbQ', // Helium
            'https://music.youtube.com/watch?v=0pn-hZ2lNO8&si=0k8S5Q7r_l-19cQV', // amen.
            'https://music.youtube.com/watch?v=wPqTMRYtyMw&si=xzNh__piweLmN-gz', // SOLANA
            'https://music.youtube.com/watch?v=0bwZQkusdd0&si=g_EzXuru2rqIBJpY', // ETA
            'https://music.youtube.com/watch?v=OtejracPJm4&si=Yn1ssJFN2iWh1Szm', // eepY.EXE
            'https://music.youtube.com/watch?v=3SjRcth6ko8&si=pTzN_6MOCBgDYvrY', // 桜日和とタイムマシン with 初音ミク
            'https://music.youtube.com/watch?v=6yufjxveDSg&si=d7nvQK_f0eP_Ec_Q', // tell you straight
            'https://music.youtube.com/watch?v=eZXKCiUMRlc&si=ecihMYCjpRb4EAbl'  // emotion engine
        ];

        // Multiple oEmbed endpoints for better reliability
        this.oEmbedEndpoints = [
            'https://www.youtube.com/oembed?url=',  // Primary YouTube oEmbed
            'https://noembed.com/embed?url='        // Fallback
        ];
    }

    /**
     * Initializes the music card generation by rendering all categories.
     */
    async init() {
        try {
            await this.renderArtistCards(this.favoriteArtists, 'favorite-artists-grid');
        } catch (error) {
            console.error('Error rendering favorite artists:', error);
        }
        
        try {
            await this.renderMusicCards(this.favoriteSongsLinks, 'favorite-songs-grid');
        } catch (error) {
            console.error('Error rendering favorite songs:', error);
        }
        
        try {
            await this.renderMusicCards(this.recentSongsLinks, 'recent-songs-grid');
        } catch (error) {
            console.error('Error rendering recent songs:', error);
        }
    }

    /**
     * Fetches metadata from the oEmbed API. Handles both videos and channels.
     * @param {string} youtubeUrl - The URL of the YouTube video or channel.
     * @returns {Promise<Object|null>} - A promise that resolves to the metadata or null on error.
     */
    async fetchMetadata(youtubeUrl) {
        // Try multiple endpoints
        for (const endpoint of this.oEmbedEndpoints) {
            try {
                // Special handling for YouTube channels
                let urlToFetch = youtubeUrl;
                
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
                    console.warn(`Failed to fetch metadata from ${endpoint} for ${youtubeUrl}: ${response.status}`);
                    continue;
                }
                
                const data = await response.json();
                
                // If there's an error in the response, continue to next endpoint
                if (data.error) {
                    console.warn(`Error in response from ${endpoint} for ${youtubeUrl}: ${data.error}`);
                    continue;
                }
                
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
        thumbnailWrapper.classList.add('w-full', 'aspect-w-16', 'aspect-h-9', 'mb-4', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700'); // Added border and rounded-lg

        const thumbnail = document.createElement('img');
        thumbnail.src = metadata.thumbnail_url || 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail';
        thumbnail.alt = metadata.title || 'Unknown Title';
        thumbnail.classList.add('w-full', 'h-full', 'object-cover', 'bg-black'); // Added bg-black for consistency
        thumbnail.loading = 'lazy';
        
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
        thumbnailWrapper.classList.add('w-full', 'aspect-w-16', 'aspect-h-9', 'mb-4', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700'); // Changed to match music card dimensions

        const thumbnail = document.createElement('img');
        // Use the provided thumbnail or a fallback
        thumbnail.src = metadata.thumbnail_url || 'https://placehold.co/320x180/00000000/00000000?text=Channel'; // Transparent placeholder
        thumbnail.alt = metadata.title || metadata.author_name || 'Channel';
        thumbnail.classList.add('w-full', 'h-full', 'object-contain', 'bg-black'); // Changed to object-contain to show full image
        thumbnail.loading = 'lazy';
        
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
     */
    async renderArtistCards(artists, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Clear existing content or show a loading indicator if desired
        container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>'; // Show spinner while loading

        const cardPromises = artists.map(async (artist) => {
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
            cards.forEach(card => {
                if (card) {
                    container.appendChild(card);
                }
            });
        } catch (error) {
            console.error(`Error rendering artist cards for container ${containerId}:`, error);
            // Show error message
            container.innerHTML = '<p class="text-center text-red-400">Failed to load artist content.</p>';
        }
    }

    /**
     * Renders music cards for a given array of links into a specified container.
     * @param {string[]} linksArray - An array of YouTube video or channel URLs.
     * @param {string} containerId - The ID of the HTML element to append cards to.
     */
    async renderMusicCards(linksArray, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Clear existing content or show a loading indicator if desired
        container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>'; // Show spinner while loading

        const cardPromises = linksArray.map(async (url) => {
            try {
                const metadata = await this.fetchMetadata(url);
                if (metadata) {
                    // Check if this is a channel URL
                    if (url.includes('/channel/')) {
                        return this.createChannelCard(metadata, url);
                    } else {
                        return this.createMusicCard(metadata, url);
                    }
                } else {
                    // Create a fallback card with better information
                    if (url.includes('/channel/')) {
                        // Extract channel name from URL as fallback
                        const channelMatch = url.match(/\/channel\/([\w-]+)/);
                        const channelId = channelMatch ? channelMatch[1] : 'Unknown Channel';
                        return this.createChannelCard({title: channelId, author_name: channelId, provider_name: 'YouTube', thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=Channel'}, url);
                    } else {
                        // Extract video title from URL as fallback
                        const videoMatch = url.match(/watch\?v=([\w-]+)/);
                        const videoId = videoMatch ? videoMatch[1] : 'Unknown Song';
                        return this.createMusicCard({title: videoId, author_name: 'Unknown Artist', thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail'}, url);
                    }
                }
            } catch (error) {
                console.error(`Error creating card for ${url}:`, error);
                // Even in case of error, create a fallback card
                if (url.includes('/channel/')) {
                    const channelMatch = url.match(/\/channel\/([\w-]+)/);
                    const channelId = channelMatch ? channelMatch[1] : 'Unknown Channel';
                    return this.createChannelCard({title: channelId, author_name: channelId, provider_name: 'YouTube', thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=Channel'}, url);
                } else {
                    const videoMatch = url.match(/watch\?v=([\w-]+)/);
                    const videoId = videoMatch ? videoMatch[1] : 'Unknown Song';
                    return this.createMusicCard({title: videoId, author_name: 'Unknown Artist', thumbnail_url: 'https://placehold.co/320x180/00000000/00000000?text=No+Thumbnail'}, url);
                }
            }
        });

        try {
            const cards = await Promise.all(cardPromises);
            container.innerHTML = ''; // Clear spinner
            cards.forEach(card => {
                if (card) {
                    container.appendChild(card);
                }
            });
        } catch (error) {
            console.error(`Error rendering cards for container ${containerId}:`, error);
            // Show error message
            container.innerHTML = '<p class="text-center text-red-400">Failed to load music content.</p>';
        }
    }
}
