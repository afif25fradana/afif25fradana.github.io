// GitHub repository fetching functionality
import { Utils } from './utils.js';

/**
 * Class for fetching and displaying GitHub repositories
 */
export class GitHubFetcher {
    /**
     * Create a GitHubFetcher
     */
    constructor() {
        this.container = document.getElementById('github-repos');
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    /**
     * Fetch repositories from GitHub API
     * @returns {Promise<void>}
     */
    async fetchRepos() {
        if (!this.container) return;

        try {
            // Show loading state
            this.showLoadingState();
            
            const response = await this.fetchWithRetry();
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const repos = await response.json();
            
            // Clear container
            while (this.container.firstChild) {
                this.container.removeChild(this.container.firstChild);
            }

            if (repos.length === 0) {
                this.displayNoReposMessage();
                return;
            }

            this.renderRepos(repos);

        } catch (error) {
            Utils.handleApiError(error, 'GitHub Repositories');
            this.displayErrorMessage();
        }
    }

    /**
     * Show loading state in the container
     */
    showLoadingState() {
        if (!this.container) return;
        
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        // Add loading indicator
        const loadingElement = document.createElement('div');
        loadingElement.className = 'repo-card glass-container p-6 text-slate-300 col-span-full';
        loadingElement.innerHTML = `
            <div class="flex justify-center items-center h-full">
                <div class="loading-spinner"></div>
                <span class="ml-3">Loading projects...</span>
            </div>
        `;
        this.container.appendChild(loadingElement);
    }

    /**
     * Fetch with retry logic for handling rate limits
     * @returns {Promise<Response>}
     */
    async fetchWithRetry() {
        const url = window.CONFIG.API_ENDPOINTS.GITHUB_REPOS(window.CONFIG.GITHUB_USERNAME);
        
        while (this.retryCount <= this.maxRetries) {
            try {
                const response = await fetch(url);
                
                // If we get a 403 rate limit error, wait and retry
                if (response.status === 403 && this.retryCount < this.maxRetries) {
                    // Wait for a bit before retrying (GitHub rate limit)
                    await this.wait(2000 * (this.retryCount + 1));
                    this.retryCount++;
                    continue;
                }
                
                return response;
            } catch (error) {
                if (this.retryCount >= this.maxRetries) {
                    throw error;
                }
                await this.wait(1000 * (this.retryCount + 1));
                this.retryCount++;
            }
        }
    }

    /**
     * Wait for a specified number of milliseconds
     * @param {number} ms - Milliseconds to wait
     * @returns {Promise<void>}
     */
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Display message when no repositories are found
     */
    displayNoReposMessage() {
        const noReposElement = document.createElement('p');
        noReposElement.className = 'text-slate-400 text-center col-span-full';
        noReposElement.textContent = 'No public repositories found.';
        this.container.appendChild(noReposElement);
    }

    /**
     * Display error message when fetching fails
     */
    displayErrorMessage() {
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        const errorElement = document.createElement('div');
        errorElement.className = 'repo-card glass-container p-6 text-slate-300 col-span-full';
        errorElement.innerHTML = `
            <div class="text-center">
                <p class="text-red-400 mb-4">Failed to load repositories. Please try again later.</p>
                <button id="retry-button" class="link-button px-4 py-2">Retry</button>
            </div>
        `;
        this.container.appendChild(errorElement);
        
        // Add event listener to retry button
        const retryButton = document.getElementById('retry-button');
        if (retryButton) {
            retryButton.addEventListener('click', () => {
                this.retryCount = 0; // Reset retry count
                this.fetchRepos();
            });
        }
    }

    /**
     * Render repositories in the container
     * @param {Array} repos - Array of repository objects
     */
    renderRepos(repos) {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Filter out forked repositories if desired (optional enhancement)
        const filteredRepos = repos.filter(repo => !repo.fork);
        
        // If no repos after filtering, show message
        if (filteredRepos.length === 0) {
            this.displayNoReposMessage();
            return;
        }
        
        filteredRepos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card glass-container p-6 text-slate-300';
            
            const title = document.createElement('h3');
            title.className = 'text-xl font-semibold text-white mb-2';
            title.textContent = Utils.formatErrorMessage(repo.name);
            
            const description = document.createElement('p');
            description.className = 'text-sm mb-4';
            description.textContent = Utils.formatErrorMessage(repo.description) || 'No description provided.';
            
            const topicsContainer = document.createElement('div');
            topicsContainer.className = 'flex flex-wrap gap-2 mb-4';
            
            if (repo.language) {
                const languageBadge = document.createElement('span');
                languageBadge.className = 'skill-badge';
                languageBadge.textContent = Utils.formatErrorMessage(repo.language);
                topicsContainer.appendChild(languageBadge);
            }
            
            if (repo.topics) {
                repo.topics.forEach(topic => {
                    const topicBadge = document.createElement('span');
                    topicBadge.className = 'skill-badge';
                    topicBadge.textContent = Utils.formatErrorMessage(topic);
                    topicsContainer.appendChild(topicBadge);
                });
            }
            
            const link = document.createElement('a');
            link.href = repo.html_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.className = 'text-sky-400 hover:text-sky-300 transition-colors duration-300';
            link.textContent = 'View Project ';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-external-link-alt ml-1';
            link.appendChild(icon);
            
            repoCard.appendChild(title);
            repoCard.appendChild(description);
            repoCard.appendChild(topicsContainer);
            repoCard.appendChild(link);
            
            fragment.appendChild(repoCard);
        });
        
        // Clear container before appending new content
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        this.container.appendChild(fragment);
    }
}