module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '\\.css$': '<rootDir>/node_modules/jest-css-modules',
  },
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!src/index.tsx',
    '!**/node_modules/**',
  ],
};