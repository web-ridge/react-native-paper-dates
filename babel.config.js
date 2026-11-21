module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', { target: '19' }],
    'react-native-worklets/plugin',
  ],
  presets: ['module:@react-native/babel-preset'],
}
