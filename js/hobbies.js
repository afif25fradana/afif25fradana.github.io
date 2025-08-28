// Hobbies functionality

/**
 * Class for generating and rendering hobbies cards from JSON data.
 */
export class HobbiesGenerator {
    /**
     * Create a HobbiesGenerator
     */
    constructor() {
        this.hobbies = [];
    }

    /**
     * Initializes the hobbies generation by rendering all categories.
     */
    async init() {
        // Load hobbies data from JSON file
        try {
            const response = await fetch('hobbies-data.json');
            if (!response.ok) {
                throw new Error(`Failed to load hobbies data: ${response.status} ${response.statusText}`);
            }
            const hobbiesData = await response.json();
            
            console.log('Hobbies data loaded successfully:', hobbiesData);
            
            // Validate the loaded data
            if (!this.validateHobbiesData(hobbiesData)) {
                throw new Error('Invalid hobbies data structure');
            }
            
            this.hobbies = hobbiesData.hobbies;
            
            console.log('Hobbies count:', this.hobbies.length);
        } catch (error) {
            console.error('Error loading hobbies data:', error);
            // Fallback to empty data if JSON file fails to load
            this.hobbies = [];
        }
        
        try {
            await this.renderHobbies();
        } catch (error) {
            console.error('Error rendering hobbies:', error);
        }
    }

    /**
     * Validates the hobbies data structure
     * @param {Object} data - The hobbies data to validate
     * @returns {boolean} - True if data is valid
     */
    validateHobbiesData(data) {
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
     * Renders hobbies into the container
     */
    async renderHobbies() {
        const container = document.getElementById('hobbies-grid');
        if (!container) {
            console.warn('Hobbies container not found.');
            return;
        }

        // Show loading state
        this.showLoadingState(container);

        try {
            // Clear container
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }

            if (this.hobbies.length === 0) {
                this.displayNoHobbiesMessage(container);
                return;
            }

            this.renderHobbyCards(container);

        } catch (error) {
            console.error('Error rendering hobbies:', error);
            this.displayErrorMessage(container);
        }
    }

    /**
     * Show loading state in the container
     * @param {HTMLElement} container - The container element
     */
    showLoadingState(container) {
        if (!container) return;
        
        // Clear container
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Add loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'hobby-card glass-container p-6 md:p-8 text-slate-300 col-span-full';
        loadingElement.innerHTML = `
            <div class="flex justify-center items-center h-full">
                <div class="loading-spinner"></div>
                <span class="ml-3">Loading hobbies...</span>
            </div>
        `;
        container.appendChild(loadingElement);
    }

    /**
     * Display message when no hobbies are found
     * @param {HTMLElement} container - The container element
     */
    displayNoHobbiesMessage(container) {
        const noHobbiesElement = document.createElement('p');
        noHobbiesElement.className = 'text-slate-400 text-center col-span-full';
        noHobbiesElement.textContent = 'No hobbies found.';
        container.appendChild(noHobbiesElement);
    }

    /**
     * Display error message when fetching fails
     * @param {HTMLElement} container - The container element
     */
    displayErrorMessage(container) {
        // Clear container
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        const errorElement = document.createElement('div');
        errorElement.className = 'hobby-card glass-container p-6 md:p-8 text-slate-300 col-span-full';
        errorElement.innerHTML = `
            <div class="text-center">
                <p class="text-red-400 mb-4">Failed to load hobbies. Please try again later.</p>
            </div>
        `;
        container.appendChild(errorElement);
    }

    /**
     * Render hobby cards in the container
     * @param {HTMLElement} container - The container element
     */
    renderHobbyCards(container) {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        this.hobbies.forEach(hobby => {
            const hobbyCard = document.createElement('div');
            hobbyCard.className = 'hobby-card glass-container p-6 md:p-8 animated-element animate-fadeIn';
            
            const title = document.createElement('h3');
            title.className = 'section-title';
            
            // Create icon element with proper color handling
            const iconElement = document.createElement('i');
            iconElement.setAttribute('aria-hidden', 'true');
            
            // Split icon classes and apply them
            const iconClasses = hobby.icon.split(' ');
            const colorClasses = [];
            
            iconClasses.forEach(cls => {
                if (cls.startsWith('text-')) {
                    colorClasses.push(cls);
                } else {
                    iconElement.classList.add(cls);
                }
            });
            
            // Apply color classes with higher specificity
            if (colorClasses.length > 0) {
                // Map Tailwind color classes to actual colors
                const colorMap = {
                    'text-blue-400': '#60a5fa',
                    'text-gray-400': '#9ca3af',
                    'text-purple-400': '#a78bfa',
                    'text-green-400': '#4ade80'
                };
                
                const colorClass = colorClasses[0];
                if (colorMap[colorClass]) {
                    iconElement.style.color = colorMap[colorClass];
                }
            }
            
            title.appendChild(iconElement);
            title.appendChild(document.createTextNode(` ${hobby.title}`));
            
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'space-y-4';
            
            hobby.images.forEach(image => {
                const img = document.createElement('img');
                img.src = image.url;
                img.alt = image.alt;
                img.className = 'screenshot-img';
                img.loading = 'lazy';
                img.onerror = function() {
                    this.src = 'https://placehold.co/400x225/000000/cbd5e1?text=Image+Not+Found';
                    this.onerror = null; // Prevent infinite loop
                };
                imagesContainer.appendChild(img);
            });
            
            hobbyCard.appendChild(title);
            hobbyCard.appendChild(imagesContainer);
            
            fragment.appendChild(hobbyCard);
        });
        
        // Clear container before appending new content
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        container.appendChild(fragment);
    }
}