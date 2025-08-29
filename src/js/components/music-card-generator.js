// Music card generation functionality
import { Utils } from '../components/utils.js'; // Import Utils for error handling
import { DeviceDetector } from './device-detector.js'; // Import device detection utility
import { CacheManager } from './cache-manager.js'; // Import cache management utility
import { DataValidator } from './data-validator.js'; // Import data validation utility

/**
 * Class for generating and rendering music cards from YouTube links.
 */
export class MusicCardGenerator {
    constructor() {
        // Initialize empty arrays for music data
        this.favoriteArtists = [];
        this.favoriteSongs = [];
        this.recentSongs = [];
        this.playlists = [];
        
        // Multiple oEmbed endpoints for better reliability
        this.oEmbedEndpoints = [
            'https://www.youtube.com/oembed?url=',  // Primary YouTube oEmbed
            'https://noembed.com/embed?url='        // Fallback
        ];
        
        // Initialize cache manager
        this.cacheManager = new CacheManager('music_data', 15 * 60 * 1000); // 15 minutes
    }

    /**
     * Initializes the music card generation by rendering all categories.
     */
    async init() {
        // Load music data from JSON file
        try {
            const response = await fetch('./src/data/music.json');
            if (!response.ok) {
                throw new Error(`Failed to load music data: ${response.status} ${response.statusText}`);
            }
            const musicData = await response.json();
            
            console.log('Music data loaded successfully:', musicData);
            
            // Validate the loaded data
            if (!DataValidator.validateMusicData(musicData)) {
                throw new Error('Invalid music data structure');
            }
            
            this.favoriteArtists = musicData.favoriteArtists;
            this.favoriteSongs = musicData.favoriteSongs;
            this.recentSongs = musicData.recentSongs;
            this.playlists = musicData.playlists || [];
            
            console.log('Favorite artists count:', this.favoriteArtists.length);
            console.log('Favorite songs count:', this.favoriteSongs.length);
            console.log('Recent songs count:', this.recentSongs.length);
            console.log('Playlists count:', this.playlists.length);
        } catch (error) {
            console.error('Error loading music data:', error);
            // Fallback to empty data if JSON file fails to load
            this.loadFallbackData();
        }
        
        // Detect if user is on mobile device
        const isMobile = DeviceDetector.isMobileDevice();
        
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
        
        // Render playlists if they exist
        if (this.playlists.length > 0) {
            try {
                await this.renderPlaylistCards(this.playlists, 'playlists-grid', isMobile);
            } catch (error) {
                console.error('Error rendering playlists:', error);
            }
        }
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
        this.playlists = [];
    }

    /**
     * Fetches metadata from the oEmbed API. Handles both videos and channels.
     * @param {string} youtubeUrl - The URL of the YouTube video or channel.
     * @returns {Promise<Object|null>} - A promise that resolves to the metadata or null on error.
     */
    async fetchMetadata(youtubeUrl) {
        // Try to get cached data first
        const cachedData = this.cacheManager.get(youtubeUrl);
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
                this.cacheManager.set(youtubeUrl, data);
                
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
        // Use lower resolution thumbnail (mqdefault = 320x180, scaled to 250x140)
        let thumbnailUrl = metadata.thumbnail_url || 'https://placehold.co/250x140/00000000/00000000?text=No+Thumbnail';
        if (thumbnailUrl.includes('ytimg.com/') && thumbnailUrl.includes('/vi/')) {
            // Convert to mqdefault (320x180) and scale down for smaller file size
            if (thumbnailUrl.includes('hqdefault.jpg') || thumbnailUrl.includes('sddefault.jpg') || 
                thumbnailUrl.includes('maxresdefault.jpg')) {
                thumbnailUrl = thumbnailUrl.replace(/\/(hqdefault|sddefault|maxresdefault)\.jpg/, '/mqdefault.jpg');
            }
        }
        thumbnail.src = thumbnailUrl;
        thumbnail.alt = metadata.title || 'Unknown Title';
        thumbnail.loading = 'lazy';
        thumbnail.width = 250;
        thumbnail.height = 140; // 16:9 aspect ratio at 250px width
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'cover';
        
        // Add error handling for thumbnail
        thumbnail.onerror = function() {
            this.src = 'https://placehold.co/250x140/00000000/00000000?text=No+Thumbnail';
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
        // Set aspect ratio to 1:1 for channel thumbnails
        thumbnailWrapper.style.aspectRatio = '1/1';

        const thumbnail = document.createElement('img');
        // Use the provided thumbnail or a fallback
        let thumbnailUrl = metadata.thumbnail_url || 'https://placehold.co/250x250/00000000/00000000?text=Channel'; // Square placeholder at 250x250
        // For channel thumbnails, we'll try to use a smaller version if possible
        if (thumbnailUrl.includes('ytimg.com/') && thumbnailUrl.includes('=s')) {
            // Try to reduce size if it's a ytimg URL with size parameter
            thumbnailUrl = thumbnailUrl.replace(/=s\d+/, '=s250'); // Use 250px width
        }
        thumbnail.src = thumbnailUrl;
        thumbnail.alt = metadata.title || metadata.author_name || 'Channel';
        thumbnail.loading = 'lazy';
        thumbnail.width = 250;
        thumbnail.height = 250; // Square dimensions at 250x250
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'cover';
        
        // Add error handling for thumbnail
        thumbnail.onerror = function() {
            // If the real thumbnail fails, show a transparent placeholder
            this.src = 'https://placehold.co/250x250/00000000/00000000?text=Channel';
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
     * Creates an HTML playlist card element with custom thumbnail and track count.
     * @param {Object} playlist - The playlist data (url, title, thumbnail, trackCount).
     * @returns {HTMLElement} - The created playlist card element.
     */
    createPlaylistCard(playlist) {
        const cardLink = document.createElement('a');
        cardLink.href = playlist.url;
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
            'rounded-xl',
            'relative'
        );

        // Add playlist badge
        const badge = document.createElement('div');
        badge.classList.add('absolute', 'top-2', 'right-2', 'bg-purple-500', 'text-white', 'text-xs', 'font-bold', 'px-2', 'py-1', 'rounded-full', 'z-10');
        badge.textContent = 'PLAYLIST';
        
        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('thumbnail-wrapper', 'w-full', 'mb-4', 'rounded-lg', 'overflow-hidden', 'border', 'border-slate-700', 'relative');

        const thumbnail = document.createElement('img');
        // Use lower resolution thumbnail
        let thumbnailUrl = playlist.thumbnail || 'https://placehold.co/250x140/00000000/00000000?text=Playlist';
        if (thumbnailUrl.includes('ytimg.com/') && thumbnailUrl.includes('/vi/')) {
            // Convert to mqdefault (320x180) for better quality than default
            thumbnailUrl = thumbnailUrl.replace(/\/(default|hqdefault|sddefault|maxresdefault)\.jpg/, '/mqdefault.jpg');
        }
        thumbnail.src = thumbnailUrl;
        thumbnail.alt = playlist.title || 'Unknown Playlist';
        thumbnail.loading = 'lazy';
        thumbnail.width = 250;
        thumbnail.height = 140; // 16:9 aspect ratio at 250px width
        thumbnail.style.width = '100%';
        thumbnail.style.height = '100%';
        thumbnail.style.objectFit = 'cover';
        
        // Add error handling for thumbnail
        thumbnail.onerror = function() {
            this.src = 'https://placehold.co/250x140/00000000/00000000?text=Playlist';
            this.onerror = null; // Prevent infinite loop
        };

        // Add play icon overlay
        const playOverlay = document.createElement('div');
        playOverlay.classList.add('absolute', 'inset-0', 'flex', 'items-center', 'justify-center', 'bg-black', 'bg-opacity-30', 'opacity-0', 'hover:opacity-100', 'transition-opacity', 'duration-300');
        const playIcon = document.createElement('i');
        playIcon.classList.add('fas', 'fa-play-circle', 'text-white', 'text-4xl');
        playOverlay.appendChild(playIcon);
        
        thumbnailWrapper.appendChild(thumbnail);
        thumbnailWrapper.appendChild(playOverlay);

        const title = document.createElement('h4');
        title.textContent = playlist.title || 'Unknown Playlist';
        title.classList.add('text-white', 'font-semibold', 'text-lg', 'mb-1');

        // Add track count
        const trackInfo = document.createElement('p');
        trackInfo.classList.add('text-slate-400', 'text-sm', 'mb-1');
        trackInfo.textContent = `${playlist.trackCount} tracks`;

        // Add "Made by Afif"
        const creatorInfo = document.createElement('p');
        creatorInfo.classList.add('text-slate-500', 'text-xs');
        creatorInfo.textContent = 'Made by Afif Fradana';

        cardLink.appendChild(badge);
        cardLink.appendChild(thumbnailWrapper);
        cardLink.appendChild(title);
        cardLink.appendChild(trackInfo);
        cardLink.appendChild(creatorInfo);

        return cardLink;
    }

    /**
     * Renders playlist cards for a given array of playlists into a specified container.
     * @param {Array} playlists - An array of playlist objects with url, title, thumbnail, and trackCount properties.
     * @param {string} containerId - The ID of the HTML element to append cards to.
     * @param {boolean} isMobile - Whether the user is on a mobile device
     */
    async renderPlaylistCards(playlists, containerId, isMobile = false) {
        console.log(`Rendering ${playlists.length} playlists to ${containerId}`);
        
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container with ID "${containerId}" not found.`);
            return;
        }

        // Clear existing content or show a loading indicator if desired
        container.innerHTML = '<div class="loading-spinner mx-auto my-8"></div>'; // Show spinner while loading

        // For mobile, limit to 2 rows of 2 cards each (4 cards total) for better performance
        const playlistsToShow = isMobile ? playlists.slice(0, 4) : playlists;
        console.log(`Showing ${playlistsToShow.length} playlists (mobile: ${isMobile})`);

        try {
            // For each playlist, we can optionally fetch the title from oEmbed to ensure it's up to date
            const enhancedPlaylists = await Promise.all(playlistsToShow.map(async (playlist) => {
                try {
                    // Try to fetch updated metadata from oEmbed
                    const metadata = await this.fetchMetadata(playlist.url);
                    if (metadata && metadata.title) {
                        // Use the fetched title but keep our custom thumbnail and track count
                        return {
                            ...playlist,
                            title: metadata.title
                        };
                    } else {
                        // If fetch fails, use the data we have
                        return playlist;
                    }
                } catch (error) {
                    console.warn(`Failed to fetch metadata for playlist ${playlist.url}, using provided data:`, error);
                    // If fetch fails, use the data we have
                    return playlist;
                }
            }));

            const cards = enhancedPlaylists.map(playlist => {
                try {
                    return this.createPlaylistCard(playlist);
                } catch (error) {
                    console.error(`Error creating card for playlist ${playlist.title}:`, error);
                    // Create a fallback card
                    return this.createPlaylistCard({
                        url: playlist.url,
                        title: playlist.title || 'Unknown Playlist',
                        thumbnail: playlist.thumbnail || 'https://placehold.co/320x180/00000000/00000000?text=Playlist',
                        trackCount: playlist.trackCount || 0
                    });
                }
            });

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
            
            console.log(`Successfully rendered ${cards.filter(c => c).length} playlist cards to ${containerId}`);
        } catch (error) {
            console.error(`Error rendering playlist cards for container ${containerId}:`, error);
            // Show error message
            container.innerHTML = '<p class="text-center text-red-400">Failed to load playlist content.</p>';
        }
    }
}