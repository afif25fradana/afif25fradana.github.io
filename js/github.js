// GitHub repository fetching functionality
import { Utils } from './utils.js';

export class GitHubFetcher {
    constructor() {
        this.container = document.getElementById('github-repos');
        this.retryCount = 0;
        this.maxRetries = 3;
    }

    async fetchRepos() {
        if (!this.container) return;

        try {
            const response = await this.fetchWithRetry();
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }
            const repos = await response.json();
            
            // Clear placeholder
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

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    displayNoReposMessage() {
        const noReposElement = document.createElement('p');
        noReposElement.className = 'text-slate-400 text-center col-span-full';
        noReposElement.textContent = 'No public repositories found.';
        this.container.appendChild(noReposElement);
    }

    displayErrorMessage() {
        // Clear container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        
        const errorElement = document.createElement('p');
        errorElement.className = 'text-red-400 text-center col-span-full';
        errorElement.textContent = 'Failed to load repositories. Please try again later.';
        this.container.appendChild(errorElement);
    }

    renderRepos(repos) {
        // Create document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        // Filter out forked repositories if desired (optional enhancement)
        const filteredRepos = repos.filter(repo => !repo.fork);
        
        filteredRepos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card glass-container p-6 text-slate-300';
            
            const topicsHtml = repo.topics ? repo.topics.map(topic => `<span class="skill-badge">${Utils.formatErrorMessage(topic)}</span>`).join('') : '';
            
            repoCard.innerHTML = `
                <h3 class="text-xl font-semibold text-white mb-2">${Utils.formatErrorMessage(repo.name)}</h3>
                <p class="text-sm mb-4">${Utils.formatErrorMessage(repo.description) || 'No description provided.'}</p>
                <div class="flex flex-wrap gap-2 mb-4">
                    ${repo.language ? `<span class="skill-badge">${Utils.formatErrorMessage(repo.language)}</span>` : ''}
                    ${topicsHtml}
                </div>
                <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 transition-colors duration-300">View Project <i class="fas fa-external-link-alt ml-1"></i></a>
            `;
            
            fragment.appendChild(repoCard);
        });
        
        this.container.appendChild(fragment);
    }
}