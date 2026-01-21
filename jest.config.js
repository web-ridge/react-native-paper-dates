process.env.TZ = 'GMT'

module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native(-.*)?|color|color-string|color-name|color-convert)/)',
  ],
  setupFiles: ['<rootDir>/testSetup.js'],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/**',
    '!**/src/__tests__/**',
    '!**/example/**',
    '!**/translations/**',
  ],
}
