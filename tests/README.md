# Tests

This directory contains unit tests for the JavaScript code in the portfolio website.

## Running Tests

To run the tests, open the test files in a browser or Node.js environment:
- `tests/utils.test.js` - Tests for utility functions
- `tests/github.test.js` - Tests for GitHubFetcher class

## Test Coverage

Currently, tests cover:
- `Utils.debounce` function
- `Utils.formatErrorMessage` function
- `GitHubFetcher` class constructor
- `GitHubFetcher.cacheRepos` method
- `GitHubFetcher.getCachedRepos` method

## Adding More Tests

To add more tests, follow the pattern in the existing test files:

```javascript
test('Test description', () => {
    // Test implementation
    assertEqual(actual, expected, 'Assertion message');
});
```

## Future Improvements

For a more comprehensive testing setup, consider:

1. Using a testing framework like Jest or Mocha
2. Adding tests for:
   - MusicCardGenerator class
   - Starfield class
   - UI class
3. Implementing DOM mocking for more realistic tests
4. Adding continuous integration to run tests automatically
5. Adding code coverage analysis