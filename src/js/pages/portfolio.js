// Portfolio page specific functionality
import { GitHubFetcher } from '../components/github.js';

/**
 * Initializes portfolio page functionality
 */
export function initPortfolioPage() {
    const githubFetcher = new GitHubFetcher();
    githubFetcher.fetchRepos();
}