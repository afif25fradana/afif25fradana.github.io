/**
 * Cache manager utility for handling localStorage caching
 */
export class CacheManager {
    /**
     * Create a cache manager
     * @param {string} prefix - Prefix for cache keys
     * @param {number} duration - Cache duration in milliseconds
     */
    constructor(prefix, duration) {
        this.prefix = prefix;
        this.duration = duration;
    }

    /**
     * Generate cache key for a given URL
     * @param {string} url - The URL to generate a cache key for
     * @returns {string} - The cache key
     */
    getCacheKey(url) {
        return `${this.prefix}:${url}`;
    }

    /**
     * Cache data in localStorage
     * @param {string} url - The URL associated with the data
     * @param {Object} data - The data to cache
     */
    set(url, data) {
        try {
            const cacheKey = this.getCacheKey(url);
            const cacheData = {
                data: data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            // Silently fail if localStorage is not available or quota is exceeded
            console.warn(`Failed to cache data for ${url}:`, error);
        }
    }

    /**
     * Get cached data from localStorage
     * @param {string} url - The URL associated with the cached data
     * @returns {Object|null} The cached data or null if not available
     */
    get(url) {
        try {
            const cacheKey = this.getCacheKey(url);
            const cached = localStorage.getItem(cacheKey);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp > this.duration) {
                // Remove expired cache
                localStorage.removeItem(cacheKey);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            // Silently fail if parsing fails
            console.warn(`Failed to get cached data for ${url}:`, error);
            return null;
        }
    }
}