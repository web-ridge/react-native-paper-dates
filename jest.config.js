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
  coverageThreshold: {
    global: {
      branches: 93,
      functions: 92,
      lines: 96,
      statements: 95,
    },
  },
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
