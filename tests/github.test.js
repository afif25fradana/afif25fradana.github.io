// Mock DOM environment for testing
// In a real testing environment, you would use a framework like Jest or Mocha

// Simple test framework
const tests = [];
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

function assertEqual(actual, expected, message = '') {
    if (actual === expected) {
        console.log(`✓ ${message || `Expected ${expected}, got ${actual}`}`);
        passedTests++;
    } else {
        console.error(`✗ ${message || `Expected ${expected}, got ${actual}`}`);
        failedTests++;
    }
}

function assertThrows(fn, message = '') {
    try {
        fn();
        console.error(`✗ ${message || 'Expected function to throw'}`);
        failedTests++;
    } catch (e) {
        console.log(`✓ ${message || 'Function threw as expected'}`);
        passedTests++;
    }
}

// Mock localStorage for testing
const mockLocalStorage = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

// Mock console.warn to capture warnings
const originalWarn = console.warn;
const warnings = [];
console.warn = (...args) => {
    warnings.push(args);
    originalWarn.apply(console, args);
};

// Mock GitHubFetcher class for testing
class GitHubFetcher {
    constructor() {
        this.container = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.CACHE_KEY = 'github_repos';
        this.CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    }
    
    // Mock cache methods
    cacheRepos(repos) {
        try {
            const cacheData = {
                data: repos,
                timestamp: Date.now()
            };
            localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        } catch (error) {
            console.warn('Failed to cache GitHub repositories:', error);
        }
    }
    
    getCachedRepos() {
        try {
            const cached = localStorage.getItem(this.CACHE_KEY);
            if (!cached) return null;
            
            const cacheData = JSON.parse(cached);
            
            // Check if cache is still valid
            if (Date.now() - cacheData.timestamp > this.CACHE_DURATION) {
                // Remove expired cache
                localStorage.removeItem(this.CACHE_KEY);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.warn('Failed to get cached GitHub repositories:', error);
            return null;
        }
    }
}

// Test GitHubFetcher constructor
test('GitHubFetcher constructor should set default properties', () => {
    const fetcher = new GitHubFetcher();
    assertEqual(fetcher.retryCount, 0, 'retryCount should be 0');
    assertEqual(fetcher.maxRetries, 3, 'maxRetries should be 3');
    assertEqual(fetcher.CACHE_KEY, 'github_repos', 'CACHE_KEY should be github_repos');
    assertEqual(fetcher.CACHE_DURATION, 600000, 'CACHE_DURATION should be 600000 (10 minutes)');
});

// Test cacheRepos method
test('cacheRepos should store data in localStorage', () => {
    // Mock localStorage
    global.localStorage = mockLocalStorage;
    mockLocalStorage.clear();
    
    const fetcher = new GitHubFetcher();
    const testData = [{ id: 1, name: 'test-repo' }];
    
    fetcher.cacheRepos(testData);
    
    const cached = localStorage.getItem('github_repos');
    assertEqual(cached !== null, true, 'Data should be stored in localStorage');
    
    const parsed = JSON.parse(cached);
    assertEqual(parsed.data.length, 1, 'Should store one repo');
    assertEqual(parsed.data[0].name, 'test-repo', 'Should store correct repo name');
});

// Test getCachedRepos with valid cache
test('getCachedRepos should return cached data when valid', () => {
    // Mock localStorage
    global.localStorage = mockLocalStorage;
    mockLocalStorage.clear();
    
    const fetcher = new GitHubFetcher();
    const testData = [{ id: 1, name: 'test-repo' }];
    
    // Manually set up cache
    const cacheData = {
        data: testData,
        timestamp: Date.now()
    };
    localStorage.setItem('github_repos', JSON.stringify(cacheData));
    
    const result = fetcher.getCachedRepos();
    assertEqual(result !== null, true, 'Should return cached data');
    assertEqual(result.length, 1, 'Should return one repo');
    assertEqual(result[0].name, 'test-repo', 'Should return correct repo name');
});

// Test getCachedRepos with expired cache
test('getCachedRepos should return null when cache is expired', () => {
    // Mock localStorage
    global.localStorage = mockLocalStorage;
    mockLocalStorage.clear();
    
    const fetcher = new GitHubFetcher();
    
    // Manually set up expired cache
    const cacheData = {
        data: [{ id: 1, name: 'test-repo' }],
        timestamp: Date.now() - (15 * 60 * 1000) // 15 minutes ago
    };
    localStorage.setItem('github_repos', JSON.stringify(cacheData));
    
    const result = fetcher.getCachedRepos();
    assertEqual(result, null, 'Should return null for expired cache');
    
    // Check that expired cache was removed
    const cached = localStorage.getItem('github_repos');
    assertEqual(cached, null, 'Expired cache should be removed');
});

// Run tests
async function runTests() {
    console.log('Running GitHubFetcher tests...\n');
    
    for (const { name, fn } of tests) {
        console.log(`Running: ${name}`);
        try {
            await fn();
        } catch (e) {
            console.error(`✗ ${name} failed with error:`, e);
            failedTests++;
        }
        console.log('');
    }
    
    console.log(`\nGitHubFetcher Test Results:`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total: ${passedTests + failedTests}`);
    
    // Restore console.warn
    console.warn = originalWarn;
}

// Run tests
runTests();