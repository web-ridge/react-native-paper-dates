process.env.TZ = 'GMT'

module.exports = {
  collectCoverage: false,
  collectCoverageFrom: [
    '**/src/**',
    '!**/src/__tests__/**',
    '!**/src/testUtils.tsx',
    '!**/example/**',
    '!**/translations/**',
  ],
  coverageReporters: ['clover', 'json', 'lcov', ['text', { skipEmpty: true }]],
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  setupFiles: ['<rootDir>/testSetup.js'],
  transform: {
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|ttf|webp)$':
      require.resolve('@react-native/jest-preset/jest/assetFileTransformer.js'),
    '^.+\\.(js|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|@react-native-vector-icons|react-native(-.*)?|react-native-reanimated|react-native-worklets)/)',
  ],
  watchman: false,
}
