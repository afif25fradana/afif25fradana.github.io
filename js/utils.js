// Utility functions for error handling and other common tasks

/**
 * Utility class for common functions
 */
export class Utils {
    /**
     * Handle API errors by logging them to the console
     * @param {Error} error - The error object
     * @param {string} context - Context where the error occurred
     */
    static handleApiError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        // In a more advanced implementation, we could send this to a logging service
    }

    /**
     * Create a debounced function that delays execution
     * @param {Function} func - The function to debounce
     * @param {number} delay - The delay in milliseconds
     * @returns {Function} - The debounced function
     */
    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Sanitize error messages to prevent XSS
     * @param {string} message - The message to sanitize
     * @returns {string} - The sanitized message
     */
    static formatErrorMessage(message) {
        // Sanitize error messages to prevent XSS
        const div = document.createElement('div');
        div.textContent = message;
        return div.innerHTML;
    }
}