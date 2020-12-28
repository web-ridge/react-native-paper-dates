// config-overrides.js
const {
  addWebpackAlias,
  babelInclude,
  fixBabelImports,
  override,
  removeModuleScopePlugin,
} = require('customize-cra');

const pak = require('../package.json');
const path = require('path');
console.log({ name: pak.name, source: pak.source });
module.exports = override(
  fixBabelImports('module-resolver', {
    alias: {
      '^react-native$': 'react-native-web',

      [pak.name]: path.join(__dirname, '..', pak.source),
      // react: '../node_modules/react',
      // 'react-dom': '../node_modules/react-dom',
      // 'create-react-class': '../node_modules/create-react-class',
      // 'react-native-web': '../node_modules/react-native-web',
    },
  }),
  addWebpackAlias({
    'react-native': 'react-native-web',
    [pak.name]: path.join(__dirname, '..', pak.source),
    // react: '../node_modules/react',
    // 'react-dom': '../node_modules/react-dom',
    // 'create-react-class': '../node_modules/create-react-class',
    // 'react-native-web': '../node_modules/react-native-web',
    // here you can add extra packages
  }),
  babelInclude([
    path.resolve('src'),
    path.resolve('app.json'),

    // any react-native modules you need babel to compile
    path.resolve('./node_modules/react-native-vector-icons'),
    path.resolve('../src'),
  ]),
  removeModuleScopePlugin()
);
