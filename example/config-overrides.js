// config-overrides.js
const {
  addWebpackAlias,
  babelInclude,
  fixBabelImports,
  override,
  removeModuleScopePlugin,
} = require('customize-cra');
const { addReactRefresh } = require('customize-cra-react-refresh');

const path = require('path');

module.exports = override(
  addReactRefresh(),
  fixBabelImports('module-resolver', {
    alias: {
      '^react-native$': 'react-native-web',
    },
  }),
  addWebpackAlias({
    'react-native': 'react-native-web',

    // here you can add extra packages
  }),
  babelInclude([
    path.resolve('src'),
    path.resolve('app.json'),
    path.resolve('./node_modules/react-native-vector-icons'),
    path.resolve('../src'),
    // any react-native modules you need babel to compile
  ]),
  removeModuleScopePlugin()
);
