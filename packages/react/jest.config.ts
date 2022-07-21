/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
    '@rely/core': '<rootDir>/../core',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  transformIgnorePatterns: [
    '../core'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  verbose: true
};