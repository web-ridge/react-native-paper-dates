module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', { target: '19' }],
    'react-native-worklets/plugin',
  ],
  presets: ['react-native-builder-bob/babel-preset'],
}
