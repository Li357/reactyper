module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/node_modules/jest-css-modules',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!src/index.tsx',
    '!**/node_modules/**',
  ],
};