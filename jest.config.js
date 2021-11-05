module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  transformIgnorePatterns: [
    '/node_modules/(?!(@react-native|react-native|react-native-iphone-x-helper)/)',
  ],
}
