/**
 * Utility class for data validation
 */
export class DataValidator {
    /**
     * Validates the hobbies data structure
     * @param {Object} data - The hobbies data to validate
     * @returns {boolean} - True if data is valid
     */
    static validateHobbiesData(data) {
        if (!data || typeof data !== 'object') {
            console.error('Hobbies data is not an object');
            return false;
        }
        
        if (!Array.isArray(data.hobbies)) {
            console.error('hobbies is not an array');
            return false;
        }
        
        // Validate hobby structure
        for (let i = 0; i < data.hobbies.length; i++) {
            const hobby = data.hobbies[i];
            if (!hobby.id || !hobby.title || !hobby.icon || !Array.isArray(hobby.images)) {
                console.error(`Hobby at index ${i} is missing required fields`, hobby);
                return false;
            }
            
            // Validate images structure
            for (let j = 0; j < hobby.images.length; j++) {
                const image = hobby.images[j];
                if (!image.url || !image.alt) {
                    console.error(`Image at index ${j} in hobby ${hobby.id} is missing required fields`, image);
                    return false;
                }
            }
        }
        
        console.log('Hobbies data validation passed');
        return true;
    }

    /**
     * Validates the music data structure
     * @param {Object} data - The music data to validate
     * @returns {boolean} - True if data is valid
     */
    static validateMusicData(data) {
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
}