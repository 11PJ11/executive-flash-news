/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

// Mock Forge API modules for testing
jest.mock('@forge/api', () => ({
  api: {
    fetch: jest.fn(),
    asUser: jest.fn(() => ({
      requestJira: jest.fn()
    }))
  }
}));

jest.mock('@forge/ui', () => ({
  render: jest.fn(),
  Fragment: 'Fragment',
  Text: 'Text',
  Strong: 'Strong',
  useProductContext: jest.fn(),
  useState: jest.fn(),
  useEffect: jest.fn()
}));

// Mock @forge/bridge - optional dependency for testing
try {
  jest.mock('@forge/bridge', () => ({
    invoke: jest.fn()
  }));
} catch (error) {
  // @forge/bridge not available in test environment
}

// Global test utilities
global.mockForgeContext = {
  accountId: 'test-user-123',
  cloudId: 'test-cloud-456'
};

// Global test data
global.testData = {
  defaultWelcomeMessage: {
    message: 'Welcome to Executive Flash News Plugin',
    version: 'v1.0.0',
    isExecutive: false,
    timestamp: '2024-01-15T10:30:00.000Z'
  },
  executiveUser: {
    id: 'exec-123',
    role: 'CEO',
    displayName: 'John Executive',
    isExecutive: true
  },
  regularUser: {
    id: 'user-456',
    role: 'User',
    displayName: 'Jane User',
    isExecutive: false
  }
};

// Console error suppression for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});