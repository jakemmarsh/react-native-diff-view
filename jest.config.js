const path = require('path');

module.exports = {
  preset: 'react-native',
  globals: {
    'ts-jest': {
      babelConfig: true,
      tsConfig: 'tsconfig.test.json',
      diagnostics: {
        warnOnly: true,
      },
    },
    window: {},
  },
  testMatch: ['<rootDir>/src/**/?(*.)+(test).(j|t)s?(x)'],
  testPathIgnorePatterns: ['\\.snap$', '<rootDir>/node_modules/'],
  rootDir: '..',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  modulePaths: [path.resolve(__dirname, '..'), 'node_modules'],
  cacheDirectory: '.jest/cache',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native)',
  ],
  verbose: false,
};
