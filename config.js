// Configuration file for the portfolio website
const CONFIG = {
  // GitHub username for fetching repositories
  GITHUB_USERNAME: 'afif25fradana',
  
  // API endpoints
  API_ENDPOINTS: {
    GITHUB_REPOS: (username) => `https://api.github.com/users/${username}/repos?sort=updated&direction=desc`
  },
  
  // Animation settings
  ANIMATION: {
    STARFIELD: {
      NUM_STARS: 150,
      NUM_SHOOTING_STARS: 2
    }
  },
  
  // UI settings
  UI: {
    BACK_TO_TOP_THRESHOLD: 300, // pixels
    SECTION_INTERSECTION_THRESHOLD: 0.1 // 10% visibility
  }
};

// Make it available globally
window.CONFIG = CONFIG;