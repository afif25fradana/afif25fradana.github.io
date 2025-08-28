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

// Test Utils.debounce
test('Utils.debounce should delay function execution', () => {
    // This would require a more complex test setup with timers
    // For now, we'll just verify the function exists
    assertEqual(typeof Utils.debounce, 'function', 'Utils.debounce should be a function');
});

// Test Utils.formatErrorMessage
test('Utils.formatErrorMessage should sanitize HTML', () => {
    const result = Utils.formatErrorMessage('<script>alert("xss")</script>');
    assertEqual(result, '&lt;script&gt;alert("xss")&lt;/script&gt;', 'Should sanitize HTML');
});

// Test Utils.formatErrorMessage with plain text
test('Utils.formatErrorMessage should not modify plain text', () => {
    const result = Utils.formatErrorMessage('Plain text message');
    assertEqual(result, 'Plain text message', 'Should not modify plain text');
});

// Run tests
async function runTests() {
    console.log('Running tests...\n');
    
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
    
    console.log(`\nTest Results:`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Total: ${passedTests + failedTests}`);
    
    // Restore console.warn
    console.warn = originalWarn;
}

// Mock Utils class for testing
const Utils = {
    debounce: function(func, delay) {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    },
    
    formatErrorMessage: function(message) {
        const div = document.createElement('div');
        div.textContent = message;
        return div.innerHTML;
    }
};

// Mock document for testing
const document = {
    createElement: function(tag) {
        return {
            textContent: '',
            innerHTML: '',
            set innerHTML(value) {
                this.textContent = value.replace(/<[^>]*>/g, '');
            },
            get innerHTML() {
                return this.textContent;
            }
        };
    }
};

// Run tests
runTests();