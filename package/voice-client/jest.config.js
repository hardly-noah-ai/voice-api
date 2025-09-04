/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['<rootDir>/build/', '<rootDir>/cdk.out/'],
  transformIgnorePatterns: ['/node_modules/(?!(@noah-ai))/'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!**/index.ts'],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
};
