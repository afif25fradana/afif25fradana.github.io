// Utility functions for error handling and other common tasks
export class Utils {
    static handleApiError(error, context = '') {
        console.error(`API Error ${context}:`, error);
        // In a more advanced implementation, we could send this to a logging service
    }

    static debounce(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    static formatErrorMessage(message) {
        // Sanitize error messages to prevent XSS
        const div = document.createElement('div');
        div.textContent = message;
        return div.innerHTML;
    }
}