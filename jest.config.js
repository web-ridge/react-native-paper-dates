process.env.TZ = 'GMT'

module.exports = {
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  watchman: false,
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipEmpty: true }]],
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transform: {
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|ttf|webp)$':
      require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|@react-native-vector-icons|react-native(-.*)?|color|color-string|color-name|color-convert|react-native-reanimated|react-native-worklets)/)',
  ],
  setupFiles: ['<rootDir>/testSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**',
    '!**/src/__tests__/**',
    '!**/src/testUtils.tsx',
    '!**/example/**',
    '!**/translations/**',
  ],
}
