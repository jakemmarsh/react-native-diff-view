const path = require('path');
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  ...tsjPreset,
  preset: 'react-native',
  globals: {
    'ts-jest': {
      babelConfig: true,
      tsConfig: 'tsconfig.json',
      diagnostics: {
        warnOnly: true,
      },
    },
    window: {},
  },
  testMatch: ['<rootDir>/src/**/?(*.)+(test).(j|t)s?(x)'],
  testPathIgnorePatterns: ['\\.snap$', '<rootDir>/node_modules/'],
  rootDir: '.',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  modulePaths: [path.resolve(__dirname, '..'), 'node_modules'],
  cacheDirectory: '.jest/cache',
  transform: {
    ...tsjPreset.transform,
    '^.+\\.js$': '<rootDir>/node_modules/react-native/jest/preprocessor.js',
  },
  transformIgnorePatterns: ['node_modules/(?!(jest-)?react-native)'],
  verbose: false,
};
