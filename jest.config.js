

module.exports = {
  // Other Jest configuration options...
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/rqe/']
};
