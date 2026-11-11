process.env.TZ = 'GMT'

module.exports = {
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native(-.*)?|color|color-string|color-name|color-convert|react-native-reanimated|react-native-worklets)/)',
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
